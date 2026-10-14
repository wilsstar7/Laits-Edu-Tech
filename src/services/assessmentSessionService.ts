import { getSupabase } from '@/lib/supabase'
import type { AssessmentSession, StudentLevel } from '@/types/assessment'
import { PRIMARY_ASSESSMENT_ID } from './assessmentService'

const STORAGE_KEY_PREFIX = 'laits_persona_session_'

export const assessmentSessionService = {
  /**
   * Mencari sesi in_progress yang sedang berjalan untuk user ini.
   */
  async getActiveSession(
    userId: string,
    _assessmentId?: string
  ): Promise<AssessmentSession | null> {
    // 1. Cek local storage terlebih dahulu untuk response instan
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`)
      if (raw) {
        const session = JSON.parse(raw) as AssessmentSession
        if (session.status === 'in_progress') {
          return session
        }
      }
    } catch {
      // ignore
    }

    // 2. Cek Supabase jika terhubung
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data } = await supabase
          .from('assessment_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'in_progress')
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (data) {
          return data as AssessmentSession
        }
      } catch (err) {
        console.warn('Fallback to local session, supabase fetch error:', err)
      }
    }

    return null
  },

  /**
   * Mengambil sesi berdasarkan ID.
   */
  async getSessionById(sessionId: string): Promise<AssessmentSession | null> {
    // 1. Cek seluruh local storage sessions
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const s = JSON.parse(raw) as AssessmentSession
            if (s.id === sessionId) return s
          }
        } catch {
          // ignore
        }
      }
    }

    // 2. Cek Supabase jika ada
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data } = await supabase
          .from('assessment_sessions')
          .select('*')
          .eq('id', sessionId)
          .maybeSingle()
        if (data) return data as AssessmentSession
      } catch (err) {
        console.warn('Supabase getSessionById fallback error:', err)
      }
    }

    return null
  },

  /**
   * Memulai sesi asesmen baru dengan level siswa terpilih.
   */
  async startNewSession(
    userId: string,
    assessmentId: string = PRIMARY_ASSESSMENT_ID,
    studentLevel: StudentLevel = 'SMA'
  ): Promise<AssessmentSession> {
    const now = new Date().toISOString()
    const sessionId = 'ses-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36)

    const newSession: AssessmentSession = {
      id: sessionId,
      user_id: userId,
      assessment_id: assessmentId,
      status: 'in_progress',
      current_question_index: 0,
      student_level: studentLevel,
      package_code: 'PAKET_1_PERSONA_MODALITY',
      consent_at: now,
      started_at: now,
      last_saved_at: now,
      completed_at: null,
    }

    // Simpan di localStorage
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(newSession))
    localStorage.setItem(`laits_session_data_${sessionId}`, JSON.stringify(newSession))

    // Simpan ke Supabase jika tersedia
    const supabase = getSupabase()
    if (supabase) {
      try {
        await supabase.from('assessment_sessions').insert({
          id: sessionId,
          user_id: userId,
          assessment_id: assessmentId,
          status: 'in_progress',
          current_question_index: 0,
          consent_at: now,
          started_at: now,
          last_saved_at: now,
        })
      } catch (err) {
        console.warn('Supabase startNewSession insert error:', err)
      }
    }

    return newSession
  },

  /**
   * Memperbarui indeks pertanyaan dan timestamp last_saved_at.
   */
  async updateProgress(sessionId: string, index: number): Promise<void> {
    const now = new Date().toISOString()

    // Update di localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_KEY_PREFIX) || key === `laits_session_data_${sessionId}`) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const s = JSON.parse(raw) as AssessmentSession
            if (s.id === sessionId) {
              s.current_question_index = index
              s.last_saved_at = now
              localStorage.setItem(key, JSON.stringify(s))
            }
          }
        } catch {
          // ignore
        }
      }
    }

    // Update di Supabase jika ada
    const supabase = getSupabase()
    if (supabase) {
      try {
        await supabase
          .from('assessment_sessions')
          .update({
            current_question_index: index,
            last_saved_at: now,
          })
          .eq('id', sessionId)
      } catch {
        // silent fail
      }
    }
  },

  /**
   * Menandai sesi selesai.
   */
  async completeSession(sessionId: string): Promise<void> {
    const now = new Date().toISOString()
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_KEY_PREFIX) || key === `laits_session_data_${sessionId}`) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const s = JSON.parse(raw) as AssessmentSession
            if (s.id === sessionId) {
              s.status = 'scored'
              s.completed_at = now
              localStorage.setItem(key, JSON.stringify(s))
            }
          }
        } catch {
          // ignore
        }
      }
    }
  },
}
