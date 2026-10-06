import { getSupabase } from '@/lib/supabase'
import type { Announcement, AnnouncementAudience } from '@/types/announcement'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export const announcementService = {
  /**
   * Fetches published announcements for the current user.
   */
  async getAnnouncements(audience?: AnnouncementAudience): Promise<Announcement[]> {
    const supabase = getSupabase()
    if (!supabase) return []

    try {
      let query = supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')

      if (audience && audience !== 'all') {
        query = query.in('audience', ['all', audience])
      }

      const { data, error } = await query
        .order('published_at', { ascending: false })
        .limit(10)

      if (error) throw error

      return (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content || '',
        audience: row.audience,
        status: row.status,
        publishedAt: row.published_at,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    } catch (err) {
      logger.error('Failed to get announcements:', err)
      return []
    }
  },

  /**
   * Admin: Fetches all announcements (drafts and published).
   */
  async getAllAnnouncementsAdmin(): Promise<Announcement[]> {
    const supabase = getSupabase()
    if (!supabase) return []

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content || '',
        audience: row.audience,
        status: row.status,
        publishedAt: row.published_at,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    } catch (err) {
      logger.error('Failed to get all announcements for admin:', err)
      throw toAppError(err, 'Gagal memuat daftar pengumuman admin.')
    }
  },

  /**
   * Admin: Creates a new announcement draft.
   */
  async createAnnouncement(data: { title: string; content: string; audience: AnnouncementAudience }): Promise<string> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const { data: inserted, error } = await supabase
        .from('announcements')
        .insert({
          title: data.title,
          content: data.content,
          audience: data.audience,
          status: 'draft',
          created_by: authData.user?.id || null,
        })
        .select('id')
        .single()

      if (error) throw error
      return inserted.id
    } catch (err) {
      logger.error('Failed to create announcement:', err)
      throw toAppError(err, 'Gagal membuat pengumuman baru.')
    }
  },

  /**
   * Admin: Atomically publishes announcement and dispatches system notifications via RPC.
   */
  async publishAnnouncement(announcementId: string): Promise<void> {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase client tidak tersedia.')

    try {
      const { error } = await supabase.rpc('publish_announcement', {
        p_announcement_id: announcementId,
      })

      if (error) throw error
    } catch (err) {
      logger.error('Failed to publish announcement:', err)
      throw toAppError(err, 'Gagal mempublikasikan pengumuman.')
    }
  },
}

export const {
  getAnnouncements,
  getAllAnnouncementsAdmin,
  createAnnouncement,
  publishAnnouncement,
} = announcementService
