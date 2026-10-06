import { requireSupabase } from '@/lib/supabase'
import type {
  StudentLearningPath,
  OverallStudentProgress,
  LearningPathProgressItem,
  StudentLearningPathStatus,
  SubjectProgressStatus,
} from '@/types/progress'
import { toAppError } from '@/utils/errors'

interface RawSlpRow {
  id: string
  student_id: string
  learning_path_id: string
  status: StudentLearningPathStatus
  started_at: string
  completed_at: string | null
  progress_percentage: number
  learning_path?: {
    title: string
    slug: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimated_duration: string
  } | null
  progress_items?: Array<{
    id: string
    student_learning_path_id: string
    subject_id: string
    status: SubjectProgressStatus
    progress_percentage: number
    started_at: string | null
    completed_at: string | null
    subject?: {
      name: string
      category: 'general' | 'religious'
    } | null
  }> | null
}

function formatSlpRow(row: RawSlpRow): StudentLearningPath {
  const subjects: LearningPathProgressItem[] = (row.progress_items || []).map((item) => ({
    id: item.id,
    studentLearningPathId: item.student_learning_path_id,
    subjectId: item.subject_id,
    subjectName: item.subject?.name || 'Mata Pelajaran',
    subjectCategory: item.subject?.category || 'general',
    status: item.status,
    progressPercentage: item.progress_percentage,
    startedAt: item.started_at,
    completedAt: item.completed_at,
  }))

  return {
    id: row.id,
    studentId: row.student_id,
    learningPathId: row.learning_path_id,
    learningPathTitle: row.learning_path?.title || 'Alur Belajar',
    learningPathSlug: row.learning_path?.slug || '',
    learningPathDescription: row.learning_path?.description || '',
    difficulty: row.learning_path?.difficulty || 'beginner',
    estimatedDuration: row.learning_path?.estimated_duration || '3 Bulan',
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    progressPercentage: row.progress_percentage,
    subjects,
  }
}

export const learningProgressService = {
  /**
   * Enrolls student in a learning path via atomic RPC `enroll_student_learning_path`.
   */
  async enrollLearningPath(learningPathId: string): Promise<string> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase.rpc('enroll_student_learning_path', {
        p_learning_path_id: learningPathId,
      })

      if (error) throw error
      if (!data) throw new Error('ID pendaftaran alur belajar tidak dihasilkan.')

      return data
    } catch (err) {
      console.error('Failed to enroll in learning path:', err)
      throw toAppError(err, 'Gagal mendaftar ke alur belajar.')
    }
  },

  /**
   * Fetches all learning paths enrolled by a student.
   */
  async getEnrolledLearningPaths(studentId?: string): Promise<StudentLearningPath[]> {
    const supabase = requireSupabase()

    try {
      let targetStudentId = studentId
      if (!targetStudentId) {
        const { data: authData } = await supabase.auth.getUser()
        targetStudentId = authData.user?.id
      }
      if (!targetStudentId) return []

      const { data, error } = await supabase
        .from('student_learning_paths')
        .select(`
          id,
          student_id,
          learning_path_id,
          status,
          started_at,
          completed_at,
          progress_percentage,
          learning_path:learning_paths (
            title,
            slug,
            description,
            difficulty,
            estimated_duration
          ),
          progress_items:learning_path_progress (
            id,
            student_learning_path_id,
            subject_id,
            status,
            progress_percentage,
            started_at,
            completed_at,
            subject:subjects (
              name,
              category
            )
          )
        `)
        .eq('student_id', targetStudentId)
        .order('started_at', { ascending: false })

      if (error) throw error

      return (data || []).map((row) => formatSlpRow(row as unknown as RawSlpRow))
    } catch (err) {
      console.error('Failed to get enrolled learning paths:', err)
      throw toAppError(err, 'Gagal memuat alur belajar Anda.')
    }
  },

  /**
   * Checks if student is enrolled in a specific learning path.
   */
  async getLearningPathEnrollment(
    learningPathId: string,
    studentId?: string
  ): Promise<StudentLearningPath | null> {
    const supabase = requireSupabase()

    try {
      let targetStudentId = studentId
      if (!targetStudentId) {
        const { data: authData } = await supabase.auth.getUser()
        targetStudentId = authData.user?.id
      }
      if (!targetStudentId) return null

      const { data, error } = await supabase
        .from('student_learning_paths')
        .select(`
          id,
          student_id,
          learning_path_id,
          status,
          started_at,
          completed_at,
          progress_percentage,
          learning_path:learning_paths (
            title,
            slug,
            description,
            difficulty,
            estimated_duration
          ),
          progress_items:learning_path_progress (
            id,
            student_learning_path_id,
            subject_id,
            status,
            progress_percentage,
            started_at,
            completed_at,
            subject:subjects (
              name,
              category
            )
          )
        `)
        .eq('student_id', targetStudentId)
        .eq('learning_path_id', learningPathId)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      return formatSlpRow(data as unknown as RawSlpRow)
    } catch (err) {
      console.error('Failed to get learning path enrollment:', err)
      return null
    }
  },

  /**
   * Updates student progress for a specific subject via RPC `update_learning_subject_progress`.
   */
  async updateSubjectProgress(
    studentLearningPathId: string,
    subjectId: string,
    progressPercentage: number
  ): Promise<void> {
    const supabase = requireSupabase()

    try {
      const { error } = await supabase.rpc('update_learning_subject_progress', {
        p_student_learning_path_id: studentLearningPathId,
        p_subject_id: subjectId,
        p_progress_percentage: progressPercentage,
      })

      if (error) throw error
    } catch (err) {
      console.error('Failed to update subject progress:', err)
      throw toAppError(err, 'Gagal memperbarui progres mata pelajaran.')
    }
  },

  /**
   * Calculates overall student learning progress metrics accurately from database.
   */
  async getOverallStudentProgress(studentId?: string): Promise<OverallStudentProgress> {
    const paths = await this.getEnrolledLearningPaths(studentId)

    const supabase = requireSupabase()
    let completedSessionsCount = 0
    let totalLearningMinutes = 0

    try {
      let targetStudentId = studentId
      if (!targetStudentId) {
        const { data: authData } = await supabase.auth.getUser()
        targetStudentId = authData.user?.id
      }

      if (targetStudentId) {
        const { data: sessions } = await supabase
          .from('learning_sessions')
          .select('duration_minutes')
          .eq('student_id', targetStudentId)
          .eq('status', 'completed')

        if (sessions && sessions.length > 0) {
          completedSessionsCount = sessions.length
          totalLearningMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0)
        }
      }
    } catch (sessionErr) {
      console.warn('Failed to compute completed session stats:', sessionErr)
    }

    const enrolledPathsCount = paths.length
    const completedPathsCount = paths.filter((p) => p.status === 'completed').length
    const inProgressPathsCount = paths.filter((p) => p.status === 'in_progress').length

    let totalProgressSum = 0
    for (const p of paths) {
      totalProgressSum += p.progressPercentage
    }
    const averageProgress =
      paths.length > 0 ? Math.round(totalProgressSum / paths.length) : 0

    return {
      enrolledPathsCount,
      completedPathsCount,
      inProgressPathsCount,
      completedSessionsCount,
      totalLearningMinutes,
      averageProgress,
    }
  },
}
