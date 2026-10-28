import type { StudentLevel, AssessmentPackageCode } from '@/data/personaModalityData'

export type QuestionType = 'multiple_choice' | 'likert' | 'yes_no' | 'scale' | 'text'
export type SessionStatus = 'not_started' | 'in_progress' | 'submitted' | 'scored' | 'abandoned'
export type RuleOperator = 'gte' | 'gt' | 'lte' | 'lt' | 'between'

export type { StudentLevel, AssessmentPackageCode }

export interface AssessmentOption {
  id: string
  question_id: string
  label: string
  value: number | string
  display_order: number
  indicator?: string
}

export interface AssessmentQuestion {
  id: string
  assessment_id: string
  dimension_id?: string
  module_code?: string
  cluster?: string
  question_text: string
  question_type: QuestionType
  display_order: number
  required: boolean
  weight: number
  reverse_score: boolean
  is_active: boolean
  levels?: StudentLevel[]
  assessment_options?: AssessmentOption[]
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

export interface AssessmentSession {
  id: string
  assessment_id: string
  user_id: string
  status: SessionStatus
  current_question_index: number
  student_level?: StudentLevel
  package_code?: AssessmentPackageCode
  target_package_code?: AssessmentPackageCode
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

// =============================================================================
// SPESIFIKASI SKORING BARU SESUAI SOAL.MD (BAGIAN 4.2)
// =============================================================================

export interface VakModuleResult {
  total_questions: number
  scores: {
    V: number
    A: number
    K: number
  }
  percentages: {
    V: number
    A: number
    K: number
  }
  dominance_type: 'SINGLE_DOMINANCE' | 'BIMODAL' | 'MULTIMODAL'
  primary_modality: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'MULTIMODAL'
  secondary_modality: 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | null
  title: string
  summary: string
  study_recommendations: string[]
  tutor_sop: string
}

export interface BrainDominanceModuleResult {
  total_questions: number
  scores: {
    LEFT_BRAIN: number
    RIGHT_BRAIN: number
  }
  percentages: {
    LEFT_BRAIN: number
    RIGHT_BRAIN: number
  }
  dominance_category: 'LEFT_DOMINANT' | 'RIGHT_DOMINANT' | 'WHOLE_BRAIN'
  tutor_sop_key: 'SOP_HEM_LEFT' | 'SOP_HEM_RIGHT' | 'SOP_HEM_WHOLE_BRAIN'
  title: string
  summary: string
  tutor_sop: string
}

export interface HabitClusterResult {
  scores: {
    A: number
    B: number
    C: number
  }
  result: string
  title: string
  description: string
  tutor_sop_key: string
  tutor_sop: string
}

export interface HabitsModuleResult {
  total_questions: number
  clusters: {
    chronobiology: HabitClusterResult
    environment: HabitClusterResult
    attention_span: HabitClusterResult
  }
}

export interface PersonaModalityResult {
  package_code: 'PAKET_1_PERSONA_MODALITY'
  student_level: StudentLevel
  modules: {
    PM_VAK_01: VakModuleResult
    PM_HEM_02?: BrainDominanceModuleResult
    PM_SKB_03?: HabitsModuleResult
  }
}

// =============================================================================
// SPESIFIKASI PAKET 2: PERSONA POTENTIAL (SESUAI SOAL-PAKET-2.MD)
// =============================================================================

export type MbtiDimensionKey = 'EI' | 'SN' | 'TF' | 'JP'

export interface MbtiDimensionDetail {
  leftScore: number
  rightScore: number
  dominant: string
  percentage: number
}

export interface MbtiModuleResult {
  total_questions: number
  personality_code: string
  title: string
  nickname: string
  description: string
  dimensions: {
    EI: { E: number; I: number; dominant: 'E' | 'I'; percentage: number }
    SN: { S: number; N: number; dominant: 'S' | 'N'; percentage: number }
    TF: { T: number; F: number; dominant: 'T' | 'F'; percentage: number }
    JP: { J: number; P: number; dominant: 'J' | 'P'; percentage: number }
  }
  active_tutor_sops: string[]
  tutor_sop_details: Array<{
    dimension: string
    letter: string
    rule: string
    instruction: string
  }>
}

export type MiCategoryCode =
  | 'MI_LINGUISTIK'
  | 'MI_LOGIS'
  | 'MI_SPASIAL'
  | 'MI_KINESTETIK'
  | 'MI_MUSIKAL'
  | 'MI_INTERPERSONAL'
  | 'MI_INTRAPERSONAL'
  | 'MI_NATURALIS'

export interface MiCategoryScore {
  category: MiCategoryCode
  name: string
  alias: string
  raw: number
  percentage: number
  description: string
  gateway_strategy: string
}

export interface MultipleIntelligencesModuleResult {
  total_questions: number
  max_score_per_category: number
  scores: Record<MiCategoryCode, MiCategoryScore>
  ranking: MiCategoryScore[]
  top_3_gateways: MiCategoryCode[]
}

export interface PersonaPotentialResult {
  package_code: 'PAKET_2_PERSONA_POTENTIAL'
  student_level: StudentLevel
  paket_1_results: {
    PM_VAK_01: VakModuleResult
    PM_HEM_02?: BrainDominanceModuleResult
    PM_SKB_03?: HabitsModuleResult
  }
  paket_2_modules: {
    PP_MBTI_02: MbtiModuleResult
    PP_MI_03: MultipleIntelligencesModuleResult
  }
}

// Compatibility layer for existing reports & dashboard cards
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
  student_level?: StudentLevel
  package_code?: AssessmentPackageCode
  target_package_code?: AssessmentPackageCode
  modality_result?: PersonaModalityResult
  potential_result?: PersonaPotentialResult
  personality_type?: PersonalityType
  dimensions?: DimensionResult[]
}
