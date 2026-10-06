export type AssignmentStatus = 'draft' | 'published' | 'archived'
export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned'

export interface Assignment {
  id: string
  lessonId: string
  title: string
  description: string
  dueAt: string | null
  maxScore: number
  status: AssignmentStatus
  createdAt: string
  submission?: AssignmentSubmission | null
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  content: string
  attachmentPath: string | null
  status: SubmissionStatus
  score: number | null
  feedback: string | null
  submittedAt: string | null
  gradedAt: string | null
  gradedBy: string | null
}
