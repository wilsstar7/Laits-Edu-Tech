import type { PaymentStatus } from '@/types/payment'
import type { BookingStatus } from '@/types/booking'

/**
 * Integer-safe session price calculation.
 * Never uses floating-point pennies for IDR currency.
 * Formula: round(hourlyRate * durationMinutes / 60)
 */
export function calculateSessionPrice(hourlyRate: number, durationMinutes: number): number {
  if (hourlyRate <= 0 || durationMinutes <= 0) return 0
  return Math.round((hourlyRate * durationMinutes) / 60)
}

/**
 * Validates payment state machine transitions based on actor role.
 * Critical security principle: Students and Tutors cannot mark payment as 'paid'.
 */
export function canTransitionPaymentStatus(
  current: PaymentStatus,
  target: PaymentStatus,
  role: 'student' | 'tutor' | 'admin'
): boolean {
  if (current === target) return false

  // Tutors have no payment state transition permissions
  if (role === 'tutor') {
    return false
  }

  // Student permissions
  if (role === 'student') {
    // Student can cancel before paying/verifying
    if ((current === 'pending' || current === 'awaiting_payment') && target === 'cancelled') {
      return true
    }
    // Student submits proof, moving from awaiting_payment to awaiting_verification
    if (current === 'awaiting_payment' && target === 'awaiting_verification') {
      return true
    }
    // Student CANNOT mark paid, failed, expired, refunded
    return false
  }

  // Admin permissions
  if (role === 'admin') {
    if (current === 'awaiting_verification') {
      return target === 'paid' || target === 'failed'
    }
    if (current === 'awaiting_payment') {
      return target === 'paid' || target === 'expired' || target === 'cancelled' || target === 'failed'
    }
    if (current === 'paid') {
      return target === 'refunded' || target === 'partially_refunded'
    }
    if (current === 'pending') {
      return target === 'awaiting_payment' || target === 'cancelled'
    }
    if (current === 'failed' || current === 'expired') {
      // Re-triggering or administrative retry
      return target === 'awaiting_payment'
    }
    return false
  }

  return false
}

/**
 * Verifies if a student is eligible to review a tutoring session.
 * Requirements:
 * - Booking belongs to current student
 * - Booking status is 'completed'
 * - Payment status is 'paid'
 * - No previous review has been submitted
 */
export interface ReviewEligibilityInput {
  bookingStudentId: string
  bookingStatus: BookingStatus
  paymentStatus?: PaymentStatus | null
  hasReview?: boolean
}

export function isEligibleForReview(
  booking: ReviewEligibilityInput,
  currentStudentId: string
): { eligible: boolean; reason?: string } {
  if (booking.bookingStudentId !== currentStudentId) {
    return { eligible: false, reason: 'BOOKING_NOT_AUTHORIZED' }
  }

  if (booking.hasReview) {
    return { eligible: false, reason: 'REVIEW_ALREADY_EXISTS' }
  }

  if (booking.bookingStatus !== 'completed') {
    return { eligible: false, reason: 'SESSION_NOT_COMPLETED' }
  }

  if (booking.paymentStatus !== 'paid') {
    return { eligible: false, reason: 'PAYMENT_NOT_PAID' }
  }

  return { eligible: true }
}

/**
 * Calculates aggregate learning path progress from subject progress items.
 * Weighting: Equal weighting across all subjects.
 * Returns an integer percentage (0 to 100).
 */
export function calculateLearningPathProgress(
  subjects: Array<{ progressPercentage: number }>
): number {
  if (!subjects || subjects.length === 0) return 0
  const total = subjects.reduce((acc, curr) => acc + Math.max(0, Math.min(100, curr.progressPercentage)), 0)
  return Math.round(total / subjects.length)
}
