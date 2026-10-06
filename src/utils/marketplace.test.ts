import { describe, it, expect } from 'vitest'
import {
  calculateSessionPrice,
  canTransitionPaymentStatus,
  isEligibleForReview,
  calculateLearningPathProgress,
} from './marketplace'

describe('Marketplace Domain Utilities (Phase 5)', () => {
  describe('calculateSessionPrice', () => {
    it('calculates 60-minute session correctly as exact hourly rate', () => {
      expect(calculateSessionPrice(75000, 60)).toBe(75000)
      expect(calculateSessionPrice(100000, 60)).toBe(100000)
    })

    it('calculates 90-minute session accurately without floating-point errors', () => {
      // 75.000 * 90 / 60 = 112.500
      expect(calculateSessionPrice(75000, 90)).toBe(112500)
    })

    it('calculates 45-minute session correctly', () => {
      // 80.000 * 45 / 60 = 60.000
      expect(calculateSessionPrice(80000, 45)).toBe(60000)
    })

    it('handles edge cases safely (zero or negative)', () => {
      expect(calculateSessionPrice(0, 60)).toBe(0)
      expect(calculateSessionPrice(75000, 0)).toBe(0)
      expect(calculateSessionPrice(-50000, 60)).toBe(0)
    })
  })

  describe('canTransitionPaymentStatus', () => {
    describe('student permissions', () => {
      it('allows student to transition from awaiting_payment to awaiting_verification after proof upload', () => {
        expect(canTransitionPaymentStatus('awaiting_payment', 'awaiting_verification', 'student')).toBe(true)
      })

      it('allows student to cancel an awaiting_payment order', () => {
        expect(canTransitionPaymentStatus('awaiting_payment', 'cancelled', 'student')).toBe(true)
      })

      it('STRICT: prevents student from ever marking status as paid directly', () => {
        expect(canTransitionPaymentStatus('pending', 'paid', 'student')).toBe(false)
        expect(canTransitionPaymentStatus('awaiting_payment', 'paid', 'student')).toBe(false)
        expect(canTransitionPaymentStatus('awaiting_verification', 'paid', 'student')).toBe(false)
      })

      it('prevents student from marking payment as failed or expired', () => {
        expect(canTransitionPaymentStatus('awaiting_payment', 'failed', 'student')).toBe(false)
        expect(canTransitionPaymentStatus('awaiting_payment', 'expired', 'student')).toBe(false)
      })
    })

    describe('tutor permissions', () => {
      it('STRICT: tutor has zero payment state transition permissions', () => {
        expect(canTransitionPaymentStatus('awaiting_payment', 'paid', 'tutor')).toBe(false)
        expect(canTransitionPaymentStatus('awaiting_verification', 'paid', 'tutor')).toBe(false)
        expect(canTransitionPaymentStatus('paid', 'refunded', 'tutor')).toBe(false)
        expect(canTransitionPaymentStatus('awaiting_payment', 'cancelled', 'tutor')).toBe(false)
      })
    })

    describe('admin permissions', () => {
      it('allows admin to approve manual transfer (awaiting_verification -> paid)', () => {
        expect(canTransitionPaymentStatus('awaiting_verification', 'paid', 'admin')).toBe(true)
      })

      it('allows admin to reject manual transfer (awaiting_verification -> failed)', () => {
        expect(canTransitionPaymentStatus('awaiting_verification', 'failed', 'admin')).toBe(true)
      })

      it('allows admin to expire an unpaid payment', () => {
        expect(canTransitionPaymentStatus('awaiting_payment', 'expired', 'admin')).toBe(true)
      })

      it('allows admin to refund a paid payment', () => {
        expect(canTransitionPaymentStatus('paid', 'refunded', 'admin')).toBe(true)
        expect(canTransitionPaymentStatus('paid', 'partially_refunded', 'admin')).toBe(true)
      })
    })
  })

  describe('isEligibleForReview', () => {
    const validBooking = {
      bookingStudentId: 'student-123',
      bookingStatus: 'completed' as const,
      paymentStatus: 'paid' as const,
      hasReview: false,
    }

    it('returns eligible: true when all criteria are satisfied', () => {
      const result = isEligibleForReview(validBooking, 'student-123')
      expect(result.eligible).toBe(true)
    })

    it('rejects if current student is not the booking owner', () => {
      const result = isEligibleForReview(validBooking, 'different-student-456')
      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('BOOKING_NOT_AUTHORIZED')
    })

    it('rejects if a review has already been submitted for this booking', () => {
      const alreadyReviewed = { ...validBooking, hasReview: true }
      const result = isEligibleForReview(alreadyReviewed, 'student-123')
      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('REVIEW_ALREADY_EXISTS')
    })

    it('rejects if session is not yet completed', () => {
      const pendingSession = { ...validBooking, bookingStatus: 'confirmed' as const }
      const result = isEligibleForReview(pendingSession, 'student-123')
      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('SESSION_NOT_COMPLETED')
    })

    it('rejects if session is completed but payment is not paid', () => {
      const unpaidSession = { ...validBooking, paymentStatus: 'awaiting_payment' as const }
      const result = isEligibleForReview(unpaidSession, 'student-123')
      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('PAYMENT_NOT_PAID')
    })
  })

  describe('calculateLearningPathProgress', () => {
    it('returns 0 when no subjects are enrolled', () => {
      expect(calculateLearningPathProgress([])).toBe(0)
    })

    it('calculates average percentage across subjects', () => {
      const subjects = [
        { progressPercentage: 80 },
        { progressPercentage: 60 },
        { progressPercentage: 40 },
      ]
      // (80 + 60 + 40) / 3 = 60
      expect(calculateLearningPathProgress(subjects)).toBe(60)
    })

    it('handles fractional averages by rounding to nearest integer', () => {
      const subjects = [
        { progressPercentage: 70 },
        { progressPercentage: 60 },
      ]
      // (70 + 60) / 2 = 65
      expect(calculateLearningPathProgress(subjects)).toBe(65)

      const oddSubjects = [
        { progressPercentage: 100 },
        { progressPercentage: 50 },
        { progressPercentage: 50 },
      ]
      // 200 / 3 = 66.666... -> 67
      expect(calculateLearningPathProgress(oddSubjects)).toBe(67)
    })

    it('clamps values between 0 and 100', () => {
      const clamped = [
        { progressPercentage: 120 },
        { progressPercentage: -20 },
      ]
      // (100 + 0) / 2 = 50
      expect(calculateLearningPathProgress(clamped)).toBe(50)
    })
  })
})
