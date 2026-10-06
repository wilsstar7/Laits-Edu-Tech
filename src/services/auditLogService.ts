import { requireSupabase } from '@/lib/supabase'
import { toAppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

export interface AuditLogItem {
  id: string
  actorUserId: string | null
  actorName?: string
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown>
  createdAt: string
}

export const auditLogService = {
  /**
   * Admin: Fetches recent audit events for marketplace transparency.
   */
  async getRecentAuditLogs(page = 1, limit = 20): Promise<{ logs: AuditLogItem[]; total: number }> {
    const supabase = requireSupabase()

    try {
      const offset = (page - 1) * limit

      const { data, count, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          actor_user_id,
          action,
          entity_type,
          entity_id,
          metadata,
          created_at,
          actor:profiles ( full_name )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const logs: AuditLogItem[] = (data || []).map((row) => {
        const actorObj = row.actor as { full_name?: string } | null
        return {
          id: row.id,
          actorUserId: row.actor_user_id,
          actorName: actorObj?.full_name || 'Sistem / Anonim',
          action: row.action,
          entityType: row.entity_type,
          entityId: row.entity_id,
          metadata: (row.metadata as Record<string, unknown>) || {},
          createdAt: row.created_at,
        }
      })

      return { logs, total: count || 0 }
    } catch (err) {
      logger.error('Failed to get audit logs:', err)
      throw toAppError(err, 'Gagal memuat log audit aktivitas.')
    }
  },
}
