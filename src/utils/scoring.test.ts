import { describe, it, expect } from 'vitest'
import {
  calculateVakScore,
  calculateBrainDominanceScore,
  calculateHabitsScore,
  calculatePersonaModalityResult,
  calculateMbtiScore,
  calculateMultipleIntelligencesScore,
  calculatePersonaPotentialResult,
} from './scoring'
import { getQuestionsForLevel, PERSONA_MODALITY_QUESTIONS } from '@/data/personaModalityData'
import { getQuestionsForPackageAndLevel } from '@/data/personaPotentialData'

describe('Persona Modality Scoring Engine', () => {
  describe('Sensory Modality (VAK - PM-VAK-01)', () => {
    it('detects Single Dominance Visual when V exceeds threshold (>= 53.3% or diff >= 3)', () => {
      const vakQuestions = PERSONA_MODALITY_QUESTIONS.filter((q) => q.moduleCode === 'PM-VAK-01').slice(0, 15)
      const answers: Record<string, string> = {}

      // 10 Visual, 3 Auditory, 2 Kinesthetic out of 15
      vakQuestions.forEach((q, idx) => {
        if (idx < 10) answers[q.id] = 'V'
        else if (idx < 13) answers[q.id] = 'A'
        else answers[q.id] = 'K'
      })

      const result = calculateVakScore(vakQuestions, answers)
      expect(result.dominance_type).toBe('SINGLE_DOMINANCE')
      expect(result.primary_modality).toBe('VISUAL')
      expect(result.secondary_modality).toBeNull()
      expect(result.scores.V).toBe(10)
      expect(result.percentages.V).toBe(66.67)
    })

    it('detects Bimodal when S1 - S2 <= 2 and not multimodal', () => {
      const vakQuestions = PERSONA_MODALITY_QUESTIONS.filter((q) => q.moduleCode === 'PM-VAK-01').slice(0, 15)
      const answers: Record<string, string> = {}

      // 7 Auditory, 6 Visual, 2 Kinesthetic (S1-S2 = 1, but S1-S3 = 5 > 1)
      vakQuestions.forEach((q, idx) => {
        if (idx < 7) answers[q.id] = 'A'
        else if (idx < 13) answers[q.id] = 'V'
        else answers[q.id] = 'K'
      })

      const result = calculateVakScore(vakQuestions, answers)
      expect(result.dominance_type).toBe('BIMODAL')
      expect(result.primary_modality).toBe('AUDITORY')
      expect(result.secondary_modality).toBe('VISUAL')
    })

    it('detects Multimodal when S1 - S3 <= 1 on 15 questions', () => {
      const vakQuestions = PERSONA_MODALITY_QUESTIONS.filter((q) => q.moduleCode === 'PM-VAK-01').slice(0, 15)
      const answers: Record<string, string> = {}

      // 5 V, 5 A, 5 K
      vakQuestions.forEach((q, idx) => {
        if (idx < 5) answers[q.id] = 'V'
        else if (idx < 10) answers[q.id] = 'A'
        else answers[q.id] = 'K'
      })

      const result = calculateVakScore(vakQuestions, answers)
      expect(result.dominance_type).toBe('MULTIMODAL')
      expect(result.primary_modality).toBe('MULTIMODAL')
    })
  })

  describe('Brain Dominance (PM-HEM-02)', () => {
    // Mock questions for isolated scoring engine verification
    const mockHemQuestions = Array.from({ length: 10 }, (_, idx) => ({
      id: `pm-hem-mock-${idx + 1}`,
      number: idx + 1,
      moduleCode: 'PM-HEM-02' as const,
      moduleName: 'Brain Dominance',
      cluster: 'HEM' as const,
      levels: ['SD', 'SMP', 'SMA'] as StudentLevel[],
      questionText: `Pertanyaan Hem ${idx + 1}`,
      options: [
        { id: `opt-l-${idx + 1}`, label: 'A', indicator: 'LEFT_BRAIN' as const },
        { id: `opt-r-${idx + 1}`, label: 'B', indicator: 'RIGHT_BRAIN' as const },
      ],
    }))

    it('detects Left Brain Dominant when percentage > 65%', () => {
      const answers: Record<string, string> = {}

      // 8 Left Brain, 2 Right Brain
      mockHemQuestions.forEach((q, idx) => {
        const leftOpt = q.options.find((opt) => opt.indicator === 'LEFT_BRAIN')!
        const rightOpt = q.options.find((opt) => opt.indicator === 'RIGHT_BRAIN')!
        answers[q.id] = idx < 8 ? leftOpt.id : rightOpt.id
      })

      const result = calculateBrainDominanceScore(mockHemQuestions, answers)
      expect(result.dominance_category).toBe('LEFT_DOMINANT')
      expect(result.tutor_sop_key).toBe('SOP_HEM_LEFT')
      expect(result.percentages.LEFT_BRAIN).toBe(80)
    })

    it('detects Right Brain Dominant when percentage > 65%', () => {
      const answers: Record<string, string> = {}

      // 7 Right Brain, 3 Left Brain (70% > 65%)
      mockHemQuestions.forEach((q, idx) => {
        const leftOpt = q.options.find((opt) => opt.indicator === 'LEFT_BRAIN')!
        const rightOpt = q.options.find((opt) => opt.indicator === 'RIGHT_BRAIN')!
        answers[q.id] = idx < 7 ? rightOpt.id : leftOpt.id
      })

      const result = calculateBrainDominanceScore(mockHemQuestions, answers)
      expect(result.dominance_category).toBe('RIGHT_DOMINANT')
      expect(result.tutor_sop_key).toBe('SOP_HEM_RIGHT')
      expect(result.percentages.RIGHT_BRAIN).toBe(70)
    })

    it('detects Whole-Brain (Seimbang) when both sides <= 65%', () => {
      const answers: Record<string, string> = {}

      // 6 Left Brain (60%), 4 Right Brain (40%)
      mockHemQuestions.forEach((q, idx) => {
        const leftOpt = q.options.find((opt) => opt.indicator === 'LEFT_BRAIN')!
        const rightOpt = q.options.find((opt) => opt.indicator === 'RIGHT_BRAIN')!
        answers[q.id] = idx < 6 ? leftOpt.id : rightOpt.id
      })

      const result = calculateBrainDominanceScore(mockHemQuestions, answers)
      expect(result.dominance_category).toBe('WHOLE_BRAIN')
      expect(result.tutor_sop_key).toBe('SOP_HEM_WHOLE_BRAIN')
    })
  })

  describe('Screening Kebiasaan Belajar (PM-SKB-03)', () => {
    // Mock questions for isolated scoring engine verification
    const mockSkbQuestions = [
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `pm-skb-${String(i + 1).padStart(2, '0')}`,
        number: i + 1,
        moduleCode: 'PM-SKB-03' as const,
        moduleName: 'Habits',
        cluster: 'BIO' as const,
        levels: ['SD', 'SMP', 'SMA'] as StudentLevel[],
        questionText: `Bio ${i + 1}`,
        options: [
          { id: 'A', label: 'A', indicator: 'A' as const },
          { id: 'B', label: 'B', indicator: 'B' as const },
          { id: 'C', label: 'C', indicator: 'C' as const },
        ],
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `pm-skb-${String(i + 6).padStart(2, '0')}`,
        number: i + 6,
        moduleCode: 'PM-SKB-03' as const,
        moduleName: 'Habits',
        cluster: 'ENV' as const,
        levels: ['SD', 'SMP', 'SMA'] as StudentLevel[],
        questionText: `Env ${i + 6}`,
        options: [
          { id: 'A', label: 'A', indicator: 'A' as const },
          { id: 'B', label: 'B', indicator: 'B' as const },
          { id: 'C', label: 'C', indicator: 'C' as const },
        ],
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `pm-skb-${String(i + 11).padStart(2, '0')}`,
        number: i + 11,
        moduleCode: 'PM-SKB-03' as const,
        moduleName: 'Habits',
        cluster: 'FOCUS' as const,
        levels: ['SD', 'SMP', 'SMA'] as StudentLevel[],
        questionText: `Focus ${i + 11}`,
        options: [
          { id: 'A', label: 'A', indicator: 'A' as const },
          { id: 'B', label: 'B', indicator: 'B' as const },
          { id: 'C', label: 'C', indicator: 'C' as const },
        ],
      })),
    ]

    it('produces 3 distinct cluster results with tie-breaker anchor resolution', () => {
      const answers: Record<string, string> = {}

      // BIO Cluster (Soal 1-5): 2A, 2C, 1B (Tie between A and C). Anchor is Soal 1 with choice C
      answers['pm-skb-01'] = 'C' // Anchor says C
      answers['pm-skb-02'] = 'C'
      answers['pm-skb-03'] = 'A'
      answers['pm-skb-04'] = 'A'
      answers['pm-skb-05'] = 'B'

      // ENV Cluster (Soal 6-10): Clear majority A (4 A, 1 B)
      answers['pm-skb-06'] = 'A'
      answers['pm-skb-07'] = 'A'
      answers['pm-skb-08'] = 'A'
      answers['pm-skb-09'] = 'A'
      answers['pm-skb-10'] = 'B'

      // FOCUS Cluster (Soal 11-15): Majority B (3 B, 1 A, 1 C)
      answers['pm-skb-11'] = 'B'
      answers['pm-skb-12'] = 'B'
      answers['pm-skb-13'] = 'B'
      answers['pm-skb-14'] = 'A'
      answers['pm-skb-15'] = 'C'

      const result = calculateHabitsScore(mockSkbQuestions, answers)

      // BIO: Anchor was C, so winner is NIGHT_OWL
      expect(result.clusters.chronobiology.result).toBe('NIGHT_OWL')
      expect(result.clusters.chronobiology.tutor_sop_key).toBe('SOP_BIO_C')

      // ENV: Majority A -> FORMAL_AND_SENSITIVE
      expect(result.clusters.environment.result).toBe('FORMAL_AND_SENSITIVE')
      expect(result.clusters.environment.tutor_sop_key).toBe('SOP_ENV_A')

      // FOCUS: Majority B -> TIPE_POMODORO
      expect(result.clusters.attention_span.result).toBe('TIPE_POMODORO')
      expect(result.clusters.attention_span.tutor_sop_key).toBe('SOP_FOCUS_B')
    })
  })

  describe('Full Persona Modality Level Filtering', () => {
    it('correctly filters questions by level: SD=15, SMP=20, SMA=30', () => {
      const sdQuestions = getQuestionsForLevel('SD')
      expect(sdQuestions.length).toBe(15)

      const smpQuestions = getQuestionsForLevel('SMP')
      expect(smpQuestions.length).toBe(20)

      const smaQuestions = getQuestionsForLevel('SMA')
      expect(smaQuestions.length).toBe(30)
    })

    it('runs calculatePersonaModalityResult without error for SD level', () => {
      const sdQuestions = getQuestionsForLevel('SD')
      const answers: Record<string, string> = {}
      for (const q of sdQuestions) {
        answers[q.id] = q.options[0]!.id
      }

      const fullResult = calculatePersonaModalityResult('SD', answers)
      expect(fullResult.package_code).toBe('PAKET_1_PERSONA_MODALITY')
      expect(fullResult.student_level).toBe('SD')
      expect(fullResult.modules.PM_VAK_01.total_questions).toBe(15)
      expect(fullResult.modules.PM_HEM_02).toBeUndefined()
      expect(fullResult.modules.PM_SKB_03).toBeUndefined()
    })
  })

  describe('Paket 2: Persona Potential Scoring Engine', () => {
    it('calculates MBTI 4-letter type ENFP with majority answers', () => {
      const answers: Record<string, string> = {
        // EI (Soal 1-5): 4 E, 1 I -> E (80%)
        'PP-MBTI-01': 'A',
        'PP-MBTI-02': 'A',
        'PP-MBTI-03': 'A',
        'PP-MBTI-04': 'A',
        'PP-MBTI-05': 'B',
        // SN (Soal 6-10): 1 S, 4 N -> N (80%)
        'PP-MBTI-06': 'A',
        'PP-MBTI-07': 'B',
        'PP-MBTI-08': 'B',
        'PP-MBTI-09': 'B',
        'PP-MBTI-10': 'B',
        // TF (Soal 11-15): 2 T, 3 F -> F (60%)
        'PP-MBTI-11': 'A',
        'PP-MBTI-12': 'A',
        'PP-MBTI-13': 'B',
        'PP-MBTI-14': 'B',
        'PP-MBTI-15': 'B',
        // JP (Soal 16-20): 1 J, 4 P -> P (80%)
        'PP-MBTI-16': 'A',
        'PP-MBTI-17': 'B',
        'PP-MBTI-18': 'B',
        'PP-MBTI-19': 'B',
        'PP-MBTI-20': 'B',
      }

      const result = calculateMbtiScore(answers)

      expect(result.personality_code).toBe('ENFP')
      expect(result.dimensions.EI.dominant).toBe('E')
      expect(result.dimensions.EI.percentage).toBe(80)
      expect(result.dimensions.SN.dominant).toBe('N')
      expect(result.dimensions.SN.percentage).toBe(80)
      expect(result.dimensions.TF.dominant).toBe('F')
      expect(result.dimensions.TF.percentage).toBe(60)
      expect(result.dimensions.JP.dominant).toBe('P')
      expect(result.dimensions.JP.percentage).toBe(80)
      expect(result.active_tutor_sops).toEqual([
        'SOP_MBTI_E',
        'SOP_MBTI_N',
        'SOP_MBTI_F',
        'SOP_MBTI_P',
      ])
      expect(result.tutor_sop_details.length).toBe(4)
    })

    it('calculates Multiple Intelligences scores and determines Top 3 Gateways', () => {
      const answers: Record<string, number> = {}

      // Spasial: 5x 4 = 20 (100%)
      for (let i = 11; i <= 15; i++) {
        answers[`PP-MI-${String(i).padStart(2, '0')}`] = 4
      }
      // Interpersonal: 4x 4 + 1x 3 = 19 (95%)
      for (let i = 26; i <= 30; i++) {
        answers[`PP-MI-${String(i).padStart(2, '0')}`] = i === 30 ? 3 : 4
      }
      // Musikal: 5x 3 = 15 (75%)
      for (let i = 21; i <= 25; i++) {
        answers[`PP-MI-${String(i).padStart(2, '0')}`] = 3
      }
      // Lainnya: 5x 2 = 10 (50%)
      for (let i = 1; i <= 10; i++) {
        answers[`PP-MI-${String(i).padStart(2, '0')}`] = 2
      }
      for (let i = 16; i <= 20; i++) {
        answers[`PP-MI-${String(i).padStart(2, '0')}`] = 2
      }
      for (let i = 31; i <= 40; i++) {
        answers[`PP-MI-${String(i).padStart(2, '0')}`] = 2
      }

      const result = calculateMultipleIntelligencesScore(answers)

      expect(result.scores.MI_SPASIAL.raw).toBe(20)
      expect(result.scores.MI_SPASIAL.percentage).toBe(100)
      expect(result.scores.MI_INTERPERSONAL.raw).toBe(19)
      expect(result.scores.MI_INTERPERSONAL.percentage).toBe(95)
      expect(result.scores.MI_MUSIKAL.raw).toBe(15)
      expect(result.scores.MI_MUSIKAL.percentage).toBe(75)

      expect(result.top_3_gateways).toEqual([
        'MI_SPASIAL',
        'MI_INTERPERSONAL',
        'MI_MUSIKAL',
      ])
      expect(result.ranking[0]?.category).toBe('MI_SPASIAL')
      expect(result.ranking[1]?.category).toBe('MI_INTERPERSONAL')
      expect(result.ranking[2]?.category).toBe('MI_MUSIKAL')
    })

    it('calculates full cumulative PersonaPotentialResult for SMP level', () => {
      const answers: Record<string, string | number> = {}

      // Fill Paket 1 questions
      const smpQuestions = getQuestionsForLevel('SMP')
      for (const q of smpQuestions) {
        answers[q.id] = q.options[0]!.id
      }
      // Fill MBTI
      for (let i = 1; i <= 20; i++) {
        answers[`PP-MBTI-${String(i).padStart(2, '0')}`] = 'A'
      }
      // Fill MI
      for (let i = 1; i <= 40; i++) {
        answers[`PP-MI-${String(i).padStart(2, '0')}`] = 3
      }

      const fullResult = calculatePersonaPotentialResult('SMP', answers)
      expect(fullResult.package_code).toBe('PAKET_2_PERSONA_POTENTIAL')
      expect(fullResult.student_level).toBe('SMP')
      expect(fullResult.paket_1_results.PM_VAK_01).toBeDefined()
      expect(fullResult.paket_2_modules.PP_MBTI_02.personality_code).toBe('ESTJ')
      expect(fullResult.paket_2_modules.PP_MI_03.top_3_gateways.length).toBe(3)
    })

    it('separates Paket 1 and Paket 2 questions and scores Paket 2 using existing Paket 1 modules', () => {
      const paket1Sd = getQuestionsForPackageAndLevel('PAKET_1_PERSONA_MODALITY', 'SD')
      const paket1Smp = getQuestionsForPackageAndLevel('PAKET_1_PERSONA_MODALITY', 'SMP')
      const paket1Sma = getQuestionsForPackageAndLevel('PAKET_1_PERSONA_MODALITY', 'SMA')
      expect(paket1Sd.length).toBe(15)
      expect(paket1Smp.length).toBe(20)
      expect(paket1Sma.length).toBe(30)

      const paket2Sd = getQuestionsForPackageAndLevel('PAKET_2_PERSONA_POTENTIAL', 'SD')
      const paket2Smp = getQuestionsForPackageAndLevel('PAKET_2_PERSONA_POTENTIAL', 'SMP')
      const paket2Sma = getQuestionsForPackageAndLevel('PAKET_2_PERSONA_POTENTIAL', 'SMA')
      expect(paket2Sd.length).toBe(60)
      expect(paket2Smp.length).toBe(60)
      expect(paket2Sma.length).toBe(60)
      expect(paket2Smp.every((q) => q.moduleCode === 'PP-MBTI-02' || q.moduleCode === 'PP-MI-03')).toBe(true)

      // Complete Paket 1 first
      const paket1Answers: Record<string, string> = {}
      for (const q of paket1Smp) {
        paket1Answers[q.id] = q.options[0]!.id
      }
      const paket1Result = calculatePersonaModalityResult('SMP', paket1Answers)

      // Complete separated Paket 2 (60 questions only)
      const paket2Answers: Record<string, string | number> = {}
      for (let i = 1; i <= 20; i++) {
        paket2Answers[`PP-MBTI-${String(i).padStart(2, '0')}`] = 'B'
      }
      for (let i = 1; i <= 40; i++) {
        paket2Answers[`PP-MI-${String(i).padStart(2, '0')}`] = 4
      }

      const combinedResult = calculatePersonaPotentialResult('SMP', paket2Answers, paket1Result.modules)
      expect(combinedResult.paket_1_results).toEqual(paket1Result.modules)
      expect(combinedResult.paket_2_modules.PP_MBTI_02.personality_code).toBe('INFP')
      expect(combinedResult.paket_2_modules.PP_MI_03.top_3_gateways.length).toBe(3)
    })
  })
})
