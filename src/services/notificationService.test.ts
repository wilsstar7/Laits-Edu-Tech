import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationService } from './notificationService';
import * as supabaseLib from '@/lib/supabase';

describe('notificationService (Phase 7)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches paginated notifications cleanly and maps field names', async () => {
    const mockData = [
      {
        id: 'notif-1',
        user_id: 'user-123',
        title: 'Booking Dikonfirmasi',
        message: 'Tutor telah mengonfirmasi sesi Anda.',
        type: 'booking_confirmed',
        link_url: '/student/bookings',
        is_read: false,
        read_at: null,
        created_at: '2026-10-06T10:00:00Z',
      },
    ];

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockData,
          count: 1,
          error: null,
        }),
      }),
    };

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    );

    const result = await notificationService.getNotifications(1, 10);
    expect(result.total).toBe(1);
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0]?.title).toBe('Booking Dikonfirmasi');
    expect(result.notifications[0]?.isRead).toBe(false);
  });

  it('fetches unread count correctly', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          count: 4,
          error: null,
        }),
      }),
    };

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    );

    const count = await notificationService.getUnreadCount();
    expect(count).toBe(4);
  });

  it('calls PostgreSQL RPC mark_notification_read', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSupabase = {
      rpc: mockRpc,
    };

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    );

    await notificationService.markAsRead('notif-1');
    expect(mockRpc).toHaveBeenCalledWith('mark_notification_read', {
      p_notification_id: 'notif-1',
    });
  });

  it('calls PostgreSQL RPC mark_all_notifications_read', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: 3, error: null });
    const mockSupabase = {
      rpc: mockRpc,
    };

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    );

    const updated = await notificationService.markAllAsRead();
    expect(mockRpc).toHaveBeenCalledWith('mark_all_notifications_read');
    expect(updated).toBe(3);
  });
});
