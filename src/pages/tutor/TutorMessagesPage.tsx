import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  MessageSquare,
  Search,
  Send,
  Calendar,
  CheckCheck,
  Check,
  Plus,
  Loader2,
  ChevronLeft,
  Clock,
  User,
  BookOpen,
  AlertCircle,
  RefreshCw,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { messageService } from '@/services/messageService'
import { bookingService } from '@/services/bookingService'
import type { Conversation, Message, MessageContact } from '@/types/messaging'
import { formatShortDate } from '@/utils/format'

const TUTOR_QUICK_REPLIES = [
  "Assalamu'alaikum, jadwal sesi kita hari ini sudah siap diakses.",
  'Silakan siapkan bahan atau materi latihan soal yang ingin dibahas.',
  'Alhamdulillah untuk sesi hari ini, catatan evaluasi belajar telah saya perbarui.',
  'Apakah ada kendala pemahaman pada tugas atau materi sebelumnya?',
]

export function TutorMessagesPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialConvId = searchParams.get('c')
  const initialStudentId = searchParams.get('studentId')

  const userId = user?.id || ''

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConvId)
  const [messages, setMessages] = useState<Message[]>([])
  const [contacts, setContacts] = useState<MessageContact[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [inputText, setInputText] = useState('')
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [startingChat, setStartingChat] = useState(false)

  const [mobileShowChat, setMobileShowChat] = useState(Boolean(initialConvId || initialStudentId))

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  const [reloadKey, setReloadKey] = useState(0)

  const handleReload = () => {
    setLoading(true)
    setErrorMsg(null)
    setReloadKey((k) => k + 1)
  }

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const [convList, contactList, bookingsList] = await Promise.all([
          messageService.listConversations(),
          messageService.listMessageContacts().catch(() => []),
          bookingService.getTutorBookings(userId).catch(() => []),
        ])

        if (!isMounted) return

        const contactMap = new Map<string, MessageContact>()
        contactList.forEach((c) => {
          contactMap.set(c.userId, c)
        })

        bookingsList.forEach((b) => {
          if (b.studentId && !contactMap.has(b.studentId)) {
            contactMap.set(b.studentId, {
              userId: b.studentId,
              fullName: b.studentName,
              avatarUrl: b.studentAvatarUrl,
              subtitle: `${b.subjectName} (${b.status === 'confirmed' ? 'Sesi Aktif' : 'Terdaftar'})`,
            })
          }
        })

        const mergedContacts = Array.from(contactMap.values())
        setContacts(mergedContacts)

        let finalConvs = convList

        if (initialStudentId) {
          const existingForStudent = finalConvs.find((c) => c.otherUserId === initialStudentId)
          if (existingForStudent) {
            setConversations(finalConvs)
            setActiveConversationId(existingForStudent.id)
            setMobileShowChat(true)
          } else {
            const targetContact = mergedContacts.find((c) => c.userId === initialStudentId)
            const newConvId = await messageService.startConversation(initialStudentId, {
              otherName: targetContact?.fullName || 'Murid',
              otherRole: 'student',
              otherAvatarUrl: targetContact?.avatarUrl || null,
            })
            finalConvs = await messageService.listConversations()
            if (!isMounted) return
            setConversations(finalConvs)
            setActiveConversationId(newConvId)
            setMobileShowChat(true)
          }
        } else if (initialConvId) {
          setConversations(finalConvs)
          setActiveConversationId(initialConvId)
          setMobileShowChat(true)
        } else {
          setConversations(finalConvs)
          if (finalConvs.length > 0 && finalConvs[0]) {
            setActiveConversationId(finalConvs[0].id)
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return
        const msg = err instanceof Error ? err.message : 'Gagal memuat percakapan murid.'
        setErrorMsg(msg)
        toast.error(msg)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [userId, initialConvId, initialStudentId, reloadKey])

  useEffect(() => {
    if (!activeConversationId) {
      return
    }

    let isMounted = true

    async function fetchThread(convId: string) {
      await Promise.resolve()
      if (isMounted) setLoadingMessages(true)
      try {
        const msgs = await messageService.getMessages(convId)
        if (isMounted) {
          setMessages(msgs)
          setTimeout(() => scrollToBottom(false), 50)
          await messageService.markConversationRead(convId)
          setConversations((prev) =>
            prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
          )
        }
      } catch {
        if (isMounted) {
          toast.error('Gagal memuat isi percakapan murid.')
        }
      } finally {
        if (isMounted) {
          setLoadingMessages(false)
        }
      }
    }

    fetchThread(activeConversationId)

    const unsubscribe = messageService.subscribeToMessages(activeConversationId, (newMsg) => {
      if (!isMounted) return
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
      setTimeout(() => scrollToBottom(true), 50)

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                lastMessageBody: newMsg.body,
                lastMessageSenderId: newMsg.senderId,
                lastMessageAt: newMsg.createdAt,
              }
            : c
        )
      )

      if (newMsg.senderId !== userId) {
        messageService.markConversationRead(activeConversationId)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [activeConversationId, userId, scrollToBottom])

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId)
    setMobileShowChat(true)
    setSearchParams({ c: convId })
  }

  const handleBackToList = () => {
    setMobileShowChat(false)
  }

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputText).trim()
    if (!textToSend || !activeConversationId || sending) return

    setSending(true)
    try {
      const sent = await messageService.sendMessage(activeConversationId, textToSend, userId)
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev
        return [...prev, sent]
      })
      if (!textOverride) {
        setInputText('')
      }
      setTimeout(() => scrollToBottom(true), 50)

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                lastMessageBody: textToSend,
                lastMessageSenderId: userId,
                lastMessageAt: sent.createdAt,
              }
            : c
        )
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim pesan.'
      toast.error(msg)
    } finally {
      setSending(false)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  const handleStartNewChat = async () => {
    if (!selectedContactId || startingChat) return
    setStartingChat(true)

    try {
      const contact = contacts.find((c) => c.userId === selectedContactId)
      const convId = await messageService.startConversation(selectedContactId, {
        otherName: contact?.fullName || 'Murid',
        otherRole: 'student',
        otherAvatarUrl: contact?.avatarUrl || null,
      })

      const updated = await messageService.listConversations()
      setConversations(updated)
      setActiveConversationId(convId)
      setNewChatDialogOpen(false)
      setSelectedContactId(null)
      setMobileShowChat(true)
      setSearchParams({ c: convId })
      toast.success(`Percakapan dengan ${contact?.fullName || 'murid'} dibuka.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memulai percakapan baru.'
      toast.error(msg)
    } finally {
      setStartingChat(false)
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.otherName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConv = conversations.find((c) => c.id === activeConversationId)
  const activeContactInfo = activeConv
    ? contacts.find((ct) => ct.userId === activeConv.otherUserId)
    : undefined

  const totalUnread = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)

  return (
    <AppShell>
      <PageHeader
        title="Pesan & Konsultasi Murid"
        subtitle="Kelola komunikasi privat, bimbingan materi, dan koordinasi jadwal sesi langsung dengan murid bimbingan Anda."
        badge={
          totalUnread > 0
            ? `${totalUnread} Pesan Baru`
            : 'Portal Komunikasi Tutor'
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setNewChatDialogOpen(true)}
              className="min-h-[44px] bg-brand-primary text-white hover:bg-brand-primary/90 text-xs font-semibold gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Mulai Chat Murid</span>
            </Button>
            <Link
              to="/tutor/sessions"
              className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl bg-white border border-border text-ink-primary hover:bg-surface text-xs font-bold transition-colors min-h-[44px] gap-2"
            >
              <Clock className="w-4 h-4 text-brand-primary" />
              <span>Riwayat Sesi Belajar</span>
            </Link>
          </div>
        }
      />

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-danger/5 border border-danger/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-ink-primary">
                Gagal Memuat Data Percakapan
              </p>
              <p className="text-xs text-ink-secondary mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReload}
            className="min-h-[44px] text-xs font-semibold gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </Button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border/80 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[620px] max-h-[calc(100dvh-210px)]">
        {/* Left Panel: Student Conversation List */}
        <aside
          aria-label="Daftar percakapan murid"
          className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-surface/30 ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-border bg-white space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="search"
                aria-label="Cari nama murid"
                placeholder="Cari murid atau pesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs bg-surface border-border min-h-[44px]"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-ink-muted px-1">
              <span>Percakapan Aktif ({conversations.length})</span>
              {totalUnread > 0 && (
                <span className="font-semibold text-brand-primary">
                  {totalUnread} belum dibaca
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <div className="p-8 text-center space-y-3 text-ink-muted" role="status">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
                <p className="text-xs">Memuat daftar konsultasi murid...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3 text-ink-muted">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto text-ink-muted">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-ink-primary">
                  {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada percakapan murid'}
                </p>
                <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                  {searchQuery
                    ? 'Coba gunakan kata kunci lain untuk mencari nama murid.'
                    : 'Pilih murid dari daftar sesi belajar Anda untuk memulai konsultasi materi.'}
                </p>
                {!searchQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewChatDialogOpen(true)}
                    className="min-h-[44px] text-xs font-semibold text-brand-primary border-brand-primary/30 mt-2"
                  >
                    Pilih Murid Bimbingan
                  </Button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId
                const unread = conv.unreadCount > 0
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 min-h-[76px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary ${
                      isActive
                        ? 'bg-brand-primary/8 ring-1 ring-inset ring-brand-primary/20'
                        : 'hover:bg-white/90'
                    }`}
                  >
                    <Avatar className="w-11 h-11 border border-border shrink-0 mt-0.5">
                      {conv.otherAvatarUrl && (
                        <AvatarImage src={conv.otherAvatarUrl} alt={conv.otherName} />
                      )}
                      <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold text-sm">
                        {conv.otherName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-xs truncate ${
                            unread ? 'font-bold text-ink-primary' : 'font-semibold text-ink-primary'
                          }`}
                        >
                          {conv.otherName}
                        </span>
                        <span className="text-xs text-ink-muted shrink-0">
                          {formatShortDate(conv.lastMessageAt)}
                        </span>
                      </div>

                      <p
                        className={`text-xs truncate leading-snug ${
                          unread ? 'font-medium text-ink-primary' : 'text-ink-muted'
                        }`}
                      >
                        {conv.lastMessageBody || 'Ketuk untuk mengirim pesan pembuka'}
                      </p>

                      <div className="flex items-center justify-between mt-1.5">
                        <Badge
                          variant="outline"
                          className="text-xs py-0 px-1.5 bg-surface text-ink-muted border-border font-normal"
                        >
                          Murid
                        </Badge>
                        {unread && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-brand-primary text-white rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Right Panel: Active Chat Thread */}
        <main
          aria-label="Ruang percakapan aktif"
          className={`flex-1 flex flex-col bg-white ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="md:hidden min-h-[44px] min-w-[44px] p-0 -ml-1 text-ink-primary shrink-0"
                    aria-label="Kembali ke daftar pesan"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <Avatar className="w-10 h-10 border border-border shrink-0">
                    {activeConv.otherAvatarUrl && (
                      <AvatarImage src={activeConv.otherAvatarUrl} alt={activeConv.otherName} />
                    )}
                    <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold text-sm">
                      {activeConv.otherName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-bold text-ink-primary leading-tight truncate">
                        {activeConv.otherName}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                        <UserCheck className="w-3 h-3 text-emerald-700" />
                        Murid Bimbingan
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted truncate mt-0.5">
                      {activeContactInfo?.subtitle || 'Konsultasi Bimbingan Belajar Privat'}
                    </p>
                  </div>
                </div>

                <Link
                  to="/tutor/sessions"
                  className="inline-flex items-center text-xs font-semibold text-brand-primary hover:text-brand-primary/80 gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-surface transition-colors min-h-[44px] shrink-0"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Jadwal Sesi</span>
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface/20">
                <div className="max-w-md mx-auto p-3.5 rounded-xl bg-white border border-border text-center space-y-1 shadow-2xs">
                  <div className="inline-flex items-center gap-1.5 text-brand-primary font-bold text-xs">
                    <BookOpen className="w-4 h-4" />
                    <span>Ruang Konsultasi Terverifikasi</span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Seluruh percakapan tersimpan di Laits Edu Tech untuk mendukung evaluasi
                    perkembangan dan koordinasi sesi belajar murid.
                  </p>
                </div>

                {loadingMessages ? (
                  <div className="py-12 text-center space-y-2 text-ink-muted" role="status">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-primary" />
                    <p className="text-xs">Memuat riwayat pesan...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center space-y-2 text-ink-muted">
                    <p className="text-xs font-semibold text-ink-primary">
                      Belum ada percakapan dalam ruang ini
                    </p>
                    <p className="text-xs text-ink-muted max-w-sm mx-auto">
                      Gunakan tombol respon cepat di bawah atau ketik pesan pembuka untuk menyapa murid.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe =
                      msg.senderId === userId || msg.senderId === 'current_user'
                    const showDateHeader =
                      index === 0 ||
                      new Date(msg.createdAt).toDateString() !==
                        new Date(messages[index - 1]?.createdAt || '').toDateString()

                    return (
                      <div key={msg.id} className="space-y-3">
                        {showDateHeader && (
                          <div className="flex items-center justify-center my-3">
                            <span className="text-xs font-semibold text-ink-muted bg-white border border-border px-3 py-1 rounded-full shadow-2xs">
                              {formatShortDate(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && (
                            <Avatar className="w-7 h-7 border border-border shrink-0">
                              {activeConv.otherAvatarUrl && (
                                <AvatarImage src={activeConv.otherAvatarUrl} alt={activeConv.otherName} />
                              )}
                              <AvatarFallback className="text-xs bg-brand-primary/10 text-brand-primary font-bold">
                                {activeConv.otherName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed break-words ${
                              isMe
                                ? 'bg-brand-primary text-white rounded-br-xs'
                                : 'bg-white text-ink-primary border border-border/80 rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.body}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                                isMe ? 'text-white/85' : 'text-ink-muted'
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isMe && (
                                msg.readAt ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-white" aria-label="Dibaca" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-white/85" aria-label="Terkirim" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-2.5 border-t border-border bg-white flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-ink-muted shrink-0">
                  Respon Cepat:
                </span>
                {TUTOR_QUICK_REPLIES.map((reply, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(reply)}
                    disabled={sending}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-surface hover:bg-brand-primary/10 border border-border hover:border-brand-primary/40 text-xs text-ink-secondary hover:text-brand-primary transition-colors text-left disabled:opacity-50 min-h-[44px]"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <div className="p-3 sm:p-4 border-t border-border bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-end gap-2.5"
                >
                  <div className="flex-1 relative">
                    <label htmlFor="tutor-message-input" className="sr-only">
                      Tulis pesan untuk murid
                    </label>
                    <textarea
                      id="tutor-message-input"
                      ref={textareaRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Tulis pesan untuk murid... (Tekan Enter untuk kirim)"
                      rows={2}
                      maxLength={2000}
                      className="w-full text-xs p-3 pr-16 rounded-xl border border-border bg-surface focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary transition-all resize-none min-h-[48px]"
                    />
                    <div className="absolute right-3 bottom-2.5 text-xs text-ink-muted pointer-events-none">
                      {inputText.length}/2000
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="min-h-[48px] min-w-[48px] px-4 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shrink-0 shadow-xs"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span className="hidden sm:inline">Kirim</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-ink-muted space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-brand-primary">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-sm font-bold text-ink-primary">
                Pilih Percakapan Murid
              </h2>
              <p className="text-xs text-ink-muted max-w-sm leading-relaxed">
                Pilih salah satu murid dari panel samping kiri untuk melihat riwayat obrolan atau klik
                tombol di bawah untuk menghubungi murid yang telah memesan sesi bimbingan.
              </p>
              <Button
                type="button"
                onClick={() => setNewChatDialogOpen(true)}
                className="min-h-[44px] bg-brand-primary text-white hover:bg-brand-primary/90 text-xs font-semibold gap-2 shadow-xs mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Chat Murid</span>
              </Button>
            </div>
          )}
        </main>
      </div>

      <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink-primary flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-primary" />
              Mulai Chat Murid
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted">
              Pilih murid dari daftar sesi belajar Anda untuk memulai ruang konsultasi privat.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-6 text-center space-y-2 border border-dashed border-border rounded-xl">
                <User className="w-6 h-6 text-ink-muted mx-auto" />
                <p className="text-xs font-semibold text-ink-primary">
                  Belum ada murid bimbingan
                </p>
                <p className="text-xs text-ink-muted">
                  Murid yang memesan sesi belajar dengan Anda akan otomatis muncul pada daftar kontak ini.
                </p>
              </div>
            ) : (
              contacts.map((contact) => {
                const isSelected = selectedContactId === contact.userId
                return (
                  <button
                    key={contact.userId}
                    type="button"
                    onClick={() => setSelectedContactId(contact.userId)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/8 text-ink-primary'
                        : 'border-border hover:bg-surface text-ink-secondary'
                    }`}
                  >
                    <Avatar className="w-10 h-10 border border-border shrink-0">
                      {contact.avatarUrl && (
                        <AvatarImage src={contact.avatarUrl} alt={contact.fullName} />
                      )}
                      <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold text-xs">
                        {contact.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink-primary truncate">
                        {contact.fullName}
                      </p>
                      <p className="text-xs text-ink-muted truncate">
                        {contact.subtitle || 'Murid Terdaftar'}
                      </p>
                    </div>

                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className={`text-xs shrink-0 ${
                        isSelected
                          ? 'bg-brand-primary text-white'
                          : 'text-ink-muted border-border'
                      }`}
                    >
                      {isSelected ? 'Dipilih' : 'Pilih'}
                    </Badge>
                  </button>
                )
              })
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewChatDialogOpen(false)}
              className="min-h-[44px] text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={!selectedContactId || startingChat}
              onClick={handleStartNewChat}
              className="min-h-[44px] bg-brand-primary text-white hover:bg-brand-primary/90 text-xs font-semibold gap-2"
            >
              {startingChat ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuka...</span>
                </>
              ) : (
                <span>Buka Percakapan</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
