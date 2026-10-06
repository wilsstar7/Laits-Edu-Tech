export type GoalTargetType = 'sessions' | 'courses' | 'lessons' | 'minutes'
export type GoalStatus = 'active' | 'completed' | 'cancelled'

export interface LearningGoal {
  id: string
  studentId: string
  title: string
  description: string
  targetType: GoalTargetType
  targetValue: number
  currentValue: number
  startDate: string
  targetDate: string | null
  status: GoalStatus
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StudentStreak {
  studentId: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  criteriaType: 'course_completed' | 'quiz_passed' | 'streak_days' | 'lessons_completed'
  criteriaValue: number
  status: 'active' | 'inactive'
  isEarned?: boolean
  earnedAt?: string | null
}

export interface StudentAchievement {
  id: string
  studentId: string
  achievementId: string
  earnedAt: string
  achievement?: Achievement
}

export interface Certificate {
  id: string
  studentId: string
  courseId: string
  certificateNumber: string
  issuedAt: string
  metadata: {
    completion_progress?: number
    [key: string]: unknown
  }
  course?: {
    title: string
    level: string
    thumbnailUrl?: string | null
  }
  student?: {
    fullName: string
  }
}

export interface CertificateVerificationResult {
  isValid: boolean
  certificateNumber?: string
  issuedAt?: string
  courseTitle?: string
  courseLevel?: string
  studentName?: string
}
