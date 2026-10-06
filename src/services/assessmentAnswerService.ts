import { requireSupabase } from '@/lib/supabase'

export const assessmentAnswerService = {
  /**
   * Fetches all saved answers for this session.
   * Returns a key-value mapping of question_id -> option_id for instantaneous UI lookup.
   */
  async getAnswersForSession(
    sessionId: string
  ): Promise<Record<string, string>> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('assessment_answers')
      .select('question_id, option_id')
      .eq('session_id', sessionId)

    if (error) {
      console.error('Failed to fetch session answers:', error)
      throw error
    }

    const map: Record<string, string> = {}
    for (const item of data ?? []) {
      map[item.question_id] = item.option_id
    }
    return map
  },

  /**
   * Upserts a student's answer.
   * Frontend only sends option_id: scoring is strictly computed server-side in RPC.
   */
  async saveAnswer(
    sessionId: string,
    questionId: string,
    optionId: string
  ): Promise<void> {
    const supabase = requireSupabase()
    const { error } = await supabase.from('assessment_answers').upsert(
      {
        session_id: sessionId,
        question_id: questionId,
        option_id: optionId,
        answered_at: new Date().toISOString(),
      },
      { onConflict: 'session_id,question_id' }
    )

    if (error) {
      console.error('Failed to save assessment answer:', error)
      throw new Error(
        'Gagal menyimpan jawaban. Periksa koneksi Anda dan coba lagi.'
      )
    }
  },
}
