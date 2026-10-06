export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'no_show'

export const BOOKING_DURATIONS = [
  { value: 30, label: '30 Menit' },
  { value: 60, label: '60 Menit (Standar)', default: true },
  { value: 90, label: '90 Menit' },
] as const

export type BookingDurationMinutes = (typeof BOOKING_DURATIONS)[number]['value']

export interface Booking {
  id: string
  studentId: string
  studentName: string
  studentEmail?: string
  studentAvatarUrl?: string | null
  tutorId: string
  tutorName: string
  tutorAvatarUrl?: string | null
  tutorHourlyRate: number
  subjectId: string
  subjectName: string
  subjectCategory: 'general' | 'religious'
  scheduledStart: string
  scheduledEnd: string
  timezone: string
  status: BookingStatus
  studentNote: string | null
  tutorNote: string | null
  meetingUrl: string | null
  agreedHourlyRate?: number
  totalAmount?: number
  paymentId?: string
  paymentStatus?: 'pending' | 'awaiting_payment' | 'awaiting_verification' | 'paid' | 'failed' | 'expired' | 'cancelled'
  hasReview?: boolean
  reviewId?: string
  createdAt: string
  updatedAt: string
  cancelledAt: string | null
  cancelledBy: string | null
  cancellationReason: string | null
}

export interface CreateBookingInput {
  tutorId: string
  subjectId: string
  scheduledStart: string
  scheduledEnd: string
  timezone?: string
  studentNote?: string
}

/**
 * Validates whether a booking status transition is permitted by the state machine.
 */
export function canTransitionBookingStatus(
  currentStatus: BookingStatus,
  targetStatus: BookingStatus,
  actorRole: 'student' | 'tutor' | 'admin'
): boolean {
  if (actorRole === 'admin') return true

  if (actorRole === 'student') {
    // Student can only cancel a pending or confirmed booking
    if (targetStatus === 'cancelled' && (currentStatus === 'pending' || currentStatus === 'confirmed')) {
      return true
    }
    return false
  }

  if (actorRole === 'tutor') {
    if (currentStatus === 'pending') {
      return targetStatus === 'confirmed' || targetStatus === 'rejected' || targetStatus === 'cancelled'
    }
    if (currentStatus === 'confirmed') {
      return targetStatus === 'completed' || targetStatus === 'cancelled'
    }
    return false
  }

  return false
}
