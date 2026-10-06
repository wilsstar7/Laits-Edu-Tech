export type ReportStatus = 'generating' | 'ready' | 'failed' | 'deleted'

export const REPORT_VERSION = '1.0'

export interface PersonalityReport {
  id: string
  user_id: string
  assessment_result_id: string
  file_path: string
  file_name: string
  file_size: number
  mime_type: string
  report_version: string
  status: ReportStatus
  generated_at: string
  created_at: string
  updated_at: string
  signedUrl?: string | null
}

export interface NormalizedReportDimension {
  name: string
  code: string
  score: number
  rawScore?: number
  description: string
}

export interface PersonalityReportData {
  student: {
    id: string
    name: string
    email: string
    grade?: string | null
    school?: string | null
  }
  assessment: {
    id: string
    name: string
    completedAt: string
  }
  personality: {
    name: string
    code: string
    description: string
    overallScore: number
    strengths: string[]
    challenges: string[]
    learningStyle: string
    communicationStyle: string
    motivation: string
    recommendedStudyMethod: string[]
    recommendedSubjects: string[]
    recommendedTutorStyle: string[]
  }
  dimensions: NormalizedReportDimension[]
  metadata: {
    reportVersion: string
    generatedAt: string
    isDemo: boolean
    title: string
    author: string
    subject: string
    keywords: string[]
  }
}

export interface ReportMetadata {
  title: string
  author: string
  subject: string
  keywords: string[]
  reportVersion: string
  generatedAt: string
  isDemo: boolean
}

export interface ReportGenerationResponse {
  success: boolean
  report: PersonalityReport
  isNew: boolean
  message?: string
}
