import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminService } from './adminService'
import { subjectService } from './subjectService'
import * as supabaseLib from '@/lib/supabase'

describe('Admin Service & Subject Management (Phase 6)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('subjectService', () => {
    it('fetches list of all subjects with category ordering', async () => {
      const mockSubjects = [
        {
          id: 'sub-1',
          name: 'Matematika Dasar',
          category: 'general',
          description: 'Aritmatika dan aljabar',
          is_active: true,
          created_at: '2026-10-06T10:00:00Z',
          updated_at: '2026-10-06T10:00:00Z',
        },
        {
          id: 'sub-2',
          name: 'Bahasa Arab',
          category: 'religious',
          description: 'Kaidah nahwu dan shorof',
          is_active: true,
          created_at: '2026-10-06T10:00:00Z',
          updated_at: '2026-10-06T10:00:00Z',
        },
      ]

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(function (this: unknown) {
          return {
            order: vi.fn().mockResolvedValue({ data: mockSubjects, error: null }),
          }
        }),
      }

      const mockSupabase = {
        from: vi.fn().mockReturnValue(queryChain),
      }

      vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
        mockSupabase as unknown as supabaseLib.TypedSupabaseClient
      )

      const result = await subjectService.getAllSubjects()
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Matematika Dasar')
      expect(result[1].category).toBe('religious')
    })

    it('creates a new subject and returns the created row', async () => {
      const newSubject = {
        id: 'sub-3',
        name: 'Fisika Mekanika',
        category: 'general' as const,
        description: 'Hukum gerak Newton',
        is_active: true,
        created_at: '2026-10-10T10:00:00Z',
        updated_at: '2026-10-10T10:00:00Z',
      }

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: newSubject, error: null }),
            }),
          }),
        }),
      }

      vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
        mockSupabase as unknown as supabaseLib.TypedSupabaseClient
      )

      const res = await subjectService.createSubject({
        name: 'Fisika Mekanika',
        category: 'general',
        description: 'Hukum gerak Newton',
      })

      expect(res.name).toBe('Fisika Mekanika')
      expect(res.category).toBe('general')
    })

    it('handles duplicate subject name conflict gracefully', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: '23505', message: 'duplicate key' },
              }),
            }),
          }),
        }),
      }

      vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
        mockSupabase as unknown as supabaseLib.TypedSupabaseClient
      )

      await expect(
        subjectService.createSubject({
          name: 'Matematika Dasar',
          category: 'general',
        })
      ).rejects.toThrow('sudah ada di database')
    })

    it('handles foreign key deletion error with informative guidance', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { code: '23503', message: 'foreign key constraint' },
            }),
          }),
        }),
      }

      vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
        mockSupabase as unknown as supabaseLib.TypedSupabaseClient
      )

      await expect(subjectService.deleteSubject('sub-used')).rejects.toThrow(
        'Mata pelajaran sedang digunakan pada tutor atau kurikulum'
      )
    })
  })

  describe('adminService User Management', () => {
    it('aggregates user counts across student, tutor, and admin roles', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockImplementation((_cols: string, opts?: { count?: string }) => {
            if (opts?.count === 'exact') {
              return {
                eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
                then: (resolve: (val: unknown) => void) => resolve({ count: 20, error: null }),
              }
            }
            return {}
          }),
        }),
      }

      vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
        mockSupabase as unknown as supabaseLib.TypedSupabaseClient
      )

      const counts = await adminService.getUserCounts()
      expect(counts.total).toBe(20)
      expect(counts.student).toBe(5)
      expect(counts.tutor).toBe(5)
      expect(counts.admin).toBe(5)
    })

    it('invokes admin_set_user_role RPC when updating user role', async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockSupabase = {
        rpc: mockRpc,
      }

      vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
        mockSupabase as unknown as supabaseLib.TypedSupabaseClient
      )

      await adminService.updateUserRole('user-123', 'tutor')
      expect(mockRpc).toHaveBeenCalledWith('admin_set_user_role', {
        target_user_id: 'user-123',
        new_role: 'tutor',
      })
    })

    it('fetches admin overview stats including activeBookings and pendingPayments', async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'profiles') {
            return {
              select: vi.fn().mockImplementation((_cols: string, opts?: { count?: string }) => {
                if (opts?.count === 'exact') {
                  return {
                    eq: vi.fn().mockResolvedValue({ count: 12, error: null }),
                  }
                }
                return {
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: [
                        { id: 'u1', full_name: 'User 1', email: 'u1@test.com', role: 'student', created_at: '2026-10-01' },
                      ],
                      error: null,
                    }),
                  }),
                }
              }),
            }
          }
          if (table === 'bookings') {
            return {
              select: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ count: 4, error: null }),
              }),
            }
          }
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ count: 2, error: null }),
              }),
            }
          }
          return {}
        }),
      }

      vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
        mockSupabase as unknown as supabaseLib.TypedSupabaseClient
      )

      const overview = await adminService.getOverview()
      expect(overview.totalStudents).toBe(12)
      expect(overview.totalTutors).toBe(12)
      expect(overview.activeBookings).toBe(4)
      expect(overview.pendingPayments).toBe(2)
      expect(overview.recentUsers).toHaveLength(1)
    })

    it('isolates users to students and tutors when callerRole is admin', async () => {
      const inMock = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: [
              { id: 'u1', full_name: 'Student 1', email: 's1@test.com', role: 'student', phone: null, created_at: '2026-10-01', avatar_url: null },
            ],
            count: 1,
            error: null,
          }),
        }),
      })

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            in: inMock,
          }),
        }),
      }

      vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
        mockSupabase as unknown as supabaseLib.TypedSupabaseClient
      )

      const result = await adminService.getUsers({ callerRole: 'admin' })
      expect(inMock).toHaveBeenCalledWith('role', ['student', 'tutor'])
      expect(result.users).toHaveLength(1)
    })

    it('blocks regular admin from demoting super_admin or modifying admin roles', async () => {
      await expect(
        adminService.updateUserRole('target-1', 'student', {
          targetUserRole: 'super_admin',
          callerRole: 'admin',
        })
      ).rejects.toThrow('Akses ditolak')

      await expect(
        adminService.updateUserRole('target-2', 'admin', {
          targetUserRole: 'student',
          callerRole: 'admin',
        })
      ).rejects.toThrow('Akses ditolak')
    })
  })
})
