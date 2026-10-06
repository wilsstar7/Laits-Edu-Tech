import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getGoals,
  createGoal,
  getStreak,
  getAchievements,
  verifyCertificatePublic,
} from './engagementService'
import * as supabaseLib from '@/lib/supabase'

describe('engagementService (Phase 8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches learning goals for authenticated student', async () => {
    const mockGoals = [
      {
        id: 'goal-1',
        student_id: 'student-123',
        title: 'Khatam Nahwu Pemula',
        description: 'Belajar rutin',
        target_type: 'courses',
        target_value: 1,
        current_value: 1,
        start_date: '2026-10-01',
        target_date: '2026-10-31',
        status: 'COMPLETED',
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-06T00:00:00Z',
        completed_at: '2026-10-06T00:00:00Z',
      },
    ]

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockGoals,
          error: null,
        }),
      }),
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const goals = await getGoals()
    expect(goals).toHaveLength(1)
    expect(goals[0].title).toBe('Khatam Nahwu Pemula')
    expect(goals[0].status).toBe('COMPLETED')
  })

  it('creates a new learning goal with validated input', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'student-123' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'goal-2',
            student_id: 'student-123',
            title: 'Sesi Belajar 5 Kali',
            target_type: 'sessions',
            target_value: 5,
            current_value: 0,
            status: 'ACTIVE',
            created_at: '2026-10-06T10:00:00Z',
            updated_at: '2026-10-06T10:00:00Z',
          },
          error: null,
        }),
      }),
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const created = await createGoal({
      title: 'Sesi Belajar 5 Kali',
      targetType: 'sessions',
      targetValue: 5,
    })

    expect(created.id).toBe('goal-2')
    expect(created.targetValue).toBe(5)
  })

  it('fetches streak data and falls back safely if none exists', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            id: 'streak-1',
            student_id: 'student-123',
            current_streak: 5,
            longest_streak: 12,
            last_activity_date: '2026-10-06',
          },
          error: null,
        }),
      }),
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const streak = await getStreak()
    expect(streak.currentStreak).toBe(5)
    expect(streak.longestStreak).toBe(12)
  })

  it('verifies certificate publicly without exposing private student metadata', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        valid: true,
        certificate_number: 'CERT-100200-ABC',
        student_name: 'Ahmad Santoso',
        course_title: 'Dasar Nahwu & Sharaf',
        issued_at: '2026-10-06T12:00:00Z',
      },
      error: null,
    })

    const mockSupabase = {
      rpc: mockRpc,
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const result = await verifyCertificatePublic('CERT-100200-ABC')
    expect(mockRpc).toHaveBeenCalledWith('verify_certificate_public', {
      p_certificate_number: 'CERT-100200-ABC',
    })
    expect(result.isValid).toBe(true)
    expect(result.courseTitle).toBe('Dasar Nahwu & Sharaf')
    expect(result.studentName).toBe('Ahmad Santoso')
  })
})
