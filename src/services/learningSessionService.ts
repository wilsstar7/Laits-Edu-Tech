import { requireSupabase } from '@/lib/supabase'
import type { LearningSession, LearningSessionStatus } from '@/types/progress'
import { toAppError } from '@/utils/errors'

interface RawSessionRow {
  id: string
  booking_id: string
  student_id: string
  tutor_id: string
  subject_id: string
  started_at: string
  ended_at: string
  duration_minutes: number
  student_notes: string | null
  tutor_notes: string | null
  status: LearningSessionStatus
  created_at: string
  student?: {
    full_name: string
    avatar_url: string | null
  } | null
  tutor?: {
    profile?: {
      full_name: string
      avatar_url: string | null
    } | null
  } | null
  subject?: {
    name: string
    category: 'general' | 'religious'
  } | null
  review?: Array<{
    id: string
    rating: number
  }> | null
}

function formatSessionRow(row: RawSessionRow): LearningSession {
  const review = row.review && row.review.length > 0 ? row.review[0] : null

  return {
    id: row.id,
    bookingId: row.booking_id,
    studentId: row.student_id,
    studentName: row.student?.full_name || 'Siswa',
    studentAvatarUrl: row.student?.avatar_url || null,
    tutorId: row.tutor_id,
    tutorName: row.tutor?.profile?.full_name || 'Tutor',
    tutorAvatarUrl: row.tutor?.profile?.avatar_url || null,
    subjectId: row.subject_id,
    subjectName: row.subject?.name || 'Mata Pelajaran',
    subjectCategory: row.subject?.category || 'general',
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMinutes: row.duration_minutes,
    studentNotes: row.student_notes,
    tutorNotes: row.tutor_notes,
    status: row.status,
    hasReview: !!review,
    rating: review?.rating,
    createdAt: row.created_at,
  }
}

export const learningSessionService = {
  /**
   * Fetches sessions for a student with pagination.
   */
  async getStudentSessions(
    studentId?: string,
    page = 1,
    limit = 20
  ): Promise<{ sessions: LearningSession[]; total: number }> {
    const supabase = requireSupabase()

    try {
      let targetStudentId = studentId
      if (!targetStudentId) {
        const { data: authData } = await supabase.auth.getUser()
        targetStudentId = authData.user?.id
      }
      if (!targetStudentId) return { sessions: [], total: 0 }

      const offset = (page - 1) * limit

      const { data, count, error } = await supabase
        .from('learning_sessions')
        .select(
          `
          id,
          booking_id,
          student_id,
          tutor_id,
          subject_id,
          started_at,
          ended_at,
          duration_minutes,
          student_notes,
          tutor_notes,
          status,
          created_at,
          tutor:tutor_profiles!learning_sessions_tutor_id_fkey (
            profile:profiles ( full_name, avatar_url )
          ),
          subject:subjects!learning_sessions_subject_id_fkey ( name, category ),
          review:reviews!reviews_booking_id_fkey ( id, rating )
        `,
          { count: 'exact' }
        )
        .eq('student_id', targetStudentId)
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const sessions = (data || []).map((row) =>
        formatSessionRow(row as unknown as RawSessionRow)
      )

      return {
        sessions,
        total: count || 0,
      }
    } catch (err) {
      console.error('Failed to get student sessions:', err)
      throw toAppError(err, 'Gagal memuat riwayat sesi belajar.')
    }
  },

  /**
   * Fetches sessions assigned to a tutor with pagination.
   */
  async getTutorSessions(
    tutorId?: string,
    page = 1,
    limit = 20
  ): Promise<{ sessions: LearningSession[]; total: number }> {
    const supabase = requireSupabase()

    try {
      let targetTutorId = tutorId
      if (!targetTutorId) {
        const { data: authData } = await supabase.auth.getUser()
        if (authData.user?.id) {
          const { data: tutorProfile } = await supabase
            .from('tutor_profiles')
            .select('id')
            .eq('user_id', authData.user.id)
            .maybeSingle()
          targetTutorId = tutorProfile?.id
        }
      }
      if (!targetTutorId) return { sessions: [], total: 0 }

      const offset = (page - 1) * limit

      const { data, count, error } = await supabase
        .from('learning_sessions')
        .select(
          `
          id,
          booking_id,
          student_id,
          tutor_id,
          subject_id,
          started_at,
          ended_at,
          duration_minutes,
          student_notes,
          tutor_notes,
          status,
          created_at,
          student:profiles!learning_sessions_student_id_fkey ( full_name, avatar_url ),
          subject:subjects!learning_sessions_subject_id_fkey ( name, category ),
          review:reviews!reviews_booking_id_fkey ( id, rating )
        `,
          { count: 'exact' }
        )
        .eq('tutor_id', targetTutorId)
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const sessions = (data || []).map((row) =>
        formatSessionRow(row as unknown as RawSessionRow)
      )

      return {
        sessions,
        total: count || 0,
      }
    } catch (err) {
      console.error('Failed to get tutor sessions:', err)
      throw toAppError(err, 'Gagal memuat riwayat sesi bimbingan tutor.')
    }
  },

  /**
   * Marks a session as completed via RPC `complete_tutoring_session` and saves notes.
   */
  async completeSession(
    bookingId: string,
    tutorNotes?: string,
    studentNotes?: string
  ): Promise<void> {
    const supabase = requireSupabase()

    try {
      const { error } = await supabase.rpc('complete_tutoring_session', {
        p_booking_id: bookingId,
        p_tutor_notes: tutorNotes || undefined,
        p_student_notes: studentNotes || undefined,
      })

      if (error) throw error
    } catch (err) {
      console.error('Failed to complete session:', err)
      throw toAppError(err, 'Gagal menyelesaikan sesi bimbingan.')
    }
  },
}
