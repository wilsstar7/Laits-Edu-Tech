export type NotificationType = 'info' | 'booking' | 'payment' | 'report' | 'system'

export interface AppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  linkUrl: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}
