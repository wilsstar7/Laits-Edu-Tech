import { getSupabase } from '@/lib/supabase'

const ANSWER_STORAGE_PREFIX = 'laits_answers_'

export const assessmentAnswerService = {
  /**
   * Mengambil semua jawaban yang tersimpan untuk sesi ini.
   * Format mapping: question_id -> option_id / indicator
   */
  async getAnswersForSession(sessionId: string): Promise<Record<string, string>> {
    const map: Record<string, string> = {}

    // 1. Cek local storage
    try {
      const raw = localStorage.getItem(`${ANSWER_STORAGE_PREFIX}${sessionId}`)
      if (raw) {
        Object.assign(map, JSON.parse(raw))
      }
    } catch {
      // ignore
    }

    // 2. Cek Supabase jika ada dan gabungkan
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data } = await supabase
          .from('assessment_answers')
          .select('question_id, option_id')
          .eq('session_id', sessionId)

        if (data) {
          for (const item of data) {
            map[item.question_id] = item.option_id
          }
        }
      } catch {
        // fallback to local answers
      }
    }

    return map
  },

  /**
   * Menyimpan / upsert jawaban siswa untuk suatu butir soal.
   */
  async saveAnswer(
    sessionId: string,
    questionId: string,
    optionId: string
  ): Promise<void> {
    // 1. Simpan di local storage
    try {
      const storageKey = `${ANSWER_STORAGE_PREFIX}${sessionId}`
      const existingRaw = localStorage.getItem(storageKey)
      const answers = existingRaw ? JSON.parse(existingRaw) : {}
      answers[questionId] = optionId
      localStorage.setItem(storageKey, JSON.stringify(answers))
    } catch {
      // ignore
    }

    // 2. Simpan di Supabase jika terhubung
    const supabase = getSupabase()
    if (supabase) {
      try {
        await supabase.from('assessment_answers').upsert(
          {
            session_id: sessionId,
            question_id: questionId,
            option_id: optionId,
            answered_at: new Date().toISOString(),
          },
          { onConflict: 'session_id,question_id' }
        )
      } catch {
        // local storage guarantees answer is safe
      }
    }
  },
}
