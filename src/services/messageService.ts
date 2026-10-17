import { getSupabase } from '@/lib/supabase'
import type { Conversation, Message, MessageContact } from '@/types/messaging'
import { AppError } from '@/utils/errors'
import { logger } from '@/lib/logger'

const LOCAL_STORAGE_CONVERSATIONS_KEY = 'laits_conversations_v1'
const LOCAL_STORAGE_MESSAGES_KEY_PREFIX = 'laits_messages_v1_'

interface StoredConversation {
  id: string
  studentId: string
  tutorId: string
  otherUserId: string
  otherName: string
  otherAvatarUrl?: string | null
  otherRole: string
  lastMessageBody?: string | null
  lastMessageSenderId?: string | null
  lastMessageAt: string
  unreadCount: number
  createdAt: string
}

function getStoredConversations(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONVERSATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStoredConversations(conversations: StoredConversation[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations))
  } catch {
    // Ignore storage quota errors
  }
}

function getStoredMessages(conversationId: string): Message[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${conversationId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStoredMessages(conversationId: string, messages: Message[]) {
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_MESSAGES_KEY_PREFIX}${conversationId}`,
      JSON.stringify(messages)
    )
  } catch {
    // Ignore storage quota errors
  }
}

export const messageService = {
  async listConversations(): Promise<Conversation[]> {
    const supabase = getSupabase()

    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('list_my_conversations')
        if (!error && Array.isArray(data)) {
          const mapped: Conversation[] = data.map((row) => {
            const localMsgs = getStoredMessages(row.conversation_id)
            const latestLocalMsg =
              localMsgs.length > 0 ? localMsgs[localMsgs.length - 1] : undefined

            return {
              id: row.conversation_id,
              studentId: row.other_role === 'student' ? row.other_user_id : '',
              tutorId: row.other_role === 'tutor' ? row.other_user_id : '',
              otherUserId: row.other_user_id,
              otherName: row.other_name,
              otherAvatarUrl: row.other_avatar_url,
              otherRole: row.other_role,
              lastMessageBody: row.last_message_body ?? latestLocalMsg?.body ?? null,
              lastMessageSenderId:
                row.last_message_sender_id ?? latestLocalMsg?.senderId ?? null,
              lastMessageAt:
                row.last_message_body || !latestLocalMsg
                  ? row.last_message_at
                  : latestLocalMsg.createdAt,
              unreadCount: row.unread_count,
              createdAt: row.created_at,
            }
          })

          // Preserve local-only fallback threads that have not been migrated to DB UUIDs yet.
          const localOnly = getStoredConversations().filter(
            (localConv) =>
              localConv.id.startsWith('conv_') &&
              !mapped.some((dbConv) => dbConv.otherUserId === localConv.otherUserId)
          )
          const merged = [...mapped, ...localOnly]
          saveStoredConversations(merged)
          return merged
        }
      } catch (err) {
        logger.warn('list_my_conversations RPC unavailable, falling back to local storage', err)
      }
    }

    return getStoredConversations()
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    if (!conversationId) return []

    const supabase = getSupabase()
    if (supabase && !conversationId.startsWith('conv_')) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (!error && Array.isArray(data)) {
          const mapped: Message[] = data.map((row) => ({
            id: row.id,
            conversationId: row.conversation_id,
            senderId: row.sender_id,
            body: row.body,
            readAt: row.read_at,
            createdAt: row.created_at,
          }))

          const localPending = getStoredMessages(conversationId).filter(
            (localMsg) =>
              localMsg.id.startsWith('msg_') &&
              !mapped.some(
                (dbMsg) =>
                  dbMsg.id === localMsg.id ||
                  (dbMsg.body === localMsg.body && dbMsg.senderId === localMsg.senderId)
              )
          )

          const merged = [...mapped, ...localPending].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )

          saveStoredMessages(conversationId, merged)
          return merged
        }
      } catch (err) {
        logger.warn('getMessages query unavailable, falling back to local storage', err)
      }
    }

    return getStoredMessages(conversationId)
  },

  async sendMessage(conversationId: string, body: string, senderIdFallback?: string): Promise<Message> {
    const trimmed = body.trim()
    if (!trimmed) {
      throw new AppError('Pesan tidak boleh kosong.', 'validation')
    }
    if (trimmed.length > 2000) {
      throw new AppError('Pesan terlalu panjang (maksimal 2000 karakter).', 'validation')
    }

    const supabase = getSupabase()
    if (supabase && !conversationId.startsWith('conv_')) {
      try {
        const { data, error } = await supabase.rpc('send_message', {
          p_conversation_id: conversationId,
          p_body: trimmed,
        })

        if (error) {
          logger.warn('send_message RPC returned error, falling back to local storage', error)
        } else if (data) {
          const sentMessage: Message = {
            id: data.id,
            conversationId: data.conversation_id,
            senderId: data.sender_id,
            body: data.body,
            readAt: data.read_at,
            createdAt: data.created_at,
          }

          const existing = getStoredMessages(conversationId).filter(
            (m) => m.id !== sentMessage.id
          )
          saveStoredMessages(conversationId, [...existing, sentMessage])

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('persona_message_sent', { detail: sentMessage }))
          }

          return sentMessage
        }
      } catch (err) {
        logger.warn('send_message RPC failed, falling back to local storage', err)
      }
    }

    const localMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      senderId: senderIdFallback || 'current_user',
      body: trimmed,
      readAt: null,
      createdAt: new Date().toISOString(),
    }

    const currentMessages = getStoredMessages(conversationId)
    const updatedMessages = [...currentMessages, localMsg]
    saveStoredMessages(conversationId, updatedMessages)

    const conversations = getStoredConversations()
    const updatedConversations = conversations.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            lastMessageBody: trimmed,
            lastMessageSenderId: localMsg.senderId,
            lastMessageAt: localMsg.createdAt,
          }
        : c
    )
    saveStoredConversations(updatedConversations)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('persona_message_sent', { detail: localMsg }))
    }

    return localMsg
  },

  async startConversation(
    otherUserId: string,
    initialData?: { otherName?: string; otherRole?: string; otherAvatarUrl?: string | null }
  ): Promise<string> {
    if (!otherUserId) {
      throw new AppError('ID pengguna lawan bicara diperlukan.', 'validation')
    }

    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('start_conversation', {
          p_other_user_id: otherUserId,
        })

        if (!error && data) {
          return data
        }
      } catch (err) {
        logger.warn('start_conversation RPC failed, falling back to local storage', err)
      }
    }

    const conversations = getStoredConversations()
    const existing = conversations.find((c) => c.otherUserId === otherUserId)
    if (existing) {
      return existing.id
    }

    const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const newConv: StoredConversation = {
      id: newId,
      studentId: initialData?.otherRole === 'student' ? otherUserId : 'current_user',
      tutorId: initialData?.otherRole === 'tutor' ? otherUserId : 'current_user',
      otherUserId,
      otherName: initialData?.otherName || 'Pengguna',
      otherAvatarUrl: initialData?.otherAvatarUrl || null,
      otherRole: initialData?.otherRole || 'student',
      lastMessageBody: null,
      lastMessageSenderId: null,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    }

    saveStoredConversations([newConv, ...conversations])
    return newId
  },

  async markConversationRead(conversationId: string): Promise<number> {
    if (!conversationId) return 0

    const supabase = getSupabase()
    if (supabase && !conversationId.startsWith('conv_')) {
      try {
        const { data, error } = await supabase.rpc('mark_conversation_read', {
          p_conversation_id: conversationId,
        })
        if (!error && typeof data === 'number') {
          return data
        }
      } catch (err) {
        logger.warn('mark_conversation_read RPC failed', err)
      }
    }

    const messages = getStoredMessages(conversationId)
    let markedCount = 0
    const updated = messages.map((m) => {
      if (!m.readAt) {
        markedCount++
        return { ...m, readAt: new Date().toISOString() }
      }
      return m
    })
    saveStoredMessages(conversationId, updated)

    const conversations = getStoredConversations()
    const updatedConvs = conversations.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    )
    saveStoredConversations(updatedConvs)

    return markedCount
  },

  /**
   * For tutors, returns students who have booked them; for students, returns active platform tutors.
   */
  async listMessageContacts(): Promise<MessageContact[]> {
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('list_message_contacts')
        if (!error && Array.isArray(data)) {
          return data.map((row) => ({
            userId: row.user_id,
            fullName: row.full_name,
            avatarUrl: row.avatar_url,
            subtitle: row.subtitle,
          }))
        }
      } catch (err) {
        logger.warn('list_message_contacts RPC failed, falling back', err)
      }
    }

    return []
  },

  subscribeToMessages(
    conversationId: string,
    onNewMessage: (msg: Message) => void
  ): () => void {
    const supabase = getSupabase()

    const handleLocalMessage = (event: Event) => {
      const customEvent = event as CustomEvent<Message>
      if (customEvent.detail && customEvent.detail.conversationId === conversationId) {
        onNewMessage(customEvent.detail)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('persona_message_sent', handleLocalMessage)
    }

    let supabaseChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null

    if (supabase && !conversationId.startsWith('conv_')) {
      try {
        supabaseChannel = supabase
          .channel(`messages:${conversationId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
              const row = payload.new as {
                id: string
                conversation_id: string
                sender_id: string
                body: string
                read_at: string | null
                created_at: string
              }
              onNewMessage({
                id: row.id,
                conversationId: row.conversation_id,
                senderId: row.sender_id,
                body: row.body,
                readAt: row.read_at,
                createdAt: row.created_at,
              })
            }
          )
          .subscribe()
      } catch (err) {
        logger.warn('Failed to subscribe to realtime messages channel', err)
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('persona_message_sent', handleLocalMessage)
      }
      if (supabase && supabaseChannel) {
        supabase.removeChannel(supabaseChannel)
      }
    }
  },
}
