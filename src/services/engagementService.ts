import { getSupabase } from '@/lib/supabase'
import type {
  LearningGoal,
  StudentStreak,
  Achievement,
  Certificate,
  CertificateVerificationResult,
} from '@/types/engagement'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export const engagementService = {
  /**
   * Fetches learning goals for current student.
   */
  async getGoals(): Promise<LearningGoal[]> {
    const supabase = getSupabase()
    if (!supabase) return []

    try {
      const authData = supabase.auth?.getUser ? await supabase.auth.getUser() : { data: { user: null } }
      const studentId = authData?.data?.user?.id
      if (!studentId) return []

      const { data, error } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((row) => ({
        id: row.id,
        studentId: row.student_id,
        title: row.title,
        description: row.description || '',
        targetType: (row.target_type || 'sessions').toLowerCase() as import('@/types/engagement').GoalTargetType,
        targetValue: Number(row.target_value || 1),
        currentValue: Number(row.current_value || 0),
        startDate: row.start_date || '',
        targetDate: row.target_date,
        status: (row.status || 'active').toLowerCase() as import('@/types/engagement').GoalStatus,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    } catch (err) {
      logger.error('Failed to get learning goals:', err)
      return []
    }
  },

  /**
   * Creates a new learning goal for the student.
   */
  async createGoal(goal: Partial<LearningGoal>): Promise<LearningGoal> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const studentId = authData.user?.id
      if (!studentId) throw new Error('Autentikasi diperlukan.')

      const { data, error } = await supabase
        .from('learning_goals')
        .insert({
          student_id: studentId,
          title: goal.title || 'Target Belajar Baru',
          description: goal.description || '',
          target_type: goal.targetType || 'sessions',
          target_value: goal.targetValue || 4,
          current_value: 0,
          start_date: goal.startDate || new Date().toISOString().split('T')[0],
          target_date: goal.targetDate || null,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        studentId: data.student_id,
        title: data.title,
        description: data.description || '',
        targetType: data.target_type,
        targetValue: Number(data.target_value),
        currentValue: Number(data.current_value),
        startDate: data.start_date || '',
        targetDate: data.target_date,
        status: data.status,
        completedAt: data.completed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (err) {
      logger.error('Failed to create goal:', err)
      throw toAppError(err, 'Gagal membuat target belajar.')
    }
  },

  /**
   * Updates goal progress and marks completed if target reached.
   */
  async updateGoalProgress(goalId: string, incrementBy = 1): Promise<void> {
    const supabase = getSupabase()
    if (!supabase) return

    try {
      const { data: current } = await supabase
        .from('learning_goals')
        .select('current_value, target_value')
        .eq('id', goalId)
        .maybeSingle()

      if (!current) return

      const newValue = Number(current.current_value || 0) + incrementBy
      const isCompleted = newValue >= Number(current.target_value)

      await supabase
        .from('learning_goals')
        .update({
          current_value: newValue,
          status: isCompleted ? 'completed' : 'active',
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
    } catch (err) {
      logger.error('Failed to update goal progress:', err)
    }
  },

  /**
   * Fetches the current learning streak for student.
   */
  async getStreak(): Promise<StudentStreak> {
    const supabase = getSupabase()
    if (!supabase) return { studentId: '', currentStreak: 0, longestStreak: 0, lastActivityDate: null }

    try {
      const { data: authData } = await supabase.auth.getUser()
      const studentId = authData.user?.id
      if (!studentId) return { studentId: '', currentStreak: 0, longestStreak: 0, lastActivityDate: null }

      const { data, error } = await supabase
        .from('student_streaks')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        return {
          studentId,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
        }
      }

      return {
        studentId: data.student_id,
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastActivityDate: data.last_activity_date,
      }
    } catch (err) {
      logger.error('Failed to get student streak:', err)
      return { studentId: '', currentStreak: 0, longestStreak: 0, lastActivityDate: null }
    }
  },

  /**
   * Fetches all achievements with indicator whether earned by the student.
   */
  async getAchievements(): Promise<Achievement[]> {
    const supabase = getSupabase()
    if (!supabase) return []

    try {
      const authData = supabase.auth?.getUser ? await supabase.auth.getUser() : { data: { user: null } }
      const studentId = authData?.data?.user?.id

      const { data: achievementsData, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (error) throw error

      const earnedMap = new Map<string, string>()
      if (studentId) {
        const { data: studentEarned } = await supabase
          .from('student_achievements')
          .select('achievement_id, earned_at')
          .eq('student_id', studentId)

        if (studentEarned) {
          for (const se of studentEarned) {
            earnedMap.set(se.achievement_id, se.earned_at)
          }
        }
      }

      return (achievementsData || []).map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description || '',
        icon: row.badge_icon || 'award',
        criteriaType: row.criteria_type as Achievement['criteriaType'],
        criteriaValue: Number(row.criteria_value || 1),
        status: row.status as Achievement['status'],
        isEarned: earnedMap.has(row.id),
        earnedAt: earnedMap.get(row.id) || null,
      }))
    } catch (err) {
      logger.error('Failed to get achievements:', err)
      return []
    }
  },

  /**
   * Fetches certificates earned by current student.
   */
  async getCertificates(): Promise<Certificate[]> {
    const supabase = getSupabase()
    if (!supabase) return []

    try {
      const { data: authData } = await supabase.auth.getUser()
      const studentId = authData.user?.id
      if (!studentId) return []

      const { data, error } = await supabase
        .from('certificates')
        .select(`
          id,
          student_id,
          course_id,
          certificate_number,
          issued_at,
          metadata,
          courses ( title, level, thumbnail_url ),
          profiles ( full_name )
        `)
        .eq('student_id', studentId)
        .order('issued_at', { ascending: false })

      if (error) throw error

      return (data || []).map((row) => {
        const course = row.courses as { title?: string; level?: string; thumbnail_url?: string } | null
        const profile = row.profiles as { full_name?: string } | null
        return {
          id: row.id,
          studentId: row.student_id,
          courseId: row.course_id,
          certificateNumber: row.certificate_number,
          issuedAt: row.issued_at,
          metadata: (row.metadata || {}) as Record<string, unknown>,
          course: {
            title: course?.title || 'Kursus',
            level: course?.level || 'beginner',
            thumbnailUrl: course?.thumbnail_url,
          },
          student: {
            fullName: profile?.full_name || 'Siswa Laits',
          },
        }
      })
    } catch (err) {
      logger.error('Failed to get certificates:', err)
      return []
    }
  },

  /**
   * Public verification of course certificate by certificate_number.
   */
  async verifyCertificatePublic(certificateNumber: string): Promise<CertificateVerificationResult> {
    const supabase = getSupabase()
    if (!supabase) return { isValid: false }

    try {
      const { data, error } = await supabase.rpc('verify_certificate_public', {
        p_certificate_number: certificateNumber.trim(),
      })

      if (error) throw error
      type VerificationRpcResponse = {
        is_valid?: boolean
        valid?: boolean
        certificate_number?: string
        issued_at?: string
        course_title?: string
        course_level?: string
        student_name?: string
      }
      const res = (data as unknown) as VerificationRpcResponse | null

      if (!res || (!res.is_valid && !res.valid)) {
        return { isValid: false }
      }

      return {
        isValid: true,
        certificateNumber: res.certificate_number,
        issuedAt: res.issued_at,
        courseTitle: res.course_title,
        courseLevel: res.course_level,
        studentName: res.student_name,
      }
    } catch (err) {
      logger.error('Failed to verify certificate publicly:', err)
      return { isValid: false }
    }
  },
}

export const {
  getGoals,
  createGoal,
  updateGoalProgress,
  getStreak,
  getAchievements,
  getCertificates,
  verifyCertificatePublic,
} = engagementService
