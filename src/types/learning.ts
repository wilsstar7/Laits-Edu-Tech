import type { Tables } from './database'
import type { SubjectSummary } from '@/services/subjectService'

export type LearningPathRow = Tables<'learning_paths'>
export type LearningPathSubjectRow = Tables<'learning_path_subjects'>

export interface RecommendedSubject {
  id: string
  subjectId: string
  name: string
  category: 'general' | 'religious'
  description: string | null
  priority: number
  reason: string
}

export interface LearningPath {
  id: string
  title: string
  slug: string
  description: string
  thumbnailUrl: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: string
  isActive: boolean
  subjectsCount?: number
  priority?: number
  matchReason?: string
}

export interface LearningPathDetail extends LearningPath {
  subjects: SubjectSummary[]
}

export interface StudyMethod {
  title: string
  description: string
  steps: string[]
}

export interface LearningProfileOverview {
  hasResult: boolean
  personalityTypeId?: string
  personalityCode?: string
  personalityName?: string
  description?: string
  learningStyle?: string
  motivation?: string
  communicationStyle?: string
  strengths: string[]
  challenges: string[]
  recommendedStudyMethods: string[]
  recommendedTutorStyles: string[]
}
