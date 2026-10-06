export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type LessonType = 'text' | 'video' | 'pdf' | 'audio' | 'link' | 'mixed'
export type LessonStatus = 'draft' | 'published' | 'archived'
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled'
export type EnrollmentSource = 'personalized_recommendation' | 'manual' | 'learning_path' | 'admin_assigned'
export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface CourseObjective {
  id: string
  courseId: string
  objective: string
  sortOrder: number
}

export interface LessonMaterial {
  id: string
  lessonId: string
  type: 'pdf' | 'video' | 'audio' | 'doc' | 'link'
  title: string
  storagePath: string | null
  externalUrl: string | null
  sortOrder: number
}

export interface Lesson {
  id: string
  sectionId: string
  title: string
  slug: string
  description: string
  lessonType: LessonType
  content: string
  estimatedDurationMinutes: number
  sortOrder: number
  status: LessonStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  materials?: LessonMaterial[]
  progress?: LessonProgress
}

export interface CourseSection {
  id: string
  courseId: string
  title: string
  description: string
  sortOrder: number
  lessons?: Lesson[]
}

export interface Course {
  id: string
  subjectId: string | null
  learningPathId: string | null
  title: string
  slug: string
  description: string
  thumbnailUrl: string | null
  level: CourseLevel
  status: CourseStatus
  estimatedDurationMinutes: number
  createdBy: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  subjectName?: string
  sections?: CourseSection[]
  objectives?: CourseObjective[]
  enrollment?: CourseEnrollment | null
  totalLessons?: number
  completedLessons?: number
  progressPercentage?: number
}

export interface CourseEnrollment {
  id: string
  courseId: string
  studentId: string
  status: EnrollmentStatus
  enrollmentSource: EnrollmentSource
  enrolledAt: string
  completedAt: string | null
  course?: Course
}

export interface LessonProgress {
  id: string
  studentId: string
  lessonId: string
  courseId: string
  status: LessonProgressStatus
  progressPercentage: number
  startedAt: string | null
  completedAt: string | null
  lastAccessedAt: string
}
