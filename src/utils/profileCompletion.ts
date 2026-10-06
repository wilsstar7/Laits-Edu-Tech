import type { Profile, StudentProfile } from '@/types'

interface CompletionField {
  label: string
  filled: boolean
}

export interface ProfileCompletion {
  percent: number
  filledCount: number
  totalCount: number
  missing: string[]
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/** Real completion score computed from the student's stored profile data. */
export function getStudentProfileCompletion(
  profile: Profile,
  student: StudentProfile | null,
): ProfileCompletion {
  const fields: CompletionField[] = [
    { label: 'Nama lengkap', filled: hasText(profile.full_name) },
    { label: 'Email', filled: hasText(profile.email) },
    { label: 'Nomor telepon', filled: hasText(profile.phone) },
    { label: 'Tanggal lahir', filled: hasText(student?.date_of_birth) },
    { label: 'Jenis kelamin', filled: student?.gender != null },
    { label: 'Sekolah', filled: hasText(student?.school) },
    { label: 'Kelas', filled: hasText(student?.grade) },
    { label: 'Kota', filled: hasText(student?.city) },
    { label: 'Nama orang tua', filled: hasText(student?.parent_name) },
    { label: 'Telepon orang tua', filled: hasText(student?.parent_phone) },
  ]

  const filledCount = fields.filter((f) => f.filled).length
  return {
    percent: Math.round((filledCount / fields.length) * 100),
    filledCount,
    totalCount: fields.length,
    missing: fields.filter((f) => !f.filled).map((f) => f.label),
  }
}

/** Students must provide the minimum required data before using the app. */
export function studentNeedsOnboarding(profile: Profile, student: StudentProfile | null): boolean {
  if (profile.role !== 'student') return false
  return !hasText(profile.full_name) || !student || !student.date_of_birth || !hasText(student.grade)
}
