export type StudentLearningPathStatus = 'not_started' | 'in_progress' | 'completed' | 'paused'

export type SubjectProgressStatus = 'not_started' | 'in_progress' | 'completed'

export type LearningSessionStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface LearningPathProgressItem {
  id: string
  studentLearningPathId: string
  subjectId: string
  subjectName: string
  subjectCategory: 'general' | 'religious'
  status: SubjectProgressStatus
  progressPercentage: number
  startedAt?: string | null
  completedAt?: string | null
}

export interface StudentLearningPath {
  id: string
  studentId: string
  learningPathId: string
  learningPathTitle: string
  learningPathSlug: string
  learningPathDescription: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: string
  status: StudentLearningPathStatus
  startedAt: string
  completedAt?: string | null
  progressPercentage: number
  subjects?: LearningPathProgressItem[]
}

export interface LearningSession {
  id: string
  bookingId: string
  studentId: string
  studentName?: string
  studentAvatarUrl?: string | null
  tutorId: string
  tutorName?: string
  tutorAvatarUrl?: string | null
  subjectId: string
  subjectName: string
  subjectCategory: 'general' | 'religious'
  startedAt: string
  endedAt: string
  durationMinutes: number
  studentNotes?: string | null
  tutorNotes?: string | null
  status: LearningSessionStatus
  hasReview?: boolean
  rating?: number
  createdAt: string
}

export interface OverallStudentProgress {
  enrolledPathsCount: number
  completedPathsCount: number
  inProgressPathsCount: number
  completedSessionsCount: number
  totalLearningMinutes: number
  averageProgress: number
}
