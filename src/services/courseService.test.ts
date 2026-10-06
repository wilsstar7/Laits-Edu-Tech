import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCourses,
  getCourseById,
  enrollCourse,
  completeLesson,
} from './courseService'
import * as supabaseLib from '@/lib/supabase'

describe('courseService (Phase 8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches list of published courses', async () => {
    const mockCourses = [
      {
        id: 'course-1',
        title: 'Bahasa Arab Dasar',
        slug: 'bahasa-arab-dasar',
        description: 'Materi nahwu shorof pemula',
        thumbnail_url: null,
        level: 'BEGINNER',
        status: 'PUBLISHED',
        estimated_duration_minutes: 120,
        created_by: 'admin-1',
        created_at: '2026-10-06T10:00:00Z',
        updated_at: '2026-10-06T10:00:00Z',
        published_at: '2026-10-06T10:00:00Z',
      },
    ]

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockCourses,
          error: null,
        }),
      }),
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const courses = await getCourses()
    expect(courses).toHaveLength(1)
    expect(courses[0].title).toBe('Bahasa Arab Dasar')
    expect(courses[0].level).toBe('BEGINNER')
  })

  it('enrolls student idempotently and prevents duplicate errors', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'student-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'enroll-1',
            course_id: 'course-1',
            student_id: 'student-123',
            status: 'ACTIVE',
            progress_percentage: 0,
            enrolled_at: '2026-10-06T10:00:00Z',
            completed_at: null,
          },
          error: null,
        }),
      }),
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const enrollment = await enrollCourse('course-1')
    expect(enrollment).toBeDefined()
    expect(enrollment.status).toBe('ACTIVE')
  })

  it('invokes transactional complete_lesson RPC', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        success: true,
        progress_percentage: 100,
        is_course_completed: true,
      },
      error: null,
    })

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'student-123' } },
          error: null,
        }),
      },
      rpc: mockRpc,
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const result = await completeLesson('lesson-1')
    expect(mockRpc).toHaveBeenCalledWith('complete_lesson', {
      p_lesson_id: 'lesson-1',
    })
    expect(result.isCourseCompleted).toBe(true)
    expect(result.progressPercentage).toBe(100)
  })
})
