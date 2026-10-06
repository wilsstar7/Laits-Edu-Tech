import { describe, it, expect } from 'vitest'
import {
  calculateItemScore,
  calculateDimensionScore,
  matchPersonalityType,
  type QuestionScoringItem,
} from './scoring'

describe('Personality Assessment Scoring Engine', () => {
  describe('Reverse Scoring (1-5 Likert scale)', () => {
    it('calculates standard forward scores accurately', () => {
      expect(calculateItemScore(1, false)).toBe(1)
      expect(calculateItemScore(2, false)).toBe(2)
      expect(calculateItemScore(3, false)).toBe(3)
      expect(calculateItemScore(4, false)).toBe(4)
      expect(calculateItemScore(5, false)).toBe(5)
    })

    it('inverts reverse-scored items: 1 -> 5, 2 -> 4, 3 -> 3, 4 -> 2, 5 -> 1', () => {
      expect(calculateItemScore(1, true)).toBe(5)
      expect(calculateItemScore(2, true)).toBe(4)
      expect(calculateItemScore(3, true)).toBe(3)
      expect(calculateItemScore(4, true)).toBe(2)
      expect(calculateItemScore(5, true)).toBe(1)
    })
  })

  describe('Dimension Score Normalization (0 - 100)', () => {
    it('normalizes minimum possible answers to 0%', () => {
      const items: QuestionScoringItem[] = [
        { value: 1, weight: 1, reverseScore: false },
        { value: 1, weight: 1, reverseScore: false },
        { value: 5, weight: 1, reverseScore: true }, // inverts to 1
      ]
      const result = calculateDimensionScore(items)
      expect(result.normalizedScore).toBe(0)
    })

    it('normalizes maximum possible answers to 100%', () => {
      const items: QuestionScoringItem[] = [
        { value: 5, weight: 1, reverseScore: false },
        { value: 5, weight: 1, reverseScore: false },
        { value: 1, weight: 1, reverseScore: true }, // inverts to 5
      ]
      const result = calculateDimensionScore(items)
      expect(result.normalizedScore).toBe(100)
    })

    it('handles weighted questions accurately', () => {
      // 1 item with weight 2, value 3 (midpoint)
      const items: QuestionScoringItem[] = [
        { value: 3, weight: 2, reverseScore: false },
      ]
      const result = calculateDimensionScore(items)
      expect(result.rawScore).toBe(6)
      expect(result.normalizedScore).toBe(50)
    })

    it('clamps edge values within 0 and 100', () => {
      const items: QuestionScoringItem[] = [
        { value: 3, weight: 1, reverseScore: false },
      ]
      const result = calculateDimensionScore(items)
      expect(result.normalizedScore).toBeGreaterThanOrEqual(0)
      expect(result.normalizedScore).toBeLessThanOrEqual(100)
    })
  })

  describe('Personality Type Rule Evaluation', () => {
    const defaultType = 'DEFAULT_PLANNER'
    const explorerType = 'EXPLORER'
    const analystType = 'ANALYST'

    const ruleGroups = [
      {
        personalityTypeId: explorerType,
        priority: 40,
        rules: [
          { dimensionId: 'dim_openness', operator: 'gte' as const, thresholdValue: 65 },
          { dimensionId: 'dim_extraversion', operator: 'gte' as const, thresholdValue: 55 },
        ],
      },
      {
        personalityTypeId: analystType,
        priority: 30,
        rules: [
          { dimensionId: 'dim_conscientiousness', operator: 'gte' as const, thresholdValue: 65 },
          { dimensionId: 'dim_extraversion', operator: 'lte' as const, thresholdValue: 50 },
        ],
      },
    ]

    it('selects highest priority matching personality type', () => {
      const scores = {
        dim_openness: 75,
        dim_extraversion: 60,
        dim_conscientiousness: 70,
      }
      const matched = matchPersonalityType(scores, ruleGroups, defaultType)
      expect(matched).toBe(explorerType)
    })

    it('falls back to second priority if highest priority does not match', () => {
      const scores = {
        dim_openness: 50, // Does not meet Explorer (needs >= 65)
        dim_extraversion: 40,
        dim_conscientiousness: 80, // Meets Analyst (needs >= 65 and ext <= 50)
      }
      const matched = matchPersonalityType(scores, ruleGroups, defaultType)
      expect(matched).toBe(analystType)
    })

    it('falls back to default personality type when no rules match', () => {
      const scores = {
        dim_openness: 40,
        dim_extraversion: 52,
        dim_conscientiousness: 40,
      }
      const matched = matchPersonalityType(scores, ruleGroups, defaultType)
      expect(matched).toBe(defaultType)
    })
  })
})
