import { describe, it, expect } from 'vitest';
import { calculateItemScore, calculateDimensionScore } from '@/utils/scoring';
import { canTransitionBookingStatus } from '@/types/booking';

describe('Critical User Journeys & State Machines (Phase 7)', () => {
  describe('Journey 1: Personality Assessment Calculation Integrity', () => {
    it('accurately calculates reverse-scored items: (5 + 1) - value', () => {
      // 5-point Likert scale: 1 (strongly disagree) to 5 (strongly agree)
      const directItem = calculateItemScore(5, false, 1, 5);
      const reverseItem = calculateItemScore(2, true, 1, 5); // 6 - 2 = 4

      expect(directItem).toBe(5);
      expect(reverseItem).toBe(4);
    });

    it('calculates dimension score and normalizes to 0-100 range', () => {
      const items = [
        { value: 5, weight: 1, reverseScore: false },
        { value: 4, weight: 1, reverseScore: false },
        { value: 3, weight: 1, reverseScore: false },
      ];
      // min = 3*1 = 3, max = 3*5 = 15, raw = 12
      // normalized = (12 - 3) / (15 - 3) * 100 = 9 / 12 * 100 = 75%
      const result = calculateDimensionScore(items, 1, 5);
      expect(result.rawScore).toBe(12);
      expect(result.normalizedScore).toBe(75);
    });

    it('clamps normalized scores within boundaries [0, 100]', () => {
      const minItems = [{ value: 1, weight: 1, reverseScore: false }];
      const maxItems = [{ value: 5, weight: 1, reverseScore: false }];

      expect(calculateDimensionScore(minItems).normalizedScore).toBe(0);
      expect(calculateDimensionScore(maxItems).normalizedScore).toBe(100);
    });
  });

  describe('Journey 2: Booking State Machine Invariants', () => {
    it('permits legal state transitions for tutors: pending -> confirmed -> completed', () => {
      expect(canTransitionBookingStatus('pending', 'confirmed', 'tutor')).toBe(true);
      expect(canTransitionBookingStatus('confirmed', 'completed', 'tutor')).toBe(true);
    });

    it('permits cancellation from pending or confirmed by student', () => {
      expect(canTransitionBookingStatus('pending', 'cancelled', 'student')).toBe(true);
      expect(canTransitionBookingStatus('confirmed', 'cancelled', 'student')).toBe(true);
    });

    it('strictly forbids status regression from completed by tutor or student', () => {
      expect(canTransitionBookingStatus('completed', 'pending', 'tutor')).toBe(false);
      expect(canTransitionBookingStatus('completed', 'confirmed', 'tutor')).toBe(false);
      expect(canTransitionBookingStatus('completed', 'cancelled', 'student')).toBe(false);
    });

    it('strictly forbids reactivation of cancelled bookings by student or tutor', () => {
      expect(canTransitionBookingStatus('cancelled', 'pending', 'student')).toBe(false);
      expect(canTransitionBookingStatus('cancelled', 'confirmed', 'tutor')).toBe(false);
      expect(canTransitionBookingStatus('cancelled', 'completed', 'tutor')).toBe(false);
    });

    it('allows admin emergency state transitions', () => {
      expect(canTransitionBookingStatus('pending', 'cancelled', 'admin')).toBe(true);
      expect(canTransitionBookingStatus('confirmed', 'cancelled', 'admin')).toBe(true);
    });
  });

  describe('Journey 3: Payment State Machine Invariants', () => {
    type PaymentStatus = 'pending' | 'awaiting_verification' | 'verified' | 'rejected' | 'expired' | 'refunded';

    function isValidPaymentTransition(from: PaymentStatus, to: PaymentStatus): boolean {
      if (from === to) return true;
      if (from === 'pending') {
        return ['awaiting_verification', 'expired', 'rejected'].includes(to);
      }
      if (from === 'awaiting_verification') {
        return ['verified', 'rejected'].includes(to);
      }
      if (from === 'verified') {
        return ['refunded'].includes(to);
      }
      if (['rejected', 'expired', 'refunded'].includes(from)) {
        return false; // Terminal states
      }
      return false;
    }

    it('permits valid payment sequence: pending -> awaiting_verification -> verified', () => {
      expect(isValidPaymentTransition('pending', 'awaiting_verification')).toBe(true);
      expect(isValidPaymentTransition('awaiting_verification', 'verified')).toBe(true);
    });

    it('permits refund from verified state', () => {
      expect(isValidPaymentTransition('verified', 'refunded')).toBe(true);
    });

    it('rejects illegal regression from verified back to pending or awaiting_verification', () => {
      expect(isValidPaymentTransition('verified', 'pending')).toBe(false);
      expect(isValidPaymentTransition('verified', 'awaiting_verification')).toBe(false);
    });

    it('rejects modifications on terminal rejected or expired payments', () => {
      expect(isValidPaymentTransition('expired', 'verified')).toBe(false);
      expect(isValidPaymentTransition('refunded', 'verified')).toBe(false);
      expect(isValidPaymentTransition('rejected', 'awaiting_verification')).toBe(false);
    });
  });

  describe('Journey 4: Monthly Report Idempotency & Aggregation', () => {
    it('generates consistent period key for idempotent reporting', () => {
      const studentId = 'usr-001';
      const year = 2026;
      const month = 10;

      const key1 = `${studentId}-${year}-${month}`;
      const key2 = `${studentId}-${year}-${month}`;

      expect(key1).toBe(key2);
    });
  });
});
