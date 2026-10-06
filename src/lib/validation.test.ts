import { describe, it, expect } from 'vitest';
import {
  bookingInputSchema,
  tutorAvailabilityInputSchema,
  reviewInputSchema,
  adminVerifyPaymentSchema,
  adminSetRoleSchema,
  monthlyReportQuerySchema,
  loginSchema,
  registerSchema,
  passwordRule,
  learningGoalInputSchema,
  quizSubmitSchema,
  courseCreateSchema,
  announcementCreateSchema,
} from './validation';

describe('Validation Schemas (Phase 7 Hardening)', () => {
  describe('passwordRule', () => {
    it('accepts valid password containing letters and numbers >= 8 characters', () => {
      const result = passwordRule.safeParse('ValidPass123!');
      expect(result.success).toBe(true);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const result = passwordRule.safeParse('Pass1');
      expect(result.success).toBe(false);
    });

    it('rejects passwords without numbers', () => {
      const result = passwordRule.safeParse('PasswordOnly');
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid email and non-empty password', () => {
      const result = loginSchema.safeParse({
        email: 'student@example.com',
        password: 'ValidPassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'ValidPassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const result = loginSchema.safeParse({
        email: 'student@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid student registration with required student fields', () => {
      const result = registerSchema.safeParse({
        fullName: 'Jane Doe',
        email: 'janedoe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        dateOfBirth: '2010-05-15',
        gender: 'female',
        grade: '10',
        school: 'SMA 1 Jakarta',
        city: 'Jakarta',
        parentName: '',
        parentPhone: '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects password mismatch', () => {
      const result = registerSchema.safeParse({
        fullName: 'Jane Doe',
        email: 'janedoe@example.com',
        password: 'Password123!',
        confirmPassword: 'PasswordMismatch999!',
        dateOfBirth: '2010-05-15',
        gender: 'female',
        grade: '10-sma',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('bookingInputSchema', () => {
    it('validates correct booking input', () => {
      const result = bookingInputSchema.safeParse({
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        subjectId: '123e4567-e89b-12d3-a456-426614174001',
        scheduledStart: '2026-10-15T09:00:00Z',
        scheduledEnd: '2026-10-15T10:30:00Z',
        studentNote: 'Needs help with calculus integrals',
      });
      expect(result.success).toBe(true);
    });

    it('rejects end time earlier than start time', () => {
      const result = bookingInputSchema.safeParse({
        tutorId: '123e4567-e89b-12d3-a456-426614174000',
        subjectId: '123e4567-e89b-12d3-a456-426614174001',
        scheduledStart: '2026-10-15T11:00:00Z',
        scheduledEnd: '2026-10-15T10:00:00Z',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('tutorAvailabilityInputSchema', () => {
    it('accepts valid day of week and slot times', () => {
      const result = tutorAvailabilityInputSchema.safeParse({
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '12:00',
        isActive: true,
      });
      expect(result.success).toBe(true);
    });

    it('rejects out of range day of week', () => {
      const result = tutorAvailabilityInputSchema.safeParse({
        dayOfWeek: 7, // Out of 0..6
        startTime: '08:00',
        endTime: '12:00',
      });
      expect(result.success).toBe(false);
    });

    it('rejects end time before start time', () => {
      const result = tutorAvailabilityInputSchema.safeParse({
        dayOfWeek: 1,
        startTime: '14:00',
        endTime: '10:00',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('reviewInputSchema', () => {
    it('accepts valid review rating and comment', () => {
      const result = reviewInputSchema.safeParse({
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        reviewText: 'Tutor sangat komunikatif dan menjelaskan konsep dengan jelas.',
      });
      expect(result.success).toBe(true);
    });

    it('rejects rating below 1 or above 5', () => {
      const tooLow = reviewInputSchema.safeParse({
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 0,
        reviewText: 'Too low',
      });
      const tooHigh = reviewInputSchema.safeParse({
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6,
        reviewText: 'Too high',
      });
      expect(tooLow.success).toBe(false);
      expect(tooHigh.success).toBe(false);
    });
  });

  describe('adminVerifyPaymentSchema', () => {
    it('accepts approve decision', () => {
      const result = adminVerifyPaymentSchema.safeParse({
        paymentId: '123e4567-e89b-12d3-a456-426614174000',
        decision: 'approve',
      });
      expect(result.success).toBe(true);
    });

    it('accepts reject decision with rejection reason', () => {
      const result = adminVerifyPaymentSchema.safeParse({
        paymentId: '123e4567-e89b-12d3-a456-426614174000',
        decision: 'reject',
        rejectionReason: 'Bukti transfer buram dan nominal tidak cocok',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('adminSetRoleSchema', () => {
    it('accepts valid role assignment', () => {
      const result = adminSetRoleSchema.safeParse({
        targetUserId: '123e4567-e89b-12d3-a456-426614174000',
        newRole: 'tutor',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid role name', () => {
      const result = adminSetRoleSchema.safeParse({
        targetUserId: '123e4567-e89b-12d3-a456-426614174000',
        newRole: 'super_hacker',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('monthlyReportQuerySchema', () => {
    it('validates year and month bounds', () => {
      const valid = monthlyReportQuerySchema.safeParse({
        year: 2026,
        month: 10,
      });
      expect(valid.success).toBe(true);

      const invalidMonth = monthlyReportQuerySchema.safeParse({
        year: 2026,
        month: 13,
      });
      expect(invalidMonth.success).toBe(false);
    });
  });

  describe('Phase 8 Schemas', () => {
    describe('learningGoalInputSchema', () => {
      it('validates a valid learning goal', () => {
        const result = learningGoalInputSchema.safeParse({
          title: 'Selesaikan Modul Nahwu Dasar',
          description: 'Belajar 30 menit per hari',
          targetType: 'sessions',
          targetValue: 10,
          targetDate: '2026-11-01',
        });
        expect(result.success).toBe(true);
      });

      it('rejects targetValue <= 0', () => {
        const result = learningGoalInputSchema.safeParse({
          title: 'Belajar',
          targetType: 'sessions',
          targetValue: 0,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('quizSubmitSchema', () => {
      it('validates answers submission array', () => {
        const result = quizSubmitSchema.safeParse({
          answers: [
            { questionId: '123e4567-e89b-12d3-a456-426614174000', selectedOptionId: '123e4567-e89b-12d3-a456-426614174001' },
          ],
        });
        expect(result.success).toBe(true);
      });

      it('rejects empty answers array', () => {
        const result = quizSubmitSchema.safeParse({
          answers: [],
        });
        expect(result.success).toBe(false);
      });
    });

    describe('courseCreateSchema', () => {
      it('validates course creation payload', () => {
        const result = courseCreateSchema.safeParse({
          title: 'Bahasa Arab Dasar Nahwu',
          slug: 'bahasa-arab-dasar-nahwu',
          description: 'Panduan lengkap tata bahasa Arab bagi pemula.',
          level: 'BEGINNER',
          estimatedDurationMinutes: 120,
        });
        expect(result.success).toBe(true);
      });

      it('rejects course creation with short title or invalid slug', () => {
        const result = courseCreateSchema.safeParse({
          title: 'Ab',
          slug: 'Invalid Slug!',
          description: 'Desc',
        });
        expect(result.success).toBe(false);
      });
    });

    describe('announcementCreateSchema', () => {
      it('validates valid announcement payload', () => {
        const result = announcementCreateSchema.safeParse({
          title: 'Pembaruan Jadwal Belajar',
          content: 'Pemberitahuan kepada seluruh siswa mengenai libur nasional.',
          audience: 'students',
        });
        expect(result.success).toBe(true);
      });

      it('rejects announcement with invalid audience', () => {
        const result = announcementCreateSchema.safeParse({
          title: 'Judul',
          content: 'Konten',
          audience: 'aliens',
        });
        expect(result.success).toBe(false);
      });
    });
  });
});
