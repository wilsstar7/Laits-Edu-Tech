import { getSupabase } from '@/lib/supabase'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export interface MonthlyLearningReport {
  id: string
  studentId: string
  periodMonth: number
  periodYear: number
  totalSessions: number
  totalHours: number
  avgProgressPercentage: number
  summary: string
  status: 'generating' | 'ready' | 'failed'
  filePath: string | null
  generatedAt: string
  createdAt: string
  updatedAt: string
}

export const monthlyReportService = {
  /**
   * Fetches monthly reports for a given student (defaults to auth user).
   */
  async getReports(studentId?: string): Promise<MonthlyLearningReport[]> {
    const supabase = getSupabase()
    if (!supabase) return []

    try {
      let targetId = studentId
      if (!targetId) {
        const { data: authData } = await supabase.auth.getUser()
        targetId = authData.user?.id
      }
      if (!targetId) return []

      const { data, error } = await supabase
        .from('monthly_learning_reports')
        .select('*')
        .eq('student_id', targetId)
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false })

      if (error) throw error

      return (data || []).map((row) => ({
        id: row.id,
        studentId: row.student_id,
        periodMonth: row.period_month,
        periodYear: row.period_year,
        totalSessions: row.total_sessions,
        totalHours: Number(row.total_hours || 0),
        avgProgressPercentage: row.avg_progress_percentage,
        summary: row.summary,
        status: row.status,
        filePath: row.file_path,
        generatedAt: row.generated_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    } catch (err) {
      logger.error('Failed to get monthly learning reports:', err)
      throw toAppError(err, 'Gagal memuat riwayat laporan bulanan.')
    }
  },

  /**
   * Generates or refreshes a monthly learning report atomically via PostgreSQL RPC.
   */
  async generateMonthlyReport(year: number, month: number, studentId?: string): Promise<string> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      let targetId = studentId
      if (!targetId) {
        const { data: authData } = await supabase.auth.getUser()
        targetId = authData.user?.id
      }
      if (!targetId) throw new Error('Autentikasi diperlukan.')

      const { data, error } = await supabase.rpc('generate_monthly_learning_report', {
        p_student_id: targetId,
        p_year: year,
        p_month: month,
      })

      if (error) throw error
      if (!data) throw new Error('ID laporan tidak dihasilkan.')

      return data
    } catch (err) {
      logger.error('Failed to generate monthly learning report:', err)
      throw toAppError(err, 'Gagal membuat dokumen laporan bulanan.')
    }
  },
}
