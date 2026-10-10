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
  activeBookings: number
  pendingPayments: number
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

export interface CreateTutorPayload {
  email: string
  password: string
  fullName: string
  phone?: string
  bio?: string
  hourlyRate?: number
  education?: string
  subjectIds?: string[]
}

export interface UserListItem {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: UserRole
  phone: string | null
  created_at: string
}

export interface UserCounts {
  total: number
  student: number
  tutor: number
  admin: number
  super_admin: number
}

export interface UserDetail {
  profile: Profile
  tutorProfile?: {
    bio: string | null
    headline: string | null
    hourly_rate: number
    rating_avg: number
    rating_count: number
    education: string | null
    subjects: string[]
  } | null
  studentAssessments?: AdminStudentAssessmentItem[]
}

async function countByRole(role: UserRole): Promise<number> {
  const { count, error } = await requireSupabase()
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', role)
  if (error) throw toAppError(error, 'Gagal memuat statistik.')
  return count ?? 0
}

async function countActiveBookings(): Promise<number> {
  const { count, error } = await requireSupabase()
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .in('status', ['confirmed', 'pending'])
  if (error) {
    logger.warn('Gagal menghitung booking aktif:', error)
    return 0
  }
  return count ?? 0
}

async function countPendingPayments(): Promise<number> {
  const { count, error } = await requireSupabase()
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .in('status', ['awaiting_payment', 'awaiting_verification', 'pending'])
  if (error) {
    logger.warn('Gagal menghitung pembayaran tertunda:', error)
    return 0
  }
  return count ?? 0
}

export const adminService = {
  /** Real counts from the database. RLS only returns rows to admins. */
  async getOverview(): Promise<AdminOverview> {
    const [totalStudents, totalTutors, activeBookings, pendingPayments, recent] = await Promise.all([
      countByRole('student'),
      countByRole('tutor'),
      countActiveBookings(),
      countPendingPayments(),
      requireSupabase()
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(6),
    ])
    if (recent.error) throw toAppError(recent.error, 'Gagal memuat pengguna terbaru.')
    return {
      totalStudents,
      totalTutors,
      activeBookings,
      pendingPayments,
      recentUsers: recent.data,
    }
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

  /**
   * Mega Admin: Creates a new tutor account directly via admin_create_tutor RPC.
   */
  async createTutor(payload: CreateTutorPayload): Promise<string> {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('admin_create_tutor', {
      p_email: payload.email,
      p_password: payload.password,
      p_full_name: payload.fullName,
      p_phone: payload.phone || undefined,
      p_bio: payload.bio || undefined,
      p_hourly_rate: payload.hourlyRate,
      p_education: payload.education || undefined,
      p_subject_ids: payload.subjectIds && payload.subjectIds.length > 0 ? payload.subjectIds : undefined,
    })

    if (error) {
      logger.error('Failed to create tutor account:', error)
      throw toAppError(error, 'Gagal membuat akun tutor baru.')
    }

    return data
  },

  async getUserCounts(): Promise<UserCounts> {
    const supabase = requireSupabase()
    const [totalRes, studentRes, tutorRes, adminRes, superAdminRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'tutor'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'super_admin'),
    ])

    return {
      total: totalRes.count ?? 0,
      student: studentRes.count ?? 0,
      tutor: tutorRes.count ?? 0,
      admin: adminRes.count ?? 0,
      super_admin: superAdminRes.count ?? 0,
    }
  },

  async getUsers(params?: {
    role?: UserRole | 'all'
    search?: string
    page?: number
    pageSize?: number
  }): Promise<{ users: UserListItem[]; total: number }> {
    const supabase = requireSupabase()
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, phone, created_at', { count: 'exact' })

    if (params?.role && params.role !== 'all') {
      query = query.eq('role', params.role)
    }

    if (params?.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`
      query = query.or(`full_name.ilike.${term},email.ilike.${term}`)
    }

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query
    if (error) throw toAppError(error, 'Gagal memuat daftar pengguna.')
    return {
      users: (data as UserListItem[]) ?? [],
      total: count ?? 0,
    }
  },

  async updateUserRole(targetUserId: string, newRole: UserRole): Promise<void> {
    const supabase = requireSupabase()
    const { error } = await supabase.rpc('admin_set_user_role', {
      target_user_id: targetUserId,
      new_role: newRole,
    })
    if (error) {
      logger.error('Failed to change user role:', error)
      throw toAppError(error, 'Gagal memperbarui peran pengguna.')
    }
  },

  async getUserDetail(userId: string): Promise<UserDetail> {
    const supabase = requireSupabase()
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileErr || !profile) {
      throw toAppError(profileErr, 'Pengguna tidak ditemukan.')
    }

    let tutorProfile: UserDetail['tutorProfile'] = null
    let studentAssessments: AdminStudentAssessmentItem[] = []

    if (profile.role === 'tutor') {
      const { data: tp } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      let subjectNames: string[] = []
      const { data: tutorSubRows } = await supabase
        .from('tutor_subjects')
        .select('subject_id')
        .eq('tutor_id', userId)

      if (tutorSubRows && tutorSubRows.length > 0) {
        const subIds = tutorSubRows.map((r) => r.subject_id)
        const { data: subData } = await supabase
          .from('subjects')
          .select('name')
          .in('id', subIds)
        if (subData) {
          subjectNames = subData.map((s) => s.name)
        }
      }

      if (tp) {
        tutorProfile = {
          bio: tp.bio,
          headline: tp.headline,
          hourly_rate: Number(tp.hourly_rate ?? 0),
          rating_avg: Number(tp.rating ?? 0),
          rating_count: Number(tp.total_reviews ?? 0),
          education: tp.education_background,
          subjects: subjectNames,
        }
      }
    } else if (profile.role === 'student') {
      const { data: assessments } = await supabase
        .from('assessment_results')
        .select('id, user_id, personality_type_id, overall_score, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })

      if (assessments && assessments.length > 0) {
        const typeIds = [...new Set(assessments.map((a) => a.personality_type_id))]
        const { data: types } = await supabase
          .from('personality_types')
          .select('id, name, code')
          .in('id', typeIds)
        const typeMap = new Map((types || []).map((t) => [t.id, t]))
        studentAssessments = assessments.map((a) => {
          const t = typeMap.get(a.personality_type_id)
          return {
            id: a.id,
            userId: a.user_id,
            studentName: profile.full_name,
            studentEmail: profile.email,
            personalityTypeName: t?.name || 'Tipe Belum Ditentukan',
            personalityTypeCode: t?.code || 'UNKNOWN',
            overallScore: Number(a.overall_score || 0),
            completedAt: a.completed_at,
          }
        })
      }
    }

    return {
      profile: profile as Profile,
      tutorProfile,
      studentAssessments,
    }
  },
}


