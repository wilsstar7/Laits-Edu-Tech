import { getSupabase } from '@/lib/supabase'
import type { Assignment, AssignmentSubmission } from '@/types/assignment'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export const assignmentService = {
  /**
   * Fetches the assignment for a given lesson and includes the current student's submission if any.
   */
  async getAssignmentByLessonId(lessonId: string): Promise<Assignment | null> {
    const supabase = getSupabase()
    if (!supabase) return null

    try {
      const { data: authData } = await supabase.auth.getUser()
      const studentId = authData.user?.id

      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('status', 'published')
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      let submission: AssignmentSubmission | null = null
      if (studentId) {
        const { data: subData } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('assignment_id', data.id)
          .eq('student_id', studentId)
          .maybeSingle()

        if (subData) {
          submission = {
            id: subData.id,
            assignmentId: subData.assignment_id,
            studentId: subData.student_id,
            content: subData.content || '',
            attachmentPath: subData.attachment_path,
            status: subData.status,
            score: subData.score !== null ? Number(subData.score) : null,
            feedback: subData.feedback,
            submittedAt: subData.submitted_at,
            gradedAt: subData.graded_at,
            gradedBy: subData.graded_by,
          }
        }
      }

      return {
        id: data.id,
        lessonId: data.lesson_id,
        title: data.title,
        description: data.description || '',
        dueAt: data.due_at,
        maxScore: Number(data.max_score || 100),
        status: data.status,
        createdAt: data.created_at,
        submission,
      }
    } catch (err) {
      logger.error('Failed to get assignment by lesson ID:', err)
      throw toAppError(err, 'Gagal memuat tugas pembelajaran.')
    }
  },

  /**
   * Submits student assignment content and optional attachment file path.
   */
  async submitAssignment(assignmentId: string, content: string, attachmentPath?: string | null): Promise<AssignmentSubmission> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const studentId = authData.user?.id
      if (!studentId) throw new Error('Autentikasi diperlukan.')

      const { data, error } = await supabase
        .from('assignment_submissions')
        .upsert(
          {
            assignment_id: assignmentId,
            student_id: studentId,
            content,
            attachment_path: attachmentPath || null,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          },
          { onConflict: 'student_id,assignment_id' }
        )
        .select()
        .single()

      if (error) throw error

      // Record daily learning activity for streak
      await supabase.rpc('record_learning_activity', { p_student_id: studentId })

      return {
        id: data.id,
        assignmentId: data.assignment_id,
        studentId: data.student_id,
        content: data.content || '',
        attachmentPath: data.attachment_path,
        status: data.status,
        score: data.score !== null ? Number(data.score) : null,
        feedback: data.feedback,
        submittedAt: data.submitted_at,
        gradedAt: data.graded_at,
        gradedBy: data.graded_by,
      }
    } catch (err) {
      logger.error('Failed to submit assignment:', err)
      throw toAppError(err, 'Gagal mengumpulkan tugas pembelajaran.')
    }
  },
}
