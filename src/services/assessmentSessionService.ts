import { getSupabase } from '@/lib/supabase'
import type {
  AssessmentSession,
  StudentLevel,
  AssessmentPackageCode,
} from '@/types/assessment'
import { PRIMARY_ASSESSMENT_ID } from './assessmentService'

const STORAGE_KEY_PREFIX = 'laits_persona_session_'

/**
 * Sesi lama dari engine berbasis database tidak punya package_code dan
 * question_id-nya UUID, sehingga tidak cocok dengan bank soal lokal saat ini.
 * Melanjutkan sesi seperti ini memulihkan nomor soal tanpa jawabannya.
 */
export function isLegacySession(session: AssessmentSession): boolean {
  return !session.package_code
}

function patchLocalSession(sessionId: string, patch: Partial<AssessmentSession>): void {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(STORAGE_KEY_PREFIX) || key === `laits_session_data_${sessionId}`) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const s = JSON.parse(raw) as AssessmentSession
          if (s.id === sessionId) {
            localStorage.setItem(key, JSON.stringify({ ...s, ...patch }))
          }
        }
      } catch {
        // ignore
      }
    }
  }
}

async function setRemoteStatus(
  sessionId: string,
  status: 'scored' | 'abandoned',
  completedAt: string | null
): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  try {
    await supabase
      .from('assessment_sessions')
      .update({ status, completed_at: completedAt, last_saved_at: new Date().toISOString() })
      .eq('id', sessionId)
  } catch {
    // silent fail: local storage tetap menjadi sumber kebenaran
  }
}

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
        if (session.status === 'in_progress' && !isLegacySession(session)) {
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

        for (const row of (data ?? []) as AssessmentSession[]) {
          if (!isLegacySession(row)) return row
          // Sesi lama tidak bisa diselesaikan, tutup agar tidak terus muncul.
          await setRemoteStatus(row.id, 'abandoned', null)
        }
      } catch (err) {
        console.warn('Fallback to local session, supabase fetch error:', err)
      }
    }

    return null
  },

  /**
   * Membatalkan sesi berjalan agar siswa bisa memulai paket/jenjang lain.
   */
  async abandonSession(sessionId: string): Promise<void> {
    patchLocalSession(sessionId, { status: 'abandoned' })
    await setRemoteStatus(sessionId, 'abandoned', null)
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
   * Memulai sesi asesmen baru dengan level siswa dan paket terpilih.
   */
  async startNewSession(
    userId: string,
    assessmentId: string = PRIMARY_ASSESSMENT_ID,
    studentLevel: StudentLevel = 'SMA',
    packageCode: AssessmentPackageCode = 'PAKET_1_PERSONA_MODALITY'
  ): Promise<AssessmentSession> {
    const now = new Date().toISOString()
    const sessionId =
      'ses-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36)

    const newSession: AssessmentSession = {
      id: sessionId,
      user_id: userId,
      assessment_id: assessmentId,
      status: 'in_progress',
      current_question_index: 0,
      student_level: studentLevel,
      package_code: packageCode,
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
    patchLocalSession(sessionId, { status: 'scored', completed_at: now })
    await setRemoteStatus(sessionId, 'scored', now)
  },
}
