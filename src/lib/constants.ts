import type { Gender } from '@/types'

/**
 * Grade codes must match the CHECK constraint on student_profiles.grade.
 * (UI labels only, not a source of truth for business data.)
 */
export const GRADE_OPTIONS: ReadonlyArray<{ value: string; label: string; group: string }> = [
  { value: '1', label: 'Kelas 1', group: 'SD / MI' },
  { value: '2', label: 'Kelas 2', group: 'SD / MI' },
  { value: '3', label: 'Kelas 3', group: 'SD / MI' },
  { value: '4', label: 'Kelas 4', group: 'SD / MI' },
  { value: '5', label: 'Kelas 5', group: 'SD / MI' },
  { value: '6', label: 'Kelas 6', group: 'SD / MI' },
  { value: '7', label: 'Kelas 7', group: 'SMP / MTs' },
  { value: '8', label: 'Kelas 8', group: 'SMP / MTs' },
  { value: '9', label: 'Kelas 9', group: 'SMP / MTs' },
  { value: '10', label: 'Kelas 10', group: 'SMA / SMK / MA' },
  { value: '11', label: 'Kelas 11', group: 'SMA / SMK / MA' },
  { value: '12', label: 'Kelas 12', group: 'SMA / SMK / MA' },
  { value: 'kuliah', label: 'Mahasiswa', group: 'Lainnya' },
  { value: 'umum', label: 'Umum', group: 'Lainnya' },
]

export const GRADE_VALUES = GRADE_OPTIONS.map((g) => g.value)

export function gradeLabel(value: string | null | undefined): string {
  const found = GRADE_OPTIONS.find((g) => g.value === value)
  if (!found) return '-'
  return found.group === 'Lainnya' ? found.label : `${found.label} ${found.group.split(' / ')[0]}`
}

export const GENDER_OPTIONS: ReadonlyArray<{ value: Gender; label: string }> = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
]

export const APP_NAME = 'Laits Edu'
