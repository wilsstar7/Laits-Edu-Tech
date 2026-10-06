import { z } from 'zod'
import { GRADE_VALUES } from './constants'
import { isValidIsoDate, todayIsoDate } from '@/utils/format'

/**
 * Form validation schemas (Indonesian messages).
 * Rules mirror database CHECK constraints so invalid data is caught early,
 * but the database remains the final authority.
 */

const PHONE_REGEX = /^\+?[0-9][0-9 -]{6,19}$/

const email = z
  .string()
  .trim()
  .min(1, 'Email wajib diisi.')
  .max(320, 'Email terlalu panjang.')
  .email('Silakan masukkan email yang valid.')

export const passwordRule = z
  .string()
  .min(8, 'Password minimal 8 karakter.')
  .max(72, 'Password maksimal 72 karakter.')
  .regex(/[A-Za-z]/, 'Password harus mengandung huruf.')
  .regex(/[0-9]/, 'Password harus mengandung angka.')

const fullName = z
  .string()
  .trim()
  .min(1, 'Nama lengkap wajib diisi.')
  .min(2, 'Nama lengkap minimal 2 karakter.')
  .max(120, 'Nama lengkap maksimal 120 karakter.')

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === '' || PHONE_REGEX.test(v), 'Nomor telepon tidak valid. Contoh: 081234567890')

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter.`)

const dateOfBirth = z
  .string()
  .min(1, 'Tanggal lahir wajib diisi.')
  .refine(isValidIsoDate, 'Tanggal lahir tidak valid.')
  .refine((v) => v <= todayIsoDate(), 'Tanggal lahir tidak boleh di masa depan.')
  .refine((v) => {
    const year = Number(v.slice(0, 4))
    const age = new Date().getFullYear() - year
    return age >= 4 && age <= 100
  }, 'Tanggal lahir tidak valid. Usia harus antara 4 dan 100 tahun.')

const gender = z.enum(['', 'male', 'female'])

const grade = z
  .string()
  .min(1, 'Silakan pilih kelas.')
  .refine((v) => GRADE_VALUES.includes(v), 'Silakan pilih kelas yang valid.')

const studentFields = {
  dateOfBirth,
  gender,
  school: optionalText(150, 'Nama sekolah'),
  grade,
  city: optionalText(100, 'Kota'),
  parentName: optionalText(120, 'Nama orang tua'),
  parentPhone: optionalPhone,
}

// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password wajib diisi.'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName,
    email,
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
    ...studentFields,
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Konfirmasi password tidak sama.',
    path: ['confirmPassword'],
  })
export type RegisterValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Konfirmasi password tidak sama.',
    path: ['confirmPassword'],
  })
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi.'),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Konfirmasi password tidak sama.',
    path: ['confirmPassword'],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: 'Password baru harus berbeda dari password lama.',
    path: ['newPassword'],
  })
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export const accountInfoSchema = z.object({
  fullName,
  phone: optionalPhone,
})
export type AccountInfoValues = z.infer<typeof accountInfoSchema>

export const studentProfileSchema = z.object({
  fullName,
  phone: optionalPhone,
  ...studentFields,
})
export type StudentProfileValues = z.infer<typeof studentProfileSchema>

// ---------------------------------------------------------------------------
// Phase 4–7 Domain Input Validation Schemas
// ---------------------------------------------------------------------------

export const bookingInputSchema = z
  .object({
    tutorId: z.string().min(1, 'Tutor wajib dipilih.'),
    subjectId: z.string().min(1, 'Mata pelajaran wajib dipilih.'),
    scheduledStart: z.string().min(1, 'Waktu mulai wajib diisi.'),
    scheduledEnd: z.string().min(1, 'Waktu selesai wajib diisi.'),
    timezone: z.string().default('Asia/Jakarta'),
    studentNote: optionalText(1000, 'Catatan siswa'),
  })
  .refine(
    (data) => new Date(data.scheduledEnd).getTime() > new Date(data.scheduledStart).getTime(),
    {
      message: 'Waktu selesai harus lebih lambat dari waktu mulai.',
      path: ['scheduledEnd'],
    }
  )
export type BookingInputValues = z.infer<typeof bookingInputSchema>

export const tutorAvailabilityInputSchema = z
  .object({
    dayOfWeek: z.number().int().min(0, 'Hari tidak valid.').max(6, 'Hari tidak valid.'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam mulai tidak valid (HH:MM).'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam selesai tidak valid (HH:MM).'),
    timezone: z.string().default('Asia/Jakarta'),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Jam selesai harus setelah jam mulai.',
    path: ['endTime'],
  })
export type TutorAvailabilityInputValues = z.infer<typeof tutorAvailabilityInputSchema>

export const reviewInputSchema = z.object({
  bookingId: z.string().min(1, 'ID sesi bimbingan wajib ada.'),
  rating: z.number().int().min(1, 'Rating minimal 1 bintang.').max(5, 'Rating maksimal 5 bintang.'),
  reviewText: optionalText(1000, 'Ulasan'),
})
export type ReviewInputValues = z.infer<typeof reviewInputSchema>

export const adminVerifyPaymentSchema = z.object({
  paymentId: z.string().min(1, 'ID pembayaran wajib diisi.'),
  decision: z.enum(['approve', 'reject']),
  rejectionReason: z.string().trim().max(500, 'Alasan penolakan maksimal 500 karakter.').optional(),
})
export type AdminVerifyPaymentValues = z.infer<typeof adminVerifyPaymentSchema>

export const adminSetRoleSchema = z.object({
  targetUserId: z.string().min(1, 'ID pengguna target wajib diisi.'),
  newRole: z.enum(['student', 'tutor', 'admin', 'super_admin']),
})
export type AdminSetRoleValues = z.infer<typeof adminSetRoleSchema>

export const monthlyReportQuerySchema = z.object({
  year: z.number().int().min(2024, 'Tahun tidak valid.'),
  month: z.number().int().min(1, 'Bulan harus antara 1 dan 12.').max(12, 'Bulan harus antara 1 dan 12.'),
})
export type MonthlyReportQueryValues = z.infer<typeof monthlyReportQuerySchema>

// ---------------------------------------------------------------------------
// Phase 8 Learning, Quiz, Assignment & Engagement Validation Schemas
// ---------------------------------------------------------------------------

export const learningGoalInputSchema = z.object({
  title: z.string().trim().min(2, 'Judul target minimal 2 karakter.').max(120, 'Judul target maksimal 120 karakter.'),
  description: optionalText(500, 'Deskripsi target'),
  targetType: z.enum(['sessions', 'courses', 'lessons', 'minutes']),
  targetValue: z.number().min(1, 'Nilai target minimal 1.'),
  targetDate: z.string().optional().nullable(),
})
export type LearningGoalInputValues = z.infer<typeof learningGoalInputSchema>

export const assignmentSubmitSchema = z.object({
  assignmentId: z.string().min(1, 'ID tugas wajib diisi.'),
  content: z.string().trim().min(5, 'Jawaban tugas minimal 5 karakter.').max(5000, 'Jawaban tugas maksimal 5000 karakter.'),
  attachmentPath: z.string().optional().nullable(),
})
export type AssignmentSubmitValues = z.infer<typeof assignmentSubmitSchema>

export const quizSubmissionAnswerSchema = z.object({
  questionId: z.string().min(1).optional(),
  question_id: z.string().min(1).optional(),
  selectedOptionId: z.string().min(1).optional(),
  selected_option_id: z.string().min(1).optional(),
}).refine(
  (d) => Boolean(d.questionId || d.question_id) && Boolean(d.selectedOptionId || d.selected_option_id),
  { message: 'Pertanyaan dan opsi jawaban wajib dipilih.' }
)

export const quizSubmitSchema = z.object({
  quizId: z.string().min(1).optional(),
  answers: z.array(quizSubmissionAnswerSchema).min(1, 'Harap jawab minimal 1 pertanyaan kuis.'),
})
export type QuizSubmitValues = z.infer<typeof quizSubmitSchema>

export const announcementCreateSchema = z.object({
  title: z.string().trim().min(3, 'Judul pengumuman minimal 3 karakter.').max(150, 'Judul pengumuman maksimal 150 karakter.'),
  content: z.string().trim().min(10, 'Isi pengumuman minimal 10 karakter.').max(3000, 'Isi pengumuman maksimal 3000 karakter.'),
  audience: z.enum(['all', 'students', 'tutors', 'admins']),
})
export type AnnouncementCreateValues = z.infer<typeof announcementCreateSchema>

export const courseCreateSchema = z.object({
  title: z.string().trim().min(3, 'Judul kursus minimal 3 karakter.').max(150, 'Judul kursus maksimal 150 karakter.'),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(10, 'Deskripsi kursus minimal 10 karakter.').max(1500, 'Deskripsi kursus maksimal 1500 karakter.'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('beginner'),
  estimatedDurationMinutes: z.number().int().min(10, 'Estimasi durasi minimal 10 menit.').max(3000, 'Estimasi durasi maksimal 3000 menit.'),
  subjectId: z.string().optional().nullable(),
})
export type CourseCreateValues = z.infer<typeof courseCreateSchema>

