export type QuestionType = 'likert' | 'multiple_choice' | 'yes_no' | 'scale' | 'text'
export type SessionStatus = 'not_started' | 'in_progress' | 'submitted' | 'scored' | 'abandoned'
export type RuleOperator = 'gte' | 'gt' | 'lte' | 'lt' | 'between'

export interface Assessment {
  id: string
  name: string
  slug: string
  description: string
  instructions: string
  estimated_minutes: number
  is_active: boolean
  version: number
  created_at: string
  updated_at: string
}

export interface AssessmentDimension {
  id: string
  assessment_id: string
  name: string
  code: string
  description: string
  min_score: number
  max_score: number
  display_order: number
}

export interface AssessmentOption {
  id: string
  question_id: string
  label: string
  value: number
  display_order: number
}

export interface AssessmentQuestion {
  id: string
  assessment_id: string
  dimension_id: string
  question_text: string
  question_type: QuestionType
  display_order: number
  required: boolean
  weight: number
  reverse_score: boolean
  is_active: boolean
  assessment_options?: AssessmentOption[]
}

export interface AssessmentSession {
  id: string
  assessment_id: string
  user_id: string
  status: SessionStatus
  current_question_index: number
  consent_at: string
  started_at: string
  last_saved_at: string
  completed_at: string | null
}

export interface AssessmentAnswer {
  id?: string
  session_id: string
  question_id: string
  option_id: string
  score?: number | null
  answered_at?: string
}

export interface PersonalityType {
  id: string
  assessment_id: string
  name: string
  code: string
  description: string
  strengths: string[]
  challenges: string[]
  learning_style: string
  communication_style: string
  motivation: string
  recommended_study_method: string[]
  recommended_subjects: string[]
  recommended_tutor_style: string[]
}

export interface DimensionResult {
  id: string
  result_id: string
  dimension_id: string
  raw_score: number
  normalized_score: number
  percentile: number | null
  dimension?: AssessmentDimension
}

export interface AssessmentResult {
  id: string
  session_id: string
  user_id: string
  assessment_id: string
  personality_type_id: string
  overall_score: number
  completed_at: string
  created_at: string
  personality_type?: PersonalityType
  dimensions?: DimensionResult[]
}
