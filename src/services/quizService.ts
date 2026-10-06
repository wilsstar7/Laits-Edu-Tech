import { getSupabase } from '@/lib/supabase'
import type { Quiz, QuizAttempt, QuizSubmissionAnswer, QuizSubmissionResult } from '@/types/quiz'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export const quizService = {
  /**
   * Fetches the quiz for a given lesson including questions and options.
   * Note: is_correct is excluded from option selections for security.
   */
  async getQuizByLessonId(lessonId: string): Promise<Quiz | null> {
    const supabase = getSupabase()
    if (!supabase) return null

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          lesson_id,
          title,
          description,
          passing_score,
          max_attempts,
          status,
          quiz_questions (
            id,
            quiz_id,
            question,
            question_type,
            points,
            sort_order,
            quiz_options (
              id,
              question_id,
              label,
              sort_order
            )
          )
        `)
        .eq('lesson_id', lessonId)
        .eq('status', 'published')
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      const rawQuestions = (data.quiz_questions || []) as any[]
      rawQuestions.sort((a, b) => a.sort_order - b.sort_order)

      const questions = rawQuestions.map((q) => {
        const rawOptions = (q.quiz_options || []) as any[]
        rawOptions.sort((a, b) => a.sort_order - b.sort_order)
        return {
          id: q.id,
          quizId: q.quiz_id,
          question: q.question,
          questionType: q.question_type,
          points: Number(q.points || 10),
          sortOrder: q.sort_order,
          options: rawOptions.map((o) => ({
            id: o.id,
            questionId: o.question_id,
            label: o.label,
            sortOrder: o.sort_order,
          })),
        }
      })

      return {
        id: data.id,
        lessonId: data.lesson_id,
        title: data.title,
        description: data.description || '',
        passingScore: Number(data.passing_score || 70),
        maxAttempts: Number(data.max_attempts || 3),
        status: data.status,
        questions,
      }
    } catch (err) {
      logger.error('Failed to get quiz by lesson ID:', err)
      throw toAppError(err, 'Gagal memuat kuis pelajaran.')
    }
  },

  /**
   * Fetches past attempts of the current student for a quiz.
   */
  async getStudentAttempts(quizId: string): Promise<QuizAttempt[]> {
    const supabase = getSupabase()
    if (!supabase) return []

    try {
      const { data: authData } = await supabase.auth.getUser()
      const studentId = authData.user?.id
      if (!studentId) return []

      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('student_id', studentId)
        .order('attempt_number', { ascending: true })

      if (error) throw error

      return (data || []).map((row) => ({
        id: row.id,
        quizId: row.quiz_id,
        studentId: row.student_id,
        attemptNumber: row.attempt_number,
        score: Number(row.score || 0),
        passed: Boolean(row.passed),
        startedAt: row.started_at,
        submittedAt: row.submitted_at,
      }))
    } catch (err) {
      logger.error('Failed to get student quiz attempts:', err)
      return []
    }
  },

  /**
   * Evaluates quiz submission server-side via PostgreSQL RPC submit_quiz_attempt.
   * Prevents client spoofing of scores or correct answers.
   */
  async submitQuiz(quizId: string, answers: QuizSubmissionAnswer[]): Promise<QuizSubmissionResult> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      const { data, error } = await supabase.rpc('submit_quiz_attempt', {
        p_quiz_id: quizId,
        p_answers: answers,
      })

      if (error) throw error
      const res = data as any

      return {
        attempt_number: Number(res.attempt_number),
        score: Number(res.score),
        passing_score: Number(res.passing_score),
        passed: Boolean(res.passed),
        max_attempts: Number(res.max_attempts),
        remaining_attempts: Number(res.remaining_attempts),
      }
    } catch (err) {
      logger.error('Failed to submit quiz attempt:', err)
      throw toAppError(err, 'Gagal mengirim evaluasi kuis.')
    }
  },
}

export const {
  getQuizByLessonId,
  getStudentAttempts,
  submitQuiz,
} = quizService
