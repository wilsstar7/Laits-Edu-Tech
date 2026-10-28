import { assessmentSessionService } from './assessmentSessionService'
import { assessmentAnswerService } from './assessmentAnswerService'
import { personalityService } from './personalityService'
import {
  calculatePersonaModalityResult,
  calculatePersonaPotentialResult,
} from '@/utils/scoring'
import type {
  AssessmentResult,
  DimensionResult,
  PersonalityType,
  StudentLevel,
  AssessmentPackageCode,
} from '@/types/assessment'
import { PRIMARY_ASSESSMENT_ID } from './assessmentService'

export const assessmentScoringService = {
  /**
   * Menghitung skor Persona Modality atau Persona Potential kumulatif sesuai algoritma,
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
    const packageCode: AssessmentPackageCode =
      session.package_code || 'PAKET_1_PERSONA_MODALITY'

    const resultId =
      'res-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36)
    const now = new Date().toISOString()

    if (packageCode === 'PAKET_2_PERSONA_POTENTIAL') {
      // Cari hasil Paket 1 sebelumnya dari siswa ini agar tidak perlu mengulang soal Paket 1
      const latestPrev = await personalityService.getLatestResult(session.user_id)
      const historyList = await personalityService.getHistory(session.user_id)
      const prevPaket1Modules =
        latestPrev?.modality_result?.modules ??
        latestPrev?.potential_result?.paket_1_results ??
        historyList.find((r) => r.modality_result?.modules)?.modality_result?.modules

      // Jalankan kalkulasi Paket 2 (MBTI + MI) digabung dengan hasil Paket 1 yang sudah dikerjakan
      const potentialResult = calculatePersonaPotentialResult(
        studentLevel,
        answers,
        prevPaket1Modules
      )
      const p1 = potentialResult.paket_1_results
      const mbti = potentialResult.paket_2_modules.PP_MBTI_02
      const mi = potentialResult.paket_2_modules.PP_MI_03

      const modalityCompat = {
        package_code: 'PAKET_1_PERSONA_MODALITY' as const,
        student_level: studentLevel,
        modules: p1,
      }

      const topGatewayNames = mi.top_3_gateways
        .map((cat) => mi.scores[cat]?.name)
        .filter(Boolean)
        .join(', ')

      const personalityTypeCompat: PersonalityType = {
        id: 'pt-mbti-' + mbti.personality_code.toLowerCase(),
        assessment_id: PRIMARY_ASSESSMENT_ID,
        name: `${mbti.nickname} (${mbti.personality_code})`,
        code: `${mbti.personality_code}_${p1.PM_VAK_01.primary_modality}`,
        description: `${mbti.description} Didukung modalitas sensori ${p1.PM_VAK_01.title}${p1.PM_HEM_02 ? ` serta dominasi belahan otak ${p1.PM_HEM_02.title}` : ''}.`,
        strengths: [
          `Tipe Kepribadian Kognitif: ${mbti.personality_code} (${mbti.title})`,
          `Pintu Gerbang Kecerdasan Utama: ${topGatewayNames}`,
          `Modalitas Sensori: ${p1.PM_VAK_01.title}`,
          ...(p1.PM_SKB_03 ? [`Jam Belajar Produktif: ${p1.PM_SKB_03.clusters.chronobiology.title}`] : []),
        ],
        challenges: [
          ...(p1.PM_SKB_03
            ? [
                `Toleransi Lingkungan: ${p1.PM_SKB_03.clusters.environment.title}`,
                `Rentang Ketahanan Fokus: ${p1.PM_SKB_03.clusters.attention_span.title}`,
              ]
            : []),
          'Sesuaikan metode penyampaian materi dengan pola MBTI agar tidak terjadi bentrok emosional.',
        ],
        learning_style: `${mbti.personality_code} - ${p1.PM_VAK_01.title}`,
        communication_style: mbti.tutor_sop_details[2]?.rule || 'Objektif & Berimbang',
        motivation: mbti.nickname,
        recommended_study_method: [
          ...p1.PM_VAK_01.study_recommendations,
          ...mi.ranking.slice(0, 3).map((r) => `${r.name}: ${r.gateway_strategy}`),
        ],
        recommended_subjects: [
          'Eksplorasi Minat Terbuka Sesuai Top 3 Pintu Gerbang Kecerdasan',
        ],
        recommended_tutor_style: [
          ...mbti.tutor_sop_details.map((d) => `${d.letter} (${d.dimension}): ${d.instruction}`),
          p1.PM_VAK_01.tutor_sop,
          ...(p1.PM_HEM_02 ? [p1.PM_HEM_02.tutor_sop] : []),
        ],
      }

      const dimensionsCompat: DimensionResult[] = [
        {
          id: 'dim-res-mbti',
          result_id: resultId,
          dimension_id: 'dim-mbti-02',
          raw_score: 20,
          normalized_score: 100,
          percentile: null,
          dimension: {
            id: 'dim-mbti-02',
            assessment_id: PRIMARY_ASSESSMENT_ID,
            name: 'Tipologi Kepribadian (MBTI)',
            code: 'PP-MBTI-02',
            description: `${mbti.personality_code}: ${mbti.title}`,
            min_score: 0,
            max_score: 100,
            display_order: 1,
          },
        },
        {
          id: 'dim-res-mi',
          result_id: resultId,
          dimension_id: 'dim-mi-03',
          raw_score: mi.ranking.reduce((acc, curr) => acc + curr.raw, 0),
          normalized_score: mi.ranking[0]?.percentage ?? 100,
          percentile: null,
          dimension: {
            id: 'dim-mi-03',
            assessment_id: PRIMARY_ASSESSMENT_ID,
            name: 'Kecerdasan Majemuk (Multiple Intelligences)',
            code: 'PP-MI-03',
            description: `Top Gateway: ${topGatewayNames}`,
            min_score: 0,
            max_score: 100,
            display_order: 2,
          },
        },
      ]

      const fullResult: AssessmentResult = {
        id: resultId,
        session_id: sessionId,
        user_id: session.user_id,
        assessment_id: session.assessment_id,
        personality_type_id: personalityTypeCompat.id,
        overall_score: 100,
        completed_at: now,
        created_at: now,
        student_level: studentLevel,
        package_code: 'PAKET_2_PERSONA_POTENTIAL',
        target_package_code: session.target_package_code || 'PAKET_2_PERSONA_POTENTIAL',
        modality_result: modalityCompat,
        potential_result: potentialResult,
        personality_type: personalityTypeCompat,
        dimensions: dimensionsCompat,
      }

      await personalityService.saveResult(fullResult)
      await assessmentSessionService.completeSession(sessionId)
      return resultId
    }

    // 3. Jalankan kalkulasi Persona Modality (Paket 1)
    const modalityResult = calculatePersonaModalityResult(studentLevel, answers)

    // 4. Bangun kompatibilitas tipe kepribadian dan dimensi untuk dashboard & reporting
    const vak = modalityResult.modules.PM_VAK_01
    const hem = modalityResult.modules.PM_HEM_02
    const habits = modalityResult.modules.PM_SKB_03

    const strengths: string[] = [
      `Gaya Sensori Utama: ${vak.title}`,
      `Modalitas Dominan: ${vak.primary_modality}${vak.secondary_modality ? ` & ${vak.secondary_modality}` : ''}`,
      `Kategori Dominasi: ${
        vak.dominance_type === 'SINGLE_DOMINANCE'
          ? 'Dominasi Tunggal'
          : vak.dominance_type === 'BIMODAL'
          ? 'Bimodal'
          : 'Multimodal (Seimbang)'
      }`,
    ]
    if (hem) strengths.push(`Orientasi Berpikir: ${hem.title}`)
    if (habits) {
      strengths.push(`Jam Biologis Produktif: ${habits.clusters.chronobiology.title}`)
      strengths.push(`Ketahanan Fokus: ${habits.clusters.attention_span.title}`)
    }

    const challenges: string[] = [
      vak.primary_modality === 'VISUAL'
        ? 'Dapat mudah terdistraksi oleh kekacauan visual di meja atau ruangan belajar.'
        : vak.primary_modality === 'AUDITORY'
        ? 'Sensitif terhadap kebisingan dan obrolan saat mencoba berkonsentrasi membaca.'
        : 'Cepat bosan atau gelisah jika diminta duduk diam mendengarkan penjelasan panjang.',
    ]
    if (habits) {
      challenges.push(`Toleransi Lingkungan: Membutuhkan penataan ruang ${habits.clusters.environment.title}`)
    }

    const recommendedTutorStyle: string[] = [vak.tutor_sop]
    if (hem) recommendedTutorStyle.push(hem.tutor_sop)
    if (habits) {
      recommendedTutorStyle.push(habits.clusters.environment.tutor_sop)
      recommendedTutorStyle.push(habits.clusters.attention_span.tutor_sop)
    }

    const personalityTypeCompat: PersonalityType = {
      id: 'pt-' + vak.primary_modality.toLowerCase(),
      assessment_id: PRIMARY_ASSESSMENT_ID,
      name: hem ? `${vak.title} (${hem.title})` : vak.title,
      code: `${vak.primary_modality}_${vak.dominance_type}`,
      description: hem ? `${vak.summary} Dalam cara berpikir, siswa cenderung ${hem.summary}` : vak.summary,
      strengths,
      challenges,
      learning_style: vak.title,
      communication_style: hem ? hem.title : 'Adaptif & Interaktif',
      motivation: vak.dominance_type === 'MULTIMODAL' ? 'Fleksibilitas Belajar' : 'Metode Sesuai Sensori',
      recommended_study_method: vak.study_recommendations,
      recommended_subjects: [
        vak.primary_modality === 'VISUAL'
          ? 'Matematika Grafis, Sains Visual, Desain, Geometri'
          : vak.primary_modality === 'AUDITORY'
          ? 'Bahasa, Sejarah, Diskusi Sosial, Debat'
          : 'Praktikum Fisika/Kimia, Biologi Eksperimen, Olahraga, Kesenian',
      ],
      recommended_tutor_style: recommendedTutorStyle,
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
          max_score: vak.total_questions,
          display_order: 1,
        },
      },
    ]

    if (hem) {
      dimensionsCompat.push({
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
      })
    }

    if (habits) {
      dimensionsCompat.push({
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
      })
    }

    const overallScore = Math.max(vak.percentages.V, vak.percentages.A, vak.percentages.K)

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
      target_package_code: session.target_package_code || 'PAKET_1_PERSONA_MODALITY',
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
