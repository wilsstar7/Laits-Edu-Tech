import { getSupabase } from '@/lib/supabase'
import type { AppNotification } from '@/types/notification'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export const notificationService = {
  /**
   * Fetches paginated notifications for the authenticated user.
   */
  async getNotifications(page = 1, limit = 20): Promise<{ notifications: AppNotification[]; total: number }> {
    const supabase = getSupabase()
    if (!supabase) return { notifications: [], total: 0 }

    try {
      const offset = (page - 1) * limit
      const { data, count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const notifications: AppNotification[] = (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        message: row.message,
        type: row.type,
        linkUrl: row.link_url,
        isRead: row.is_read,
        readAt: row.read_at,
        createdAt: row.created_at,
      }))

      return { notifications, total: count || 0 }
    } catch (err) {
      logger.error('Failed to get notifications:', err)
      throw toAppError(err, 'Gagal memuat daftar notifikasi.')
    }
  },

  /**
   * Returns count of unread notifications for current user.
   */
  async getUnreadCount(): Promise<number> {
    const supabase = getSupabase()
    if (!supabase) return 0

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)

      if (error) throw error
      return count || 0
    } catch (err) {
      logger.warn('Failed to get unread notifications count:', err)
      return 0
    }
  },

  /**
   * Marks a single notification as read via PostgreSQL RPC.
   */
  async markAsRead(notificationId: string): Promise<void> {
    const supabase = getSupabase()
    if (!supabase) return

    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
      })
      if (error) throw error
    } catch (err) {
      logger.error('Failed to mark notification as read:', err)
      throw toAppError(err, 'Gagal memperbarui status notifikasi.')
    }
  },

  /**
   * Marks all unread notifications as read for current user via PostgreSQL RPC.
   */
  async markAllAsRead(): Promise<number> {
    const supabase = getSupabase()
    if (!supabase) return 0

    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read')
      if (error) throw error
      return Number(data || 0)
    } catch (err) {
      logger.error('Failed to mark all notifications as read:', err)
      throw toAppError(err, 'Gagal menandai semua notifikasi terbaca.')
    }
  },
}
