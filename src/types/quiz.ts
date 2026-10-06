export type QuizQuestionType = 'single_choice' | 'multiple_choice' | 'true_false'

export interface QuizOption {
  id: string
  questionId: string
  label: string
  isCorrect?: boolean
  sortOrder: number
}

export interface QuizQuestion {
  id: string
  quizId: string
  question: string
  questionType: QuizQuestionType
  points: number
  sortOrder: number
  options?: QuizOption[]
}

export interface Quiz {
  id: string
  lessonId: string
  title: string
  description: string
  passingScore: number
  maxAttempts: number
  status: 'draft' | 'published' | 'archived'
  questions?: QuizQuestion[]
}

export interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  attemptNumber: number
  score: number
  passed: boolean
  startedAt: string
  submittedAt: string | null
}

export interface QuizSubmissionAnswer {
  question_id: string
  selected_option_id: string
}

export interface QuizSubmissionResult {
  attempt_number: number
  score: number
  passing_score: number
  passed: boolean
  max_attempts: number
  remaining_attempts: number
}
