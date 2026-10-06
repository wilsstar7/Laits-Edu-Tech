import { requireSupabase } from '@/lib/supabase'

export const assessmentScoringService = {
  /**
   * Invokes the trusted PostgreSQL RPC function to validate, score, and lock the assessment.
   * Frontend never calculates or transmits raw scores, weights, or personality types.
   */
  async submitAndScore(sessionId: string): Promise<string> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('submit_and_score_assessment', {
      p_session_id: sessionId,
    })

    if (error) {
      console.error('Error submitting assessment for scoring:', error)
      throw new Error(error.message || 'Gagal memproses hasil asesmen.')
    }

    return data as string
  },
}
