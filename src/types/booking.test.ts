import { describe, it, expect } from 'vitest'
import { canTransitionBookingStatus } from './booking'

describe('canTransitionBookingStatus', () => {
  describe('student transitions', () => {
    it('allows student to cancel pending booking', () => {
      expect(canTransitionBookingStatus('pending', 'cancelled', 'student')).toBe(true)
    })

    it('allows student to cancel confirmed booking', () => {
      expect(canTransitionBookingStatus('confirmed', 'cancelled', 'student')).toBe(true)
    })

    it('prevents student from cancelling completed or already cancelled booking', () => {
      expect(canTransitionBookingStatus('completed', 'cancelled', 'student')).toBe(false)
      expect(canTransitionBookingStatus('cancelled', 'cancelled', 'student')).toBe(false)
    })

    it('prevents student from confirming, completing, or rejecting a booking', () => {
      expect(canTransitionBookingStatus('pending', 'confirmed', 'student')).toBe(false)
      expect(canTransitionBookingStatus('confirmed', 'completed', 'student')).toBe(false)
      expect(canTransitionBookingStatus('pending', 'rejected', 'student')).toBe(false)
    })
  })

  describe('tutor transitions', () => {
    it('allows tutor to confirm a pending booking', () => {
      expect(canTransitionBookingStatus('pending', 'confirmed', 'tutor')).toBe(true)
    })

    it('allows tutor to reject a pending booking', () => {
      expect(canTransitionBookingStatus('pending', 'rejected', 'tutor')).toBe(true)
    })

    it('allows tutor to complete a confirmed booking', () => {
      expect(canTransitionBookingStatus('confirmed', 'completed', 'tutor')).toBe(true)
    })

    it('allows tutor to cancel a pending or confirmed booking', () => {
      expect(canTransitionBookingStatus('pending', 'cancelled', 'tutor')).toBe(true)
      expect(canTransitionBookingStatus('confirmed', 'cancelled', 'tutor')).toBe(true)
    })

    it('prevents tutor from modifying completed booking', () => {
      expect(canTransitionBookingStatus('completed', 'confirmed', 'tutor')).toBe(false)
      expect(canTransitionBookingStatus('completed', 'cancelled', 'tutor')).toBe(false)
    })
  })

  describe('admin transitions', () => {
    it('allows admin to transition between any status', () => {
      expect(canTransitionBookingStatus('pending', 'confirmed', 'admin')).toBe(true)
      expect(canTransitionBookingStatus('confirmed', 'cancelled', 'admin')).toBe(true)
      expect(canTransitionBookingStatus('cancelled', 'pending', 'admin')).toBe(true)
    })
  })
})
