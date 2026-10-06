import type { Enums, Tables } from './database'

export type UserRole = Enums<'user_role'>
export type Gender = Enums<'gender_type'>
export type SubjectCategory = Enums<'subject_category'>

export type Profile = Tables<'profiles'>
export type StudentProfile = Tables<'student_profiles'>
export type TutorProfile = Tables<'tutor_profiles'>
export type Subject = Tables<'subjects'>

/** Loaded once per session by AuthProvider. */
export interface AccountBundle {
  profile: Profile
  /** Only loaded for students. `null` when the row doesn't exist yet. */
  studentProfile: StudentProfile | null
}

export interface RegisterInput {
  fullName: string
  email: string
  password: string
  dateOfBirth: string
  gender: Gender | ''
  school: string
  grade: string
  city: string
  parentName: string
  parentPhone: string
}

export interface ProfileUpdateInput {
  fullName: string
  phone: string
}

export interface StudentProfileInput {
  dateOfBirth: string
  gender: Gender | ''
  school: string
  grade: string
  city: string
  parentName: string
  parentPhone: string
}

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }

export * from './learning'
export * from './tutor'
export * from './booking'
