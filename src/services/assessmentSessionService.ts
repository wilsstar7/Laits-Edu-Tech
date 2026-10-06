import { requireSupabase } from '@/lib/supabase'
import type { AssessmentSession } from '@/types/assessment'

export const assessmentSessionService = {
  /**
   * Finds an existing in_progress session for this user and assessment.
   */
  async getActiveSession(
    userId: string,
    assessmentId: string
  ): Promise<AssessmentSession | null> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('assessment_id', assessmentId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Failed to get active assessment session:', error)
      throw error
    }

    return (data as AssessmentSession) ?? null
  },

  /**
   * Retrieves a session by its unique ID.
   */
  async getSessionById(sessionId: string): Promise<AssessmentSession | null> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle()

    if (error) {
      console.error('Failed to fetch session by id:', error)
      throw error
    }

    return (data as AssessmentSession) ?? null
  },

  /**
   * Starts a brand new session with explicit consent timestamp.
   */
  async startNewSession(
    userId: string,
    assessmentId: string
  ): Promise<AssessmentSession> {
    const supabase = requireSupabase()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('assessment_sessions')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        status: 'in_progress',
        current_question_index: 0,
        consent_at: now,
        started_at: now,
        last_saved_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create new assessment session:', error)
      throw error
    }

    return data as AssessmentSession
  },

  /**
   * Updates the user's current progress index and last_saved_at.
   */
  async updateProgress(sessionId: string, index: number): Promise<void> {
    const supabase = requireSupabase()
    const { error } = await supabase
      .from('assessment_sessions')
      .update({
        current_question_index: index,
        last_saved_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Failed to update session progress:', error)
    }
  },
}
