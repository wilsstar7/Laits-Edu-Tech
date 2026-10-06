import { requireSupabase } from '@/lib/supabase'
import type {
  Assessment,
  AssessmentDimension,
  AssessmentQuestion,
} from '@/types/assessment'

export const assessmentService = {
  /**
   * Fetches the primary active assessment (configurable source of truth in database).
   */
  async getActiveAssessment(): Promise<Assessment | null> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Failed to fetch active assessment:', error)
      throw error
    }

    return (data as Assessment) ?? null
  },

  /**
   * Fetches ordered dimensions for a given assessment.
   */
  async getDimensions(assessmentId: string): Promise<AssessmentDimension[]> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('assessment_dimensions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch assessment dimensions:', error)
      throw error
    }

    return (data as AssessmentDimension[]) ?? []
  },

  /**
   * Fetches all active questions along with their ordered Likert options.
   */
  async getQuestions(assessmentId: string): Promise<AssessmentQuestion[]> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('assessment_questions')
      .select(`
        *,
        assessment_options (
          id,
          question_id,
          label,
          value,
          display_order
        )
      `)
      .eq('assessment_id', assessmentId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch assessment questions:', error)
      throw error
    }

    // Sort options by display_order inside each question
    const questions = (data as unknown as AssessmentQuestion[]) ?? []
    return questions.map((q) => ({
      ...q,
      assessment_options: (q.assessment_options ?? []).sort(
        (a, b) => a.display_order - b.display_order
      ),
    }))
  },
}
