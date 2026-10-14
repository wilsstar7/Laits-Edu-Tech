import { describe, it, expect } from 'vitest'
import {
  calculateVakScore,
  calculateBrainDominanceScore,
  calculateHabitsScore,
  calculatePersonaModalityResult,
} from './scoring'
import { getQuestionsForLevel, PERSONA_MODALITY_QUESTIONS } from '@/data/personaModalityData'

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
    it('detects Left Brain Dominant when percentage > 65%', () => {
      const hemQuestions = PERSONA_MODALITY_QUESTIONS.filter((q) => q.moduleCode === 'PM-HEM-02').slice(0, 10)
      const answers: Record<string, string> = {}

      // 8 Left Brain, 2 Right Brain
      hemQuestions.forEach((q, idx) => {
        const leftOpt = q.options.find((opt) => opt.indicator === 'LEFT_BRAIN')!
        const rightOpt = q.options.find((opt) => opt.indicator === 'RIGHT_BRAIN')!
        answers[q.id] = idx < 8 ? leftOpt.id : rightOpt.id
      })

      const result = calculateBrainDominanceScore(hemQuestions, answers)
      expect(result.dominance_category).toBe('LEFT_DOMINANT')
      expect(result.tutor_sop_key).toBe('SOP_HEM_LEFT')
      expect(result.percentages.LEFT_BRAIN).toBe(80)
    })

    it('detects Right Brain Dominant when percentage > 65%', () => {
      const hemQuestions = PERSONA_MODALITY_QUESTIONS.filter((q) => q.moduleCode === 'PM-HEM-02').slice(0, 10)
      const answers: Record<string, string> = {}

      // 7 Right Brain, 3 Left Brain (70% > 65%)
      hemQuestions.forEach((q, idx) => {
        const leftOpt = q.options.find((opt) => opt.indicator === 'LEFT_BRAIN')!
        const rightOpt = q.options.find((opt) => opt.indicator === 'RIGHT_BRAIN')!
        answers[q.id] = idx < 7 ? rightOpt.id : leftOpt.id
      })

      const result = calculateBrainDominanceScore(hemQuestions, answers)
      expect(result.dominance_category).toBe('RIGHT_DOMINANT')
      expect(result.tutor_sop_key).toBe('SOP_HEM_RIGHT')
      expect(result.percentages.RIGHT_BRAIN).toBe(70)
    })

    it('detects Whole-Brain (Seimbang) when both sides <= 65%', () => {
      const hemQuestions = PERSONA_MODALITY_QUESTIONS.filter((q) => q.moduleCode === 'PM-HEM-02').slice(0, 10)
      const answers: Record<string, string> = {}

      // 6 Left Brain (60%), 4 Right Brain (40%)
      hemQuestions.forEach((q, idx) => {
        const leftOpt = q.options.find((opt) => opt.indicator === 'LEFT_BRAIN')!
        const rightOpt = q.options.find((opt) => opt.indicator === 'RIGHT_BRAIN')!
        answers[q.id] = idx < 6 ? leftOpt.id : rightOpt.id
      })

      const result = calculateBrainDominanceScore(hemQuestions, answers)
      expect(result.dominance_category).toBe('WHOLE_BRAIN')
      expect(result.tutor_sop_key).toBe('SOP_HEM_WHOLE_BRAIN')
    })
  })

  describe('Screening Kebiasaan Belajar (PM-SKB-03)', () => {
    it('produces 3 distinct cluster results with tie-breaker anchor resolution', () => {
      const skbQuestions = PERSONA_MODALITY_QUESTIONS.filter((q) => q.moduleCode === 'PM-SKB-03')
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

      const result = calculateHabitsScore(skbQuestions, answers)

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
    it('correctly filters questions by level: SD=40, SMP=50, SMA=65', () => {
      const sdQuestions = getQuestionsForLevel('SD')
      expect(sdQuestions.length).toBe(40)

      const smpQuestions = getQuestionsForLevel('SMP')
      expect(smpQuestions.length).toBe(50)

      const smaQuestions = getQuestionsForLevel('SMA')
      expect(smaQuestions.length).toBe(65)
    })

    it('runs calculatePersonaModalityResult without error for SD level', () => {
      const sdQuestions = getQuestionsForLevel('SD')
      const answers: Record<string, string> = {}
      for (const q of sdQuestions) {
        answers[q.id] = q.options[0].id
      }

      const fullResult = calculatePersonaModalityResult('SD', answers)
      expect(fullResult.package_code).toBe('PAKET_1_PERSONA_MODALITY')
      expect(fullResult.student_level).toBe('SD')
      expect(fullResult.modules.PM_VAK_01.total_questions).toBe(15)
      expect(fullResult.modules.PM_HEM_02.total_questions).toBe(10)
      expect(fullResult.modules.PM_SKB_03.total_questions).toBe(15)
    })
  })
})
