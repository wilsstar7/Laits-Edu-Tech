import { describe, it, expect, beforeEach, vi } from 'vitest'
import { messageService } from './messageService'
import * as supabaseLib from '@/lib/supabase'
import { AppError } from '@/utils/errors'

const storage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => {
    storage[key] = value
  },
  removeItem: (key: string) => {
    delete storage[key]
  },
  clear: () => {
    Object.keys(storage).forEach((k) => delete storage[k])
  },
  length: 0,
  key: (i: number) => Object.keys(storage)[i] ?? null,
}

if (!globalThis.localStorage) {
  globalThis.localStorage = mockLocalStorage as unknown as Storage
}

describe('messageService', () => {
  beforeEach(() => {
    globalThis.localStorage.clear()
    vi.restoreAllMocks()
    // By default for unit tests without network, mock getSupabase to return null so local tests run instantly
    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(null)
  })

  it('validates empty and whitespace-only message bodies', async () => {
    await expect(messageService.sendMessage('conv_123', '')).rejects.toThrow(AppError)
    await expect(messageService.sendMessage('conv_123', '   ')).rejects.toThrow(AppError)
  })

  it('validates message bodies exceeding 2000 characters', async () => {
    const tooLong = 'a'.repeat(2001)
    await expect(messageService.sendMessage('conv_123', tooLong)).rejects.toThrow(AppError)
  })

  it('starts a new conversation in local fallback and lists it', async () => {
    const convId = await messageService.startConversation('student_456', {
      otherName: 'Budi Santoso',
      otherRole: 'student',
    })

    expect(convId).toBeDefined()

    const convs = await messageService.listConversations()
    expect(convs.length).toBe(1)
    expect(convs[0]?.otherName).toBe('Budi Santoso')
    expect(convs[0]?.otherUserId).toBe('student_456')
  })

  it('sends and retrieves messages within a conversation', async () => {
    const convId = await messageService.startConversation('student_789', {
      otherName: 'Siti Rahma',
      otherRole: 'student',
    })

    const msg = await messageService.sendMessage(convId, 'Halo Siti, sesi bimbingan dimulai jam 16:00.')
    expect(msg.body).toBe('Halo Siti, sesi bimbingan dimulai jam 16:00.')
    expect(msg.conversationId).toBe(convId)

    const messages = await messageService.getMessages(convId)
    expect(messages.length).toBe(1)
    expect(messages[0]?.body).toBe('Halo Siti, sesi bimbingan dimulai jam 16:00.')
  })

  it('marks conversation as read', async () => {
    const convId = await messageService.startConversation('student_101', {
      otherName: 'Ahmad Fauzi',
      otherRole: 'student',
    })

    await messageService.sendMessage(convId, 'Pesan pertama')
    const count = await messageService.markConversationRead(convId)
    expect(count).toBeGreaterThanOrEqual(1)

    const messages = await messageService.getMessages(convId)
    expect(messages[0]?.readAt).not.toBeNull()
  })

  it('interacts with Supabase RPCs when configured', async () => {
    const mockRpc = vi.fn().mockImplementation((fnName: string) => {
      if (fnName === 'list_my_conversations') {
        return Promise.resolve({
          data: [
            {
              conversation_id: 'conv-real-1',
              other_user_id: 'student-real-1',
              other_name: 'Farhan',
              other_avatar_url: null,
              other_role: 'student',
              last_message_body: 'Siap ustadz',
              last_message_sender_id: 'student-real-1',
              last_message_at: '2026-10-15T10:00:00Z',
              unread_count: 2,
              created_at: '2026-10-15T09:00:00Z',
            },
          ],
          error: null,
        })
      }
      if (fnName === 'send_message') {
        return Promise.resolve({
          data: {
            id: 'msg-real-1',
            conversation_id: 'conv-real-1',
            sender_id: 'tutor-real-1',
            body: 'Sampai bertemu di sesi bimbingan.',
            read_at: null,
            created_at: '2026-10-15T10:05:00Z',
          },
          error: null,
        })
      }
      return Promise.resolve({ data: null, error: null })
    })

    const mockSupabase = {
      rpc: mockRpc,
      from: vi.fn(),
      channel: vi.fn(),
    }

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    )

    const convs = await messageService.listConversations()
    expect(convs).toHaveLength(1)
    expect(convs[0]?.otherName).toBe('Farhan')
    expect(convs[0]?.unreadCount).toBe(2)

    const sent = await messageService.sendMessage('conv-real-1', 'Sampai bertemu di sesi bimbingan.')
    expect(sent.id).toBe('msg-real-1')
    expect(mockRpc).toHaveBeenCalledWith('send_message', {
      p_conversation_id: 'conv-real-1',
      p_body: 'Sampai bertemu di sesi bimbingan.',
    })
  })
})
