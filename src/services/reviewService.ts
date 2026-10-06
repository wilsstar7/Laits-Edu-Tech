import { requireSupabase } from '@/lib/supabase'
import type {
  CreateReviewInput,
  Review,
  ReviewStatus,
  TutorRatingSummary,
} from '@/types/review'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

interface RawReviewRow {
  id: string
  booking_id: string
  student_id: string
  tutor_id: string
  rating: number
  review_text: string | null
  status: ReviewStatus
  created_at: string
  updated_at: string
  student?: {
    full_name: string
    avatar_url: string | null
  } | null
  tutor?: {
    profile?: {
      full_name: string
    } | null
  } | null
  booking?: {
    subject?: {
      name: string
    } | null
  } | null
}

function formatReviewRow(row: RawReviewRow): Review {
  return {
    id: row.id,
    bookingId: row.booking_id,
    studentId: row.student_id,
    studentName: row.student?.full_name || 'Siswa',
    studentAvatarUrl: row.student?.avatar_url || null,
    tutorId: row.tutor_id,
    tutorName: row.tutor?.profile?.full_name || 'Tutor',
    subjectName: row.booking?.subject?.name || 'Mata Pelajaran',
    rating: row.rating,
    reviewText: row.review_text,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const reviewService = {
  /**
   * Fetches published reviews for a tutor with pagination.
   */
  async getTutorReviews(
    tutorId: string,
    page = 1,
    limit = 10
  ): Promise<{ reviews: Review[]; total: number }> {
    const supabase = requireSupabase()

    try {
      const offset = (page - 1) * limit

      const { data, count, error } = await supabase
        .from('reviews')
        .select(
          `
          id,
          booking_id,
          student_id,
          tutor_id,
          rating,
          review_text,
          status,
          created_at,
          updated_at,
          student:profiles!reviews_student_id_fkey (
            full_name,
            avatar_url
          ),
          booking:bookings!reviews_booking_id_fkey (
            subject:subjects ( name )
          )
        `,
          { count: 'exact' }
        )
        .eq('tutor_id', tutorId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const reviews = (data || []).map((row) =>
        formatReviewRow(row as unknown as RawReviewRow)
      )

      return {
        reviews,
        total: count || 0,
      }
    } catch (err) {
      logger.error('Failed to get tutor reviews:', err)
      throw toAppError(err, 'Gagal memuat daftar ulasan tutor.')
    }
  },

  /**
   * Calculates actual rating distribution and average rating for a tutor.
   */
  async getTutorRatingSummary(tutorId: string): Promise<TutorRatingSummary> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('tutor_id', tutorId)
        .eq('status', 'published')

      if (error) throw error

      const distribution: TutorRatingSummary['distribution'] = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      }

      if (!data || data.length === 0) {
        return {
          tutorId,
          averageRating: 0,
          totalReviews: 0,
          distribution,
        }
      }

      let sum = 0
      for (const row of data) {
        sum += row.rating
        if (row.rating in distribution) {
          distribution[row.rating as 1 | 2 | 3 | 4 | 5]++
        }
      }

      const averageRating = Number((sum / data.length).toFixed(1))

      return {
        tutorId,
        averageRating,
        totalReviews: data.length,
        distribution,
      }
    } catch (err) {
      logger.error('Failed to get tutor rating summary:', err)
      return {
        tutorId,
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      }
    }
  },

  /**
   * Submits a student review via atomic RPC `submit_student_review`.
   */
  async submitReview(input: CreateReviewInput): Promise<string> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase.rpc('submit_student_review', {
        p_booking_id: input.bookingId,
        p_rating: input.rating,
        p_review_text: input.reviewText || undefined,
      })

      if (error) throw error
      if (!data) throw new Error('ID ulasan tidak dihasilkan.')

      return data
    } catch (err) {
      logger.error('Failed to submit review:', err)
      throw toAppError(err, 'Gagal mengirimkan ulasan.')
    }
  },

  /**
   * Checks whether a booking is eligible for review:
   * 1. Booking belongs to current student
   * 2. Booking status is completed
   * 3. Payment status is paid
   * 4. No review exists yet
   */
  async checkReviewEligibility(
    bookingId: string
  ): Promise<{ eligible: boolean; reason?: string }> {
    const supabase = requireSupabase()

    try {
      const { data: authData } = await supabase.auth.getUser()
      const studentId = authData.user?.id
      if (!studentId) return { eligible: false, reason: 'Belum login' }

      const { data: booking, error: bError } = await supabase
        .from('bookings')
        .select('id, student_id, status')
        .eq('id', bookingId)
        .maybeSingle()

      if (bError || !booking) {
        return { eligible: false, reason: 'Pemesanan tidak ditemukan' }
      }

      if (booking.student_id !== studentId) {
        return { eligible: false, reason: 'Bukan pemilik pemesanan' }
      }

      if (booking.status !== 'completed') {
        return { eligible: false, reason: 'Sesi bimbingan belum selesai' }
      }

      // Check payment paid
      const { data: payment } = await supabase
        .from('payments')
        .select('status')
        .eq('booking_id', bookingId)
        .eq('status', 'paid')
        .maybeSingle()

      if (!payment) {
        return { eligible: false, reason: 'Pembayaran belum terkonfirmasi' }
      }

      // Check existing review
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle()

      if (existingReview) {
        return { eligible: false, reason: 'Ulasan sudah pernah dikirimkan' }
      }

      return { eligible: true }
    } catch {
      return { eligible: false, reason: 'Terjadi kesalahan sistem' }
    }
  },

  /**
   * Admin: Moderate review status (publish, hide, flag).
   */
  async moderateReview(reviewId: string, status: ReviewStatus): Promise<void> {
    const supabase = requireSupabase()

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId)

      if (error) throw error
    } catch (err) {
      logger.error('Failed to moderate review:', err)
      throw toAppError(err, 'Gagal mengubah status moderasi ulasan.')
    }
  },

  /**
   * Admin: Fetches flagged reviews.
   */
  async getFlaggedReviews(): Promise<Review[]> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          booking_id,
          student_id,
          tutor_id,
          rating,
          review_text,
          status,
          created_at,
          updated_at,
          student:profiles!reviews_student_id_fkey ( full_name, avatar_url ),
          tutor:tutor_profiles!reviews_tutor_id_fkey (
            profile:profiles ( full_name )
          )
        `)
        .in('status', ['flagged', 'hidden'])
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return (data || []).map((row) => formatReviewRow(row as unknown as RawReviewRow))
    } catch (err) {
      logger.error('Failed to get flagged reviews:', err)
      throw toAppError(err, 'Gagal memuat ulasan terindikasi pelanggaran.')
    }
  },
}
