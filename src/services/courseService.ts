import { getSupabase } from '@/lib/supabase'
import type { Course, CourseSection, Lesson, CourseEnrollment, CourseLevel, CourseStatus } from '@/types/course'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export interface CourseFilter {
  subjectId?: string
  level?: CourseLevel
  search?: string
  status?: CourseStatus
  limit?: number
}

export const courseService = {
  /**
   * Fetches published courses with optional filtering and student enrollment state.
   */
  async getCourses(filters?: CourseFilter): Promise<Course[]> {
    const supabase = getSupabase()
    if (!supabase) return []

    try {
      const { data: authData } = await supabase.auth.getUser()
      const currentUserId = authData.user?.id

      let query = supabase
        .from('courses')
        .select(`
          id,
          subject_id,
          learning_path_id,
          title,
          slug,
          description,
          thumbnail_url,
          level,
          status,
          estimated_duration_minutes,
          created_by,
          published_at,
          created_at,
          updated_at,
          subjects ( name )
        `)
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      } else {
        query = query.eq('status', 'published')
      }

      if (filters?.subjectId) {
        query = query.eq('subject_id', filters.subjectId)
      }

      if (filters?.level) {
        query = query.eq('level', filters.level)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error

      let enrollmentsMap = new Map<string, CourseEnrollment>()
      if (currentUserId && data && data.length > 0) {
        const courseIds = data.map((c) => c.id)
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('student_id', currentUserId)
          .in('course_id', courseIds)

        if (enrollments) {
          for (const e of enrollments) {
            enrollmentsMap.set(e.course_id, {
              id: e.id,
              courseId: e.course_id,
              studentId: e.student_id,
              status: e.status,
              enrollmentSource: e.enrollment_source,
              enrolledAt: e.enrolled_at,
              completedAt: e.completed_at,
            })
          }
        }
      }

      return (data || []).map((row) => {
        const enrollment = enrollmentsMap.get(row.id) || null
        const subject = row.subjects as { name?: string } | null
        return {
          id: row.id,
          subjectId: row.subject_id,
          learningPathId: row.learning_path_id,
          title: row.title,
          slug: row.slug,
          description: row.description,
          thumbnailUrl: row.thumbnail_url,
          level: row.level,
          status: row.status,
          estimatedDurationMinutes: row.estimated_duration_minutes,
          createdBy: row.created_by,
          publishedAt: row.published_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          subjectName: subject?.name || 'Umum',
          enrollment,
        }
      })
    } catch (err) {
      logger.error('Failed to get courses:', err)
      throw toAppError(err, 'Gagal memuat katalog kursus pembelajaran.')
    }
  },

  /**
   * Fetches single course by ID or slug including curriculum sections, lessons, and progress.
   */
  async getCourseById(courseIdOrSlug: string): Promise<Course | null> {
    const supabase = getSupabase()
    if (!supabase) return null

    try {
      const { data: authData } = await supabase.auth.getUser()
      const currentUserId = authData.user?.id

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdOrSlug)

      let query = supabase
        .from('courses')
        .select(`
          id,
          subject_id,
          learning_path_id,
          title,
          slug,
          description,
          thumbnail_url,
          level,
          status,
          estimated_duration_minutes,
          created_by,
          published_at,
          created_at,
          updated_at,
          subjects ( name ),
          course_objectives ( id, objective, sort_order ),
          course_sections (
            id,
            title,
            description,
            sort_order,
            lessons (
              id,
              section_id,
              title,
              slug,
              description,
              lesson_type,
              content,
              estimated_duration_minutes,
              sort_order,
              status,
              published_at,
              created_at,
              updated_at
            )
          )
        `)

      if (isUuid) {
        query = query.eq('id', courseIdOrSlug)
      } else {
        query = query.eq('slug', courseIdOrSlug)
      }

      const { data: courseRow, error } = await query.maybeSingle()
      if (error) throw error
      if (!courseRow) return null

      // Check enrollment & progress
      let enrollment: CourseEnrollment | null = null
      const progressMap = new Map<string, { status: 'not_started' | 'in_progress' | 'completed'; progressPercentage: number }>()

      if (currentUserId) {
        const { data: enrollData } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('student_id', currentUserId)
          .eq('course_id', courseRow.id)
          .maybeSingle()

        if (enrollData) {
          enrollment = {
            id: enrollData.id,
            courseId: enrollData.course_id,
            studentId: enrollData.student_id,
            status: enrollData.status,
            enrollmentSource: enrollData.enrollment_source,
            enrolledAt: enrollData.enrolled_at,
            completedAt: enrollData.completed_at,
          }

          const { data: progData } = await supabase
            .from('lesson_progress')
            .select('lesson_id, status, progress_percentage')
            .eq('student_id', currentUserId)
            .eq('course_id', courseRow.id)

          if (progData) {
            for (const p of progData) {
              progressMap.set(p.lesson_id, {
                status: p.status,
                progressPercentage: Number(p.progress_percentage || 0),
              })
            }
          }
        }
      }

      // Sort sections and lessons
      const rawSections = (courseRow.course_sections || []) as any[]
      rawSections.sort((a, b) => a.sort_order - b.sort_order)

      let totalLessons = 0
      let completedLessons = 0

      const sections: CourseSection[] = rawSections.map((sec) => {
        const rawLessons = (sec.lessons || []) as any[]
        rawLessons.sort((a, b) => a.sort_order - b.sort_order)

        const lessons: Lesson[] = rawLessons.map((les) => {
          totalLessons++
          const prog = progressMap.get(les.id)
          if (prog?.status === 'completed') {
            completedLessons++
          }

          return {
            id: les.id,
            sectionId: les.section_id,
            title: les.title,
            slug: les.slug,
            description: les.description || '',
            lessonType: les.lesson_type,
            content: les.content || '',
            estimatedDurationMinutes: les.estimated_duration_minutes,
            sortOrder: les.sort_order,
            status: les.status,
            publishedAt: les.published_at,
            createdAt: les.created_at,
            updatedAt: les.updated_at,
            progress: prog
              ? {
                  id: '',
                  studentId: currentUserId || '',
                  lessonId: les.id,
                  courseId: courseRow.id,
                  status: prog.status,
                  progressPercentage: prog.progressPercentage,
                  startedAt: null,
                  completedAt: null,
                  lastAccessedAt: '',
                }
              : undefined,
          }
        })

        return {
          id: sec.id,
          courseId: courseRow.id,
          title: sec.title,
          description: sec.description || '',
          sortOrder: sec.sort_order,
          lessons,
        }
      })

      const rawObjectives = (courseRow.course_objectives || []) as any[]
      rawObjectives.sort((a, b) => a.sort_order - b.sort_order)
      const objectives = rawObjectives.map((o) => ({
        id: o.id,
        courseId: courseRow.id,
        objective: o.objective,
        sortOrder: o.sort_order,
      }))

      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      const subject = courseRow.subjects as { name?: string } | null

      return {
        id: courseRow.id,
        subjectId: courseRow.subject_id,
        learningPathId: courseRow.learning_path_id,
        title: courseRow.title,
        slug: courseRow.slug,
        description: courseRow.description,
        thumbnailUrl: courseRow.thumbnail_url,
        level: courseRow.level,
        status: courseRow.status,
        estimatedDurationMinutes: courseRow.estimated_duration_minutes,
        createdBy: courseRow.created_by,
        publishedAt: courseRow.published_at,
        createdAt: courseRow.created_at,
        updatedAt: courseRow.updated_at,
        subjectName: subject?.name || 'Umum',
        sections,
        objectives,
        enrollment,
        totalLessons,
        completedLessons,
        progressPercentage,
      }
    } catch (err) {
      logger.error('Failed to get course details:', err)
      throw toAppError(err, 'Gagal memuat detail materi kursus.')
    }
  },

  /**
   * Enrolls student in course. Idempotent check ensures duplicate requests succeed safely.
   */
  async enrollCourse(courseId: string, source: 'manual' | 'personalized_recommendation' = 'manual'): Promise<CourseEnrollment> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const studentId = authData.user?.id
      if (!studentId) throw new Error('Autentikasi diperlukan.')

      const { data, error } = await supabase
        .from('course_enrollments')
        .upsert(
          {
            course_id: courseId,
            student_id: studentId,
            status: 'active',
            enrollment_source: source,
            enrolled_at: new Date().toISOString(),
          },
          { onConflict: 'student_id,course_id' }
        )
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        courseId: data.course_id,
        studentId: data.student_id,
        status: data.status,
        enrollmentSource: data.enrollment_source,
        enrolledAt: data.enrolled_at,
        completedAt: data.completed_at,
      }
    } catch (err) {
      logger.error('Failed to enroll in course:', err)
      throw toAppError(err, 'Gagal mendaftar kursus pembelajaran.')
    }
  },

  /**
   * Atomically marks a lesson complete via PostgreSQL RPC complete_lesson.
   */
  async completeLesson(lessonId: string): Promise<{ success: boolean; progressPercentage: number; isCourseCompleted: boolean }> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      const { data, error } = await supabase.rpc('complete_lesson', {
        p_lesson_id: lessonId,
      })

      if (error) throw error
      const res = data as { progress_percentage?: number; is_course_completed?: boolean }

      return {
        success: true,
        progressPercentage: Number(res.progress_percentage || 0),
        isCourseCompleted: Boolean(res.is_course_completed),
      }
    } catch (err) {
      logger.error('Failed to complete lesson:', err)
      throw toAppError(err, 'Gagal memperbarui status selesai pelajaran.')
    }
  },

  /**
   * Admin: Creates a new course
   */
  async createCourse(courseData: Partial<Course>): Promise<string> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const slug = (courseData.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || `course-${Date.now()}`

      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: courseData.title || 'Kursus Baru',
          slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
          description: courseData.description || '',
          level: courseData.level || 'beginner',
          status: 'draft',
          estimated_duration_minutes: courseData.estimatedDurationMinutes || 60,
          subject_id: courseData.subjectId || null,
          created_by: authData.user?.id || null,
        })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (err) {
      logger.error('Failed to create course:', err)
      throw toAppError(err, 'Gagal membuat draft kursus baru.')
    }
  },

  /**
   * Admin: Updates course status to published or archived
   */
  async setCourseStatus(courseId: string, status: CourseStatus): Promise<void> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      const updatePayload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      }
      if (status === 'published') {
        updatePayload.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('courses')
        .update(updatePayload)
        .eq('id', courseId)

      if (error) throw error
    } catch (err) {
      logger.error('Failed to update course status:', err)
      throw toAppError(err, 'Gagal memperbarui status publikasi kursus.')
    }
  },
}

export const {
  getCourses,
  getCourseById,
  enrollCourse,
  completeLesson,
  createCourse,
  setCourseStatus,
} = courseService
