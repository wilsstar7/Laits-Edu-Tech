import { requireSupabase } from '@/lib/supabase'
import type { AssessmentResult, DimensionResult, PersonalityType } from '@/types/assessment'

export const personalityService = {
  /**
   * Fetches the latest completed result for a student.
   */
  async getLatestResult(userId: string): Promise<AssessmentResult | null> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('assessment_results')
      .select(`
        *,
        personality_types (*),
        assessment_result_dimensions (
          id,
          result_id,
          dimension_id,
          raw_score,
          normalized_score,
          percentile,
          assessment_dimensions (*)
        )
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Failed to get latest assessment result:', error)
      throw error
    }

    if (!data) return null
    return formatResultData(data)
  },

  /**
   * Fetches a specific assessment result by its ID.
   */
  async getResultById(resultId: string): Promise<AssessmentResult | null> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('assessment_results')
      .select(`
        *,
        personality_types (*),
        assessment_result_dimensions (
          id,
          result_id,
          dimension_id,
          raw_score,
          normalized_score,
          percentile,
          assessment_dimensions (*)
        )
      `)
      .eq('id', resultId)
      .maybeSingle()

    if (error) {
      console.error('Failed to get assessment result by id:', error)
      throw error
    }

    if (!data) return null
    return formatResultData(data)
  },

  /**
   * Fetches chronological assessment history for a student.
   */
  async getHistory(userId: string): Promise<AssessmentResult[]> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('assessment_results')
      .select(`
        id,
        session_id,
        user_id,
        assessment_id,
        personality_type_id,
        overall_score,
        completed_at,
        created_at,
        personality_types (name, code),
        assessments (name)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch assessment history:', error)
      return []
    }

    return (data as unknown as AssessmentResult[]) ?? []
  },
}

interface RawResultQuery {
  id: string
  session_id: string
  user_id: string
  assessment_id: string
  personality_type_id: string
  overall_score: number
  completed_at: string
  created_at: string
  personality_types: PersonalityType | null
  assessment_result_dimensions: Array<{
    id: string
    result_id: string
    dimension_id: string
    raw_score: number
    normalized_score: number
    percentile: number | null
    assessment_dimensions: unknown
  }>
}

function formatResultData(raw: unknown): AssessmentResult {
  const r = raw as RawResultQuery
  const dimensions: DimensionResult[] = (r.assessment_result_dimensions ?? []).map(
    (dim) => ({
      id: dim.id,
      result_id: dim.result_id,
      dimension_id: dim.dimension_id,
      raw_score: Number(dim.raw_score),
      normalized_score: Number(dim.normalized_score),
      percentile: dim.percentile,
      dimension: dim.assessment_dimensions as DimensionResult['dimension'],
    })
  )

  return {
    id: r.id,
    session_id: r.session_id,
    user_id: r.user_id,
    assessment_id: r.assessment_id,
    personality_type_id: r.personality_type_id,
    overall_score: Number(r.overall_score),
    completed_at: r.completed_at,
    created_at: r.created_at,
    personality_type: r.personality_types ?? undefined,
    dimensions,
  }
}
