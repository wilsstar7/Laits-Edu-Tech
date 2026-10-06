import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAnnouncements,
  createAnnouncement,
  publishAnnouncement,
} from './announcementService'
import * as supabaseLib from '@/lib/supabase'

describe('announcementService (Phase 8)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches announcements targeted to students or all audience', async () => {
    const mockData = [
      {
        id: 'ann-1',
        title: 'Selamat Datang di Fitur Baru',
        content: 'Nikmati kursus mandiri dan kuis interaktif.',
        audience: 'all',
        status: 'published',
        published_at: '2026-10-06T10:00:00Z',
        created_by: 'admin-1',
        created_at: '2026-10-06T09:00:00Z',
        updated_at: '2026-10-06T10:00:00Z',
      },
    ]

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      }),
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const list = await getAnnouncements('students')
    expect(list).toHaveLength(1)
    expect(list[0].title).toBe('Selamat Datang di Fitur Baru')
    expect(list[0].audience).toBe('all')
  })

  it('calls publish_announcement RPC when admin publishes an announcement', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        success: true,
        announcement_id: 'ann-1',
        notified_users_count: 24,
      },
      error: null,
    })

    const mockSupabase = {
      rpc: mockRpc,
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    await publishAnnouncement('ann-1')
    expect(mockRpc).toHaveBeenCalledWith('publish_announcement', {
      p_announcement_id: 'ann-1',
    })
  })
})
