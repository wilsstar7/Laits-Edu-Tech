import { requireSupabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'
import type { AssessmentResult } from '@/types/assessment'
import { personalityService } from '@/services/personalityService'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export type RecentUser = Pick<Profile, 'id' | 'full_name' | 'email' | 'role' | 'created_at'>

export interface AdminOverview {
  totalStudents: number
  totalTutors: number
  recentUsers: RecentUser[]
}

export interface AdminStudentAssessmentItem {
  id: string // assessment_result id
  userId: string
  studentName: string
  studentEmail: string
  personalityTypeName: string
  personalityTypeCode: string
  overallScore: number
  completedAt: string
}

export interface AdminStudentAssessmentDetail {
  result: AssessmentResult
  student: {
    id: string
    fullName: string
    email: string
  }
}

async function countByRole(role: UserRole): Promise<number> {
  const { count, error } = await requireSupabase()
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', role)
  if (error) throw toAppError(error, 'Gagal memuat statistik.')
  return count ?? 0
}

export const adminService = {
  /** Real counts from the database. RLS only returns rows to admins. */
  async getOverview(): Promise<AdminOverview> {
    const [totalStudents, totalTutors, recent] = await Promise.all([
      countByRole('student'),
      countByRole('tutor'),
      requireSupabase()
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(6),
    ])
    if (recent.error) throw toAppError(recent.error, 'Gagal memuat pengguna terbaru.')
    return { totalStudents, totalTutors, recentUsers: recent.data }
  },

  /**
   * Mega Admin: Fetches list of student assessment results with bounded pagination and minimal columns.
   */
  async getStudentAssessments(limit = 50): Promise<AdminStudentAssessmentItem[]> {
    const supabase = requireSupabase()
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('id, user_id, personality_type_id, overall_score, completed_at')
      .order('completed_at', { ascending: false })
      .limit(limit)

    if (resultsError) {
      logger.error('Failed to fetch student assessments:', resultsError)
      throw toAppError(resultsError, 'Gagal memuat data asesmen siswa.')
    }

    if (!results || results.length === 0) {
      return []
    }

    const userIds = [...new Set(results.map((r) => r.user_id))]
    const typeIds = [...new Set(results.map((r) => r.personality_type_id))]

    const [{ data: profiles }, { data: types }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email').in('id', userIds),
      supabase.from('personality_types').select('id, name, code').in('id', typeIds),
    ])

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]))
    const typeMap = new Map((types || []).map((t) => [t.id, t]))

    return results.map((r) => {
      const p = profileMap.get(r.user_id)
      const t = typeMap.get(r.personality_type_id)
      return {
        id: r.id,
        userId: r.user_id,
        studentName: p?.full_name || 'Tanpa Nama',
        studentEmail: p?.email || '-',
        personalityTypeName: t?.name || 'Tipe Belum Ditentukan',
        personalityTypeCode: t?.code || 'UNKNOWN',
        overallScore: Number(r.overall_score || 0),
        completedAt: r.completed_at,
      }
    })
  },

  /**
   * Mega Admin: Fetches complete structured data detail for an assessment result.
   * Completely zero storage consumption.
   */
  async getStudentAssessmentDetail(resultId: string): Promise<AdminStudentAssessmentDetail | null> {
    const supabase = requireSupabase()
    const result = await personalityService.getResultById(resultId)
    if (!result) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', result.user_id)
      .maybeSingle()

    return {
      result,
      student: {
        id: result.user_id,
        fullName: profile?.full_name || 'Tanpa Nama',
        email: profile?.email || '-',
      },
    }
  },
}
