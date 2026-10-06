import type { SubjectSummary } from '@/services/subjectService'

export interface TutorSummary {
  id: string
  userId: string
  fullName: string
  email: string
  avatarUrl: string | null
  headline: string | null
  bio: string | null
  educationBackground: string | null
  experience: string | null
  experienceYears: number
  teachingStyle: string | null
  hourlyRate: number
  rating: number
  totalReviews: number
  isVerified: boolean
  subjects: SubjectSummary[]
  availabilityCount?: number
  matchScore?: number
  matchReasons?: string[]
}

export interface TutorAvailabilityRule {
  id: string
  tutorId: string
  dayOfWeek: number // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string // "HH:MM:SS" or "HH:MM"
  endTime: string
  timezone: string
  isActive: boolean
}

export interface AvailableTimeSlot {
  slotId: string
  scheduledStart: string // ISO string
  scheduledEnd: string // ISO string
  dayOfWeek: number
  startTimeStr: string // "16:00"
  endTimeStr: string // "17:00"
  durationMinutes: number
  isBooked: boolean
  timezone: string
}

export interface TutorFilterState {
  search: string
  subjectId: string
  minRating: number | null
  maxHourlyRate: number | null
  teachingStyle: string
  minExperienceYears: number | null
  availableDay: number | null
}

export type TutorSortOption =
  | 'recommended'
  | 'rating_desc'
  | 'price_asc'
  | 'price_desc'
  | 'experience_desc'

export const TUTOR_MATCH_WEIGHTS = {
  subjectMatch: 0.40,
  teachingStyleMatch: 0.30,
  availabilityMatch: 0.15,
  rating: 0.10,
  experience: 0.05,
} as const
