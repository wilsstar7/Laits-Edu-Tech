import { requireSupabase } from '@/lib/supabase'
import type {
  PersonalityReport,
  PersonalityReportData,
  NormalizedReportDimension,
  ReportGenerationResponse,
} from '@/types/report'
import { REPORT_VERSION } from '@/types/report'
import { generatePersonalityReportPdf } from './pdf/pdfGenerator'
import { sanitizeReportFilename } from '@/utils/format'
import { personalityService } from './personalityService'

export const personalityReportService = {
  /**
   * Fetches and normalizes the assessment data snapshot for a result ID.
   * Can be used for PDF generation on-demand or for Admin structured data view.
   */
  async getReportData(assessmentResultId: string): Promise<PersonalityReportData> {
    const supabase = requireSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Sesi pengguna tidak valid. Silakan masuk terlebih dahulu.')
    }

    const result = await personalityService.getResultById(assessmentResultId)
    if (!result) {
      throw new Error('Hasil asesmen tidak ditemukan.')
    }

    // Fetch assessment name
    const { data: assessmentMeta } = await supabase
      .from('assessments')
      .select('name')
      .eq('id', result.assessment_id)
      .maybeSingle()
    const assessmentName = assessmentMeta?.name || 'Learning Personality Assessment'

    // Fetch student profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', result.user_id)
      .single()

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('grade, school')
      .eq('user_id', result.user_id)
      .maybeSingle()

    const studentName = profile?.full_name || 'Siswa'
    const studentEmail = profile?.email || ''

    const pType = result.personality_type
    const rawDimensions = result.dimensions

    if (!pType || !pType.name || !rawDimensions || rawDimensions.length === 0) {
      throw new Error(
        'REPORT_DATA_INCOMPLETE: Data profil asesmen belum lengkap. Silakan pastikan asesmen telah selesai dikerjakan.'
      )
    }

    const dimensions: NormalizedReportDimension[] = rawDimensions.map((d) => ({
      name: d.dimension?.name || 'Dimensi Belajar',
      code: d.dimension?.code || 'DIMENSION',
      score: Math.round(Number(d.normalized_score) || 0),
      rawScore: Number(d.raw_score) || 0,
      description:
        d.dimension?.description ||
        'Dimensi yang mengukur karakteristik dan kecenderungan pola belajar kognitif siswa.',
    }))

    const isDemo =
      assessmentName.toLowerCase().includes('demo') ||
      pType.name.toLowerCase().includes('demo') ||
      false

    return {
      student: {
        id: result.user_id,
        name: studentName,
        email: studentEmail,
        grade: studentProfile?.grade,
        school: studentProfile?.school,
      },
      assessment: {
        id: result.id,
        name: assessmentName,
        completedAt: result.completed_at,
      },
      personality: {
        name: pType.name,
        code: pType.code,
        description:
          pType.description ||
          'Profil karakter belajar siswa yang mencerminkan kekuatan dan preferensi kognitif unik.',
        overallScore: Number(result.overall_score) || 0,
        strengths: pType.strengths || [],
        challenges: pType.challenges || [],
        learningStyle: pType.learning_style || 'Eksploratif dan Praktis',
        communicationStyle:
          pType.communication_style || 'Komunikatif dan terbuka terhadap umpan balik konstruktif',
        motivation:
          pType.motivation || 'Memahami esensi materi dan penerapannya dalam kehidupan nyata',
        recommendedStudyMethod: pType.recommended_study_method || [],
        recommendedSubjects: pType.recommended_subjects || [],
        recommendedTutorStyle: pType.recommended_tutor_style || [],
      },
      dimensions,
      metadata: {
        reportVersion: REPORT_VERSION,
        generatedAt: new Date().toISOString(),
        isDemo,
        title: 'Personality & Learning Profile Report',
        author: 'Laits Edu Tech LMS',
        subject: `Laporan Profil Belajar Siswa - ${studentName}`,
        keywords: ['Personality', 'Learning Profile', 'Education', 'Assessment', 'Laits Edu Tech'],
      },
    }
  },

  /**
   * Generates a new personality report record in the database.
   * NOTE: The PDF binary is NOT uploaded to database storage (zero storage cost).
   * It is generated purely on-demand in-memory when previewed or downloaded.
   */
  async generateReport(assessmentResultId: string): Promise<ReportGenerationResponse> {
    const supabase = requireSupabase()

    // 1. Verify user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Silakan masuk (login) terlebih dahulu untuk mengunduh laporan.')
    }

    // 2. Idempotency Check: Return existing ready report if found
    const { data: existingReport, error: existingError } = await supabase
      .from('personality_reports')
      .select('*')
      .eq('assessment_result_id', assessmentResultId)
      .eq('report_version', REPORT_VERSION)
      .eq('status', 'ready')
      .maybeSingle()

    if (!existingError && existingReport) {
      return {
        success: true,
        report: existingReport as PersonalityReport,
        isNew: false,
        message: 'Laporan belajar Anda sudah tersedia.',
      }
    }

    // 3. Validate ownership and get normalized data
    const reportData = await this.getReportData(assessmentResultId)
    if (reportData.student.id !== user.id) {
      throw new Error('Hasil asesmen tidak ditemukan atau Anda tidak memiliki akses ke hasil ini.')
    }

    // 4. Generate in-memory PDF to get exact file size and verify generation
    const pdfBlob = await generatePersonalityReportPdf(reportData)
    const safeFileName = sanitizeReportFilename(reportData.student.name, reportData.assessment.completedAt)

    // 5. Upsert record with status 'ready' and file_path 'on-demand' (NO STORAGE UPLOAD)
    const { data: reportRecord, error: upsertError } = await supabase
      .from('personality_reports')
      .upsert(
        {
          user_id: user.id,
          assessment_result_id: assessmentResultId,
          file_path: 'on-demand',
          file_name: safeFileName,
          file_size: pdfBlob.size,
          mime_type: 'application/pdf',
          report_version: REPORT_VERSION,
          status: 'ready',
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'assessment_result_id,report_version' }
      )
      .select()
      .single()

    if (upsertError || !reportRecord) {
      console.error('Failed to create report record:', upsertError)
      throw new Error('Gagal mencatat status laporan. Silakan coba kembali.')
    }

    return {
      success: true,
      report: reportRecord as PersonalityReport,
      isNew: true,
      message: 'Laporan belajar resmi siap ditinjau dan diunduh!',
    }
  },

  /**
   * Generates a PDF blob on-demand in-memory without consuming database storage.
   */
  async getReportBlob(reportId: string): Promise<{ blob: Blob; fileName: string }> {
    const report = await this.getReport(reportId)
    if (!report) {
      throw new Error('Dokumen laporan tidak ditemukan.')
    }

    const reportData = await this.getReportData(report.assessment_result_id)
    const blob = await generatePersonalityReportPdf(reportData)

    return {
      blob,
      fileName: report.file_name || 'personality-report.pdf',
    }
  },

  /**
   * Fetches all reports for the currently authenticated student.
   */
  async getReports(): Promise<PersonalityReport[]> {
    const supabase = requireSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('personality_reports')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch reports:', error)
      return []
    }

    return (data as PersonalityReport[]) ?? []
  },

  /**
   * Fetches a specific report by its ID.
   */
  async getReport(reportId: string): Promise<PersonalityReport | null> {
    const supabase = requireSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('personality_reports')
      .select('*')
      .eq('id', reportId)
      .maybeSingle()

    if (error || !data) return null
    return data as PersonalityReport
  },

  /**
   * Fetches the latest report for an assessment result.
   */
  async getLatestReport(resultId: string): Promise<PersonalityReport | null> {
    const supabase = requireSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('personality_reports')
      .select('*')
      .eq('assessment_result_id', resultId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return data as PersonalityReport
  },

  /**
   * Creates a signed URL if file_path is an actual storage path, or empty string for on-demand.
   */
  async getSignedUrl(filePath: string, expiresInSeconds = 600): Promise<string> {
    if (!filePath || filePath === 'on-demand' || filePath === 'pending') {
      return ''
    }
    const supabase = requireSupabase()
    const { data, error } = await supabase.storage
      .from('personality-reports')
      .createSignedUrl(filePath, expiresInSeconds)

    if (error || !data?.signedUrl) {
      return ''
    }

    return data.signedUrl
  },

  /**
   * Securely triggers browser download of the report with sanitized filename on-demand.
   * Completely zero storage consumption!
   */
  async downloadReport(report: PersonalityReport): Promise<void> {
    // Generate PDF blob in-memory directly
    const { blob, fileName } = await this.getReportBlob(report.id)

    const objectUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(objectUrl)
  },
}
