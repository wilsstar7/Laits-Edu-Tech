/**
 * Assessment scoring mathematical helpers.
 * Matches the PostgreSQL RPC implementation in `submit_and_score_assessment`.
 */

export interface QuestionScoringItem {
  value: number
  weight: number
  reverseScore: boolean
  minOptionValue?: number
  maxOptionValue?: number
}

/**
 * Standard Likert reverse scoring formula:
 * (max_option + min_option) - answer_value
 * e.g. for 1-5 scale: (5 + 1) - 1 = 5, 6 - 2 = 4, 6 - 3 = 3, 6 - 4 = 2, 6 - 5 = 1
 */
export function calculateItemScore(
  value: number,
  reverseScore: boolean,
  minOption = 1,
  maxOption = 5
): number {
  if (reverseScore) {
    return maxOption + minOption - value
  }
  return value
}

/**
 * Normalizes dimension raw score into a 0 to 100 range based on:
 * min_possible = sum(min_val * weight)
 * max_possible = sum(max_val * weight)
 * normalized = ((raw - min_possible) / (max_possible - min_possible)) * 100
 */
export function calculateDimensionScore(
  items: QuestionScoringItem[],
  defaultMin = 1,
  defaultMax = 5
): { rawScore: number; normalizedScore: number } {
  let rawScore = 0
  let minPossible = 0
  let maxPossible = 0

  for (const item of items) {
    const minVal = item.minOptionValue ?? defaultMin
    const maxVal = item.maxOptionValue ?? defaultMax
    const effectiveValue = calculateItemScore(
      item.value,
      item.reverseScore,
      minVal,
      maxVal
    )

    rawScore += effectiveValue * item.weight
    minPossible += minVal * item.weight
    maxPossible += maxVal * item.weight
  }

  let normalizedScore = 50.0
  if (maxPossible - minPossible > 0) {
    normalizedScore = ((rawScore - minPossible) / (maxPossible - minPossible)) * 100
  }

  // Clamp 0 to 100
  normalizedScore = Math.max(0, Math.min(100, normalizedScore))

  return {
    rawScore: Number(rawScore.toFixed(2)),
    normalizedScore: Number(normalizedScore.toFixed(1)),
  }
}

export interface RuleCriteria {
  dimensionId: string
  operator: 'gte' | 'gt' | 'lte' | 'lt' | 'between'
  thresholdValue: number
  secondaryThreshold?: number
}

export interface PersonalityRuleItem {
  personalityTypeId: string
  priority: number
  rules: RuleCriteria[]
}

/**
 * Matches normalized dimension scores against personality type rules sorted by priority descending.
 */
export function matchPersonalityType(
  dimensionScores: Record<string, number>,
  ruleGroups: PersonalityRuleItem[],
  defaultTypeId: string
): string {
  // Sort rule groups by priority descending
  const sorted = [...ruleGroups].sort((a, b) => b.priority - a.priority)

  for (const group of sorted) {
    const allPassed = group.rules.every((rule) => {
      const score = dimensionScores[rule.dimensionId] ?? 50
      switch (rule.operator) {
        case 'gte':
          return score >= rule.thresholdValue
        case 'gt':
          return score > rule.thresholdValue
        case 'lte':
          return score <= rule.thresholdValue
        case 'lt':
          return score < rule.thresholdValue
        case 'between':
          return (
            score >= rule.thresholdValue &&
            score <= (rule.secondaryThreshold ?? 100)
          )
        default:
          return false
      }
    })

    if (allPassed) {
      return group.personalityTypeId
    }
  }

  return defaultTypeId
}
