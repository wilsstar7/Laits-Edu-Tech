import { requireSupabase } from '@/lib/supabase'
import type { Booking, BookingStatus, CreateBookingInput } from '@/types/booking'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export interface TutorDashboardStats {
  activeStudentsCount: number
  upcomingSessionsCount: number
  completedSessionsCount: number
  pendingRequestsCount: number
  todayBookings: Booking[]
}

export const bookingService = {
  /**
   * Secure transactional booking creation via PostgreSQL RPC `create_booking`.
   * Enforces server-side time validation, tutor availability, active subject, and double booking prevention.
   */
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase.rpc('create_booking', {
        p_tutor_id: input.tutorId,
        p_subject_id: input.subjectId,
        p_scheduled_start: input.scheduledStart,
        p_scheduled_end: input.scheduledEnd,
        p_timezone: input.timezone || 'Asia/Jakarta',
        p_student_note: input.studentNote || undefined,
      })

      if (error) throw error
      if (!data) throw new Error('ID pemesanan tidak dihasilkan.')

      const createdBooking = await this.getBookingById(data)
      if (!createdBooking) {
        throw new Error('Pemesanan berhasil dibuat tetapi gagal dimuat.')
      }

      return createdBooking
    } catch (err) {
      logger.error('Failed to create booking:', err)
      throw toAppError(err, 'Gagal membuat pemesanan bimbingan.')
    }
  },

  /**
   * Fetches all bookings made by a student, ordered by scheduled start descending.
   */
  async getStudentBookings(studentId?: string): Promise<Booking[]> {
    const supabase = requireSupabase()

    try {
      let targetStudentId = studentId
      if (!targetStudentId) {
        const { data: authData } = await supabase.auth.getUser()
        targetStudentId = authData.user?.id
      }
      if (!targetStudentId) return []
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          student_id,
          tutor_id,
          subject_id,
          scheduled_start,
          scheduled_end,
          timezone,
          status,
          student_note,
          tutor_note,
          meeting_url,
          created_at,
          updated_at,
          cancelled_at,
          cancelled_by,
          cancellation_reason,
          student:profiles!bookings_student_id_fkey (
            full_name,
            email,
            avatar_url
          ),
          tutor:tutor_profiles!bookings_tutor_id_fkey (
            hourly_rate,
            profile:profiles!inner (
              full_name,
              avatar_url
            )
          ),
          subject:subjects!bookings_subject_id_fkey (
            name,
            category
          )
        `)
        .eq('student_id', targetStudentId)
        .order('scheduled_start', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data || []).map((row) => formatBookingRow(row))
    } catch (err) {
      logger.error('Failed to get student bookings:', err)
      throw toAppError(err, 'Gagal memuat daftar pemesanan bimbingan.')
    }
  },

  /**
   * Fetches a single booking detail by ID.
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          student_id,
          tutor_id,
          subject_id,
          scheduled_start,
          scheduled_end,
          timezone,
          status,
          student_note,
          tutor_note,
          meeting_url,
          created_at,
          updated_at,
          cancelled_at,
          cancelled_by,
          cancellation_reason,
          student:profiles!bookings_student_id_fkey (
            full_name,
            email,
            avatar_url
          ),
          tutor:tutor_profiles!bookings_tutor_id_fkey (
            hourly_rate,
            profile:profiles!inner (
              full_name,
              avatar_url
            )
          ),
          subject:subjects!bookings_subject_id_fkey (
            name,
            category
          )
        `)
        .eq('id', bookingId)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      return formatBookingRow(data)
    } catch (err) {
      logger.error('Failed to get booking by id:', err)
      throw toAppError(err, 'Gagal memuat detail pemesanan.')
    }
  },

  /**
   * Cancels a booking via secure RPC with cancellation tracking.
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    const supabase = requireSupabase()

    try {
      const { error } = await supabase.rpc('update_booking_status', {
        p_booking_id: bookingId,
        p_new_status: 'cancelled',
        p_reason: reason || undefined,
      })

      if (error) throw error
    } catch (err) {
      logger.error('Failed to cancel booking:', err)
      throw toAppError(err, 'Gagal membatalkan pemesanan.')
    }
  },

  /**
   * Fetches bookings assigned to a tutor.
   */
  async getTutorBookings(tutorUserId?: string): Promise<Booking[]> {
    const supabase = requireSupabase()

    try {
      let targetUserId = tutorUserId
      if (!targetUserId) {
        const { data: authData } = await supabase.auth.getUser()
        targetUserId = authData.user?.id
      }
      if (!targetUserId) return []

      // 1. Get tutor profile ID
      const { data: tp, error: tpError } = await supabase
        .from('tutor_profiles')
        .select('id')
        .eq('user_id', targetUserId)
        .single()

      if (tpError || !tp) throw new Error('Akun tutor tidak ditemukan.')

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          student_id,
          tutor_id,
          subject_id,
          scheduled_start,
          scheduled_end,
          timezone,
          status,
          student_note,
          tutor_note,
          meeting_url,
          created_at,
          updated_at,
          cancelled_at,
          cancelled_by,
          cancellation_reason,
          student:profiles!bookings_student_id_fkey (
            full_name,
            email,
            avatar_url
          ),
          tutor:tutor_profiles!bookings_tutor_id_fkey (
            hourly_rate,
            profile:profiles!inner (
              full_name,
              avatar_url
            )
          ),
          subject:subjects!bookings_subject_id_fkey (
            name,
            category
          )
        `)
        .eq('tutor_id', tp.id)
        .order('scheduled_start', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data || []).map((row) => formatBookingRow(row))
    } catch (err) {
      logger.error('Failed to get tutor bookings:', err)
      throw toAppError(err, 'Gagal memuat daftar sesi bimbingan tutor.')
    }
  },

  /**
   * Updates booking status by tutor (confirm, reject, complete) via secure state machine RPC.
   */
  async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    options: {
      reason?: string
      tutorNote?: string
      meetingUrl?: string
    } = {}
  ): Promise<void> {
    const supabase = requireSupabase()

    try {
      const { error } = await supabase.rpc('update_booking_status', {
        p_booking_id: bookingId,
        p_new_status: newStatus,
        p_reason: options.reason || undefined,
        p_tutor_note: options.tutorNote || undefined,
        p_meeting_url: options.meetingUrl || undefined,
      })

      if (error) throw error
    } catch (err) {
      logger.error('Failed to update booking status:', err)
      throw toAppError(err, 'Gagal memperbarui status pemesanan.')
    }
  },

  /**
   * Computes authentic statistics for the tutor dashboard using real database bookings.
   */
  async getTutorDashboardStats(tutorUserId?: string): Promise<TutorDashboardStats> {
    const bookings = await this.getTutorBookings(tutorUserId)

    const now = new Date()
    const todayYMD = now.toISOString().slice(0, 10)

    // 1. Unique active students (who have confirmed or completed bookings)
    const confirmedOrCompleted = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'completed'
    )
    const studentIds = new Set(confirmedOrCompleted.map((b) => b.studentId))

    // 2. Upcoming sessions (future confirmed or pending)
    const upcoming = bookings.filter((b) => {
      const isFuture = new Date(b.scheduledStart) > now
      return isFuture && (b.status === 'confirmed' || b.status === 'pending')
    })

    // 3. Completed sessions
    const completed = bookings.filter((b) => b.status === 'completed')

    // 4. Pending requests
    const pending = bookings.filter((b) => b.status === 'pending')

    // 5. Today's bookings
    const todayBookings = bookings.filter((b) => {
      const startYMD = new Date(b.scheduledStart).toISOString().slice(0, 10)
      return startYMD === todayYMD && b.status !== 'cancelled' && b.status !== 'rejected'
    })

    return {
      activeStudentsCount: studentIds.size,
      upcomingSessionsCount: upcoming.length,
      completedSessionsCount: completed.length,
      pendingRequestsCount: pending.length,
      todayBookings,
    }
  },
}

interface RawBookingRow {
  id: string
  student_id: string
  tutor_id: string
  subject_id: string
  scheduled_start: string
  scheduled_end: string
  timezone: string
  status: BookingStatus
  student_note: string | null
  tutor_note: string | null
  meeting_url: string | null
  created_at: string
  updated_at: string
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  student?: {
    full_name: string
    email?: string
    avatar_url: string | null
  } | null
  tutor?: {
    hourly_rate: number | null
    profile?: {
      full_name: string
      avatar_url: string | null
    } | null
  } | null
  subject?: {
    name: string
    category: 'general' | 'religious'
  } | null
}

function formatBookingRow(r: unknown): Booking {
  const row = r as RawBookingRow

  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student?.full_name || 'Siswa',
    studentEmail: row.student?.email,
    studentAvatarUrl: row.student?.avatar_url || null,
    tutorId: row.tutor_id,
    tutorName: row.tutor?.profile?.full_name || 'Tutor',
    tutorAvatarUrl: row.tutor?.profile?.avatar_url || null,
    tutorHourlyRate: Number(row.tutor?.hourly_rate || 0),
    subjectId: row.subject_id,
    subjectName: row.subject?.name || 'Mata Pelajaran',
    subjectCategory: row.subject?.category || 'general',
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    timezone: row.timezone || 'Asia/Jakarta',
    status: row.status,
    studentNote: row.student_note,
    tutorNote: row.tutor_note,
    meetingUrl: row.meeting_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cancelledAt: row.cancelled_at,
    cancelledBy: row.cancelled_by,
    cancellationReason: row.cancellation_reason,
  }
}
