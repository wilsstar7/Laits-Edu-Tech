import type {
  Assessment,
  AssessmentDimension,
  AssessmentQuestion,
  StudentLevel,
  AssessmentPackageCode,
} from '@/types/assessment'
import {
  ASSESSMENT_PACKAGES,
  type AssessmentPackage,
} from '@/data/personaModalityData'
import { getQuestionsForPackageAndLevel } from '@/data/personaPotentialData'

export const PRIMARY_ASSESSMENT_ID = '00000000-0000-0000-0000-00000000a001'

export const PRIMARY_ASSESSMENT: Assessment = {
  id: PRIMARY_ASSESSMENT_ID,
  name: 'Persona Modality & Potential',
  slug: 'persona-modality',
  description:
    'Pemetaan komprehensif jalur sensori belajar (VAK), dominasi belahan otak berpikir, kebiasaan belajar harian, tipologi MBTI, serta kecerdasan majemuk siswa.',
  instructions:
    'Pilihlah salah satu opsi jawaban yang paling spontan dan nyaman menggambarkan kebiasaan belajarmu apa adanya.',
  estimated_minutes: 25,
  is_active: true,
  version: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const MODALITY_DIMENSIONS: AssessmentDimension[] = [
  {
    id: 'dim-vak-01',
    assessment_id: PRIMARY_ASSESSMENT_ID,
    name: 'Sensory Modality (VAK)',
    code: 'PM-VAK-01',
    description: 'Penerimaan dan pemrosesan informasi (Visual, Auditory, Kinesthetic).',
    min_score: 0,
    max_score: 100,
    display_order: 1,
  },
  {
    id: 'dim-hem-02',
    assessment_id: PRIMARY_ASSESSMENT_ID,
    name: 'Dominasi Hemisfer Otak',
    code: 'PM-HEM-02',
    description: 'Gaya berpikir analitis sekuensial (Kiri) vs intuitif holistik (Kanan).',
    min_score: 0,
    max_score: 100,
    display_order: 2,
  },
  {
    id: 'dim-skb-03',
    assessment_id: PRIMARY_ASSESSMENT_ID,
    name: 'Kebiasaan & Lingkungan Belajar',
    code: 'PM-SKB-03',
    description: 'Jam biologis kognitif, toleransi kebisingan, dan ketahanan rentang fokus.',
    min_score: 0,
    max_score: 100,
    display_order: 3,
  },
  {
    id: 'dim-mbti-02',
    assessment_id: PRIMARY_ASSESSMENT_ID,
    name: 'Tipologi Kepribadian (MBTI)',
    code: 'PP-MBTI-02',
    description: 'Pemrosesan energi kognitif, persepsi data, kriteria keputusan, dan orientasi belajar.',
    min_score: 0,
    max_score: 100,
    display_order: 4,
  },
  {
    id: 'dim-mi-03',
    assessment_id: PRIMARY_ASSESSMENT_ID,
    name: 'Kecerdasan Majemuk (Multiple Intelligences)',
    code: 'PP-MI-03',
    description: 'Pemetaan 8 klaster kecerdasan dasar Howard Gardner dan penentuan gateway belajar.',
    min_score: 0,
    max_score: 100,
    display_order: 5,
  },
]

export const assessmentService = {
  /**
   * Mengambil paket asesmen aktif (Paket 1 atau Paket 2).
   */
  async getActiveAssessment(): Promise<Assessment | null> {
    return PRIMARY_ASSESSMENT
  },

  /**
   * Mengambil katalog 3 paket asesmen sesuai Soal.Md dan soal-paket-2.md.
   */
  getPackages(): AssessmentPackage[] {
    return ASSESSMENT_PACKAGES
  },

  /**
   * Mengambil dimensi modul asesmen.
   */
  async getDimensions(_assessmentId?: string): Promise<AssessmentDimension[]> {
    return MODALITY_DIMENSIONS
  },

  /**
   * Mengambil butir pertanyaan terfilter berdasarkan jenjang siswa dan paket:
   * Paket 1: SD 40, SMP 50, SMA 65
   * Paket 2: SD 100, SMP 110, SMA 125
   */
  async getQuestions(
    _assessmentId?: string,
    level: StudentLevel = 'SMA',
    packageCode: AssessmentPackageCode = 'PAKET_1_PERSONA_MODALITY'
  ): Promise<AssessmentQuestion[]> {
    const questions = getQuestionsForPackageAndLevel(packageCode, level)

    return questions.map((q, idx) => ({
      id: q.id,
      assessment_id: PRIMARY_ASSESSMENT_ID,
      dimension_id:
        q.moduleCode === 'PM-VAK-01'
          ? 'dim-vak-01'
          : q.moduleCode === 'PM-HEM-02'
          ? 'dim-hem-02'
          : q.moduleCode === 'PM-SKB-03'
          ? 'dim-skb-03'
          : q.moduleCode === 'PP-MBTI-02'
          ? 'dim-mbti-02'
          : 'dim-mi-03',
      module_code: q.moduleCode,
      cluster: q.cluster,
      question_text: q.questionText,
      question_type: q.questionType,
      display_order: idx + 1,
      required: true,
      weight: 1,
      reverse_score: false,
      is_active: true,
      levels: q.levels,
      assessment_options: q.options.map((opt, optIdx) => ({
        id: opt.id,
        question_id: q.id,
        label: opt.label,
        value: 'scoreValue' in opt ? (opt as { scoreValue: number }).scoreValue : opt.indicator,
        display_order: optIdx + 1,
        indicator: opt.indicator,
      })),
    }))
  },
}
