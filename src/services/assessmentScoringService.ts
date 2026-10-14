import { assessmentSessionService } from './assessmentSessionService'
import { assessmentAnswerService } from './assessmentAnswerService'
import { personalityService } from './personalityService'
import { calculatePersonaModalityResult } from '@/utils/scoring'
import type { AssessmentResult, DimensionResult, PersonalityType, StudentLevel } from '@/types/assessment'
import { PRIMARY_ASSESSMENT_ID } from './assessmentService'

export const assessmentScoringService = {
  /**
   * Menghitung skor Persona Modality lengkap sesuai algoritma Soal.Md,
   * menyimpan hasil kalkulasi dan mengunci sesi menjadi 'scored'.
   */
  async submitAndScore(sessionId: string): Promise<string> {
    // 1. Ambil data sesi
    const session = await assessmentSessionService.getSessionById(sessionId)
    if (!session) {
      throw new Error('Sesi asesmen tidak ditemukan.')
    }

    // 2. Ambil seluruh jawaban siswa
    const answers = await assessmentAnswerService.getAnswersForSession(sessionId)
    const studentLevel: StudentLevel = session.student_level || 'SMA'

    // 3. Jalankan kalkulasi Persona Modality 3 Modul
    const modalityResult = calculatePersonaModalityResult(studentLevel, answers)

    // 4. Bangun kompatibilitas tipe kepribadian dan dimensi untuk dashboard & reporting
    const vak = modalityResult.modules.PM_VAK_01
    const hem = modalityResult.modules.PM_HEM_02
    const habits = modalityResult.modules.PM_SKB_03

    const resultId = 'res-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36)
    const now = new Date().toISOString()

    const personalityTypeCompat: PersonalityType = {
      id: 'pt-' + vak.primary_modality.toLowerCase(),
      assessment_id: PRIMARY_ASSESSMENT_ID,
      name: `${vak.title} (${hem.title})`,
      code: `${vak.primary_modality}_${hem.dominance_category}`,
      description: `${vak.summary} Dalam cara berpikir, siswa cenderung ${hem.summary}`,
      strengths: [
        `Gaya Sensori: ${vak.title}`,
        `Orientasi Berpikir: ${hem.title}`,
        `Jam Biologis Produktif: ${habits.clusters.chronobiology.title}`,
        `Ketahanan Fokus: ${habits.clusters.attention_span.title}`,
      ],
      challenges: [
        `Toleransi Lingkungan: Membutuhkan penataan ruang ${habits.clusters.environment.title}`,
        'Hindari kejenuhan materi dengan mengadaptasi jeda belajar sesuai rentang fokus.',
      ],
      learning_style: vak.title,
      communication_style: hem.title,
      motivation: habits.clusters.attention_span.title,
      recommended_study_method: vak.study_recommendations,
      recommended_subjects: [
        vak.primary_modality === 'VISUAL'
          ? 'Matematika Grafis, Sains Visual, Desain, Geometri'
          : vak.primary_modality === 'AUDITORY'
          ? 'Bahasa, Sejarah, Diskusi Sosial, Debat'
          : 'Praktikum Fisika/Kimia, Biologi Eksperimen, Olahraga, Kesenian',
      ],
      recommended_tutor_style: [
        vak.tutor_sop,
        hem.tutor_sop,
        habits.clusters.environment.tutor_sop,
        habits.clusters.attention_span.tutor_sop,
      ],
    }

    const dimensionsCompat: DimensionResult[] = [
      {
        id: 'dim-res-1',
        result_id: resultId,
        dimension_id: 'dim-vak-01',
        raw_score: vak.scores.V + vak.scores.A + vak.scores.K,
        normalized_score: Math.max(vak.percentages.V, vak.percentages.A, vak.percentages.K),
        percentile: null,
        dimension: {
          id: 'dim-vak-01',
          assessment_id: PRIMARY_ASSESSMENT_ID,
          name: 'Sensory Modality (VAK)',
          code: 'PM-VAK-01',
          description: vak.title,
          min_score: 0,
          max_score: 100,
          display_order: 1,
        },
      },
      {
        id: 'dim-res-2',
        result_id: resultId,
        dimension_id: 'dim-hem-02',
        raw_score: Math.max(hem.scores.LEFT_BRAIN, hem.scores.RIGHT_BRAIN),
        normalized_score: Math.max(hem.percentages.LEFT_BRAIN, hem.percentages.RIGHT_BRAIN),
        percentile: null,
        dimension: {
          id: 'dim-hem-02',
          assessment_id: PRIMARY_ASSESSMENT_ID,
          name: 'Dominasi Hemisfer Otak',
          code: 'PM-HEM-02',
          description: hem.title,
          min_score: 0,
          max_score: 100,
          display_order: 2,
        },
      },
      {
        id: 'dim-res-3',
        result_id: resultId,
        dimension_id: 'dim-skb-03',
        raw_score: habits.total_questions,
        normalized_score: 100,
        percentile: null,
        dimension: {
          id: 'dim-skb-03',
          assessment_id: PRIMARY_ASSESSMENT_ID,
          name: 'Screening Kebiasaan Belajar',
          code: 'PM-SKB-03',
          description: `${habits.clusters.chronobiology.title} | ${habits.clusters.environment.title} | ${habits.clusters.attention_span.title}`,
          min_score: 0,
          max_score: 100,
          display_order: 3,
        },
      },
    ]

    const overallScore = Math.round(
      (vak.percentages.V +
        vak.percentages.A +
        vak.percentages.K +
        hem.percentages.LEFT_BRAIN +
        hem.percentages.RIGHT_BRAIN) /
        2
    )

    const fullResult: AssessmentResult = {
      id: resultId,
      session_id: sessionId,
      user_id: session.user_id,
      assessment_id: session.assessment_id,
      personality_type_id: personalityTypeCompat.id,
      overall_score: overallScore,
      completed_at: now,
      created_at: now,
      student_level: studentLevel,
      package_code: 'PAKET_1_PERSONA_MODALITY',
      modality_result: modalityResult,
      personality_type: personalityTypeCompat,
      dimensions: dimensionsCompat,
    }

    // 5. Simpan hasil
    await personalityService.saveResult(fullResult)

    // 6. Tandai sesi selesai
    await assessmentSessionService.completeSession(sessionId)

    return resultId
  },
}
