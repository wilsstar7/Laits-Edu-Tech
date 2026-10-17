export interface Conversation {
  id: string
  studentId: string
  tutorId: string
  otherUserId: string
  otherName: string
  otherAvatarUrl?: string | null
  otherRole: 'student' | 'tutor' | 'admin' | string
  lastMessageBody?: string | null
  lastMessageSenderId?: string | null
  lastMessageAt: string
  unreadCount: number
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  readAt?: string | null
  createdAt: string
}

export interface MessageContact {
  userId: string
  fullName: string
  avatarUrl?: string | null
  subtitle?: string | null
}
