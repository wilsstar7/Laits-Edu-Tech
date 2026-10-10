import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router'
import {
  MessageSquare,
  Search,
  Send,
  Calendar,
  CheckCheck,
  Plus,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { tutorService } from '@/services/tutorService'
import { bookingService } from '@/services/bookingService'
import type { TutorSummary } from '@/types/tutor'
import { formatShortDate } from '@/utils/format'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  isStudent: boolean
}

interface ConversationItem {
  tutorId: string
  tutorName: string
  tutorAvatar?: string | null
  headline?: string | null
  subjectNames: string[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

const STORAGE_KEY_PREFIX = 'laits_messages_'

const QUICK_PROMPTS = [
  'Halo Ustadz/Guru, saya ingin bertanya ketersediaan jadwal les minggu ini.',
  'Apakah ada materi pengantar yang perlu saya pelajari sebelum sesi kita?',
  'Saya butuh bimbingan tambahan untuk latihan soal dan pemahaman konsep.',
]

export function StudentMessagesPage() {
  const { user } = useAuth()
  const userId = user?.id || 'guest'
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`

  const [tutors, setTutors] = useState<TutorSummary[]>([])
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeTutorId, setActiveTutorId] = useState<string | null>(null)
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({})
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [inputMessage, setInputMessage] = useState('')
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false)
  const [selectedTutorForNewChat, setSelectedTutorForNewChat] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadSavedMessages = useCallback((): Record<string, ChatMessage[]> => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }, [storageKey])

  const saveMessages = useCallback(
    (newMap: Record<string, ChatMessage[]>) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newMap))
      } catch {
        // Storage full or unavailable
      }
    },
    [storageKey]
  )

  useEffect(() => {
    let isMounted = true

    async function initializeData() {
      setLoading(true)
      try {
        const [tutorsRes, bookingsRes] = await Promise.all([
          tutorService.listTutors({ limit: 30 }).catch(() => ({ tutors: [] })),
          bookingService.getStudentBookings().catch(() => []),
        ])

        if (!isMounted) return

        const platformTutors = tutorsRes.tutors || []
        setTutors(platformTutors)

        const savedMap = loadSavedMessages()
        const initialMap: Record<string, ChatMessage[]> = { ...savedMap }

        const bookedTutorIds = new Set(bookingsRes.map((b) => b.tutorId))

        const activeTutorPool = platformTutors.filter(
          (t) => bookedTutorIds.has(t.userId) || bookedTutorIds.has(t.id)
        )
        const displayTutors =
          activeTutorPool.length > 0 ? activeTutorPool : platformTutors.slice(0, 4)

        const convList: ConversationItem[] = []

        displayTutors.forEach((tutor) => {
          const tId = tutor.userId || tutor.id
          if (!initialMap[tId] || initialMap[tId].length === 0) {
            initialMap[tId] = [
              {
                id: `welcome-${tId}`,
                senderId: tId,
                senderName: tutor.fullName,
                text: `Assalamu'alaikum! Selamat datang di sesi bimbingan bersama saya. Jika ada pertanyaan mengenai materi pembelajaran atau jadwal sesi, silakan sampaikan di sini.`,
                timestamp: new Date().toISOString(),
                isStudent: false,
              },
            ]
          }

          const thread = initialMap[tId]
          const lastMsg = thread && thread.length > 0 ? thread[thread.length - 1] : undefined

          convList.push({
            tutorId: tId,
            tutorName: tutor.fullName,
            tutorAvatar: tutor.avatarUrl,
            headline: tutor.headline,
            subjectNames: tutor.subjects.map((s: { name: string }) => s.name),
            lastMessage: lastMsg ? lastMsg.text : 'Mulai konsultasi...',
            lastMessageTime: lastMsg ? lastMsg.timestamp : new Date().toISOString(),
            unreadCount: 0,
          })
        })

        setMessagesMap(initialMap)
        setConversations(convList)
        if (convList.length > 0 && convList[0]) {
          setActiveTutorId(convList[0].tutorId)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat konsultasi tutor.'
        toast.error(msg)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initializeData()

    return () => {
      isMounted = false
    }
  }, [loadSavedMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesMap, activeTutorId])

  const activeTutor = tutors.find(
    (t) => (t.userId || t.id) === activeTutorId
  )
  const activeConversation = conversations.find((c) => c.tutorId === activeTutorId)
  const activeMessages = activeTutorId ? messagesMap[activeTutorId] || [] : []

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || !activeTutorId) return

    const studentName = user?.user_metadata?.full_name || 'Siswa'

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: userId,
      senderName: studentName,
      text,
      timestamp: new Date().toISOString(),
      isStudent: true,
    }

    const updatedThread = [...(messagesMap[activeTutorId] || []), newMsg]
    const updatedMap = {
      ...messagesMap,
      [activeTutorId]: updatedThread,
    }

    setMessagesMap(updatedMap)
    saveMessages(updatedMap)
    setInputMessage('')

    setConversations((prev) =>
      prev.map((c) =>
        c.tutorId === activeTutorId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTime: newMsg.timestamp,
            }
          : c
      )
    )

    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderId: activeTutorId,
        senderName: activeConversation?.tutorName || 'Tutor',
        text: 'Pesan Anda telah diterima. Tutor akan merespons pertanyaan dan mengonfirmasi jadwal segera saat waktu istirahat mengajar.',
        timestamp: new Date().toISOString(),
        isStudent: false,
      }

      setMessagesMap((prev) => {
        const threadWithReply = [...(prev[activeTutorId] || []), replyMsg]
        const mapWithReply = { ...prev, [activeTutorId]: threadWithReply }
        saveMessages(mapWithReply)
        return mapWithReply
      })

      setConversations((prev) =>
        prev.map((c) =>
          c.tutorId === activeTutorId
            ? {
                ...c,
                lastMessage: replyMsg.text,
                lastMessageTime: replyMsg.timestamp,
              }
            : c
        )
      )
    }, 1200)
  }

  const handleStartNewConsultation = () => {
    if (!selectedTutorForNewChat) return
    const tutor = tutors.find((t) => (t.userId || t.id) === selectedTutorForNewChat)
    if (!tutor) return

    const tId = tutor.userId || tutor.id
    if (!conversations.some((c) => c.tutorId === tId)) {
      const initialThread: ChatMessage[] = [
        {
          id: `welcome-${tId}`,
          senderId: tId,
          senderName: tutor.fullName,
          text: `Assalamu'alaikum! Senang dapat mendampingi proses belajar Anda. Silakan tanyakan hal-hal yang ingin dikonsultasikan.`,
          timestamp: new Date().toISOString(),
          isStudent: false,
        },
      ]

      const updatedMap = { ...messagesMap, [tId]: initialThread }
      setMessagesMap(updatedMap)
      saveMessages(updatedMap)

      const firstMsg = initialThread[0]
      setConversations((prev) => [
        {
          tutorId: tId,
          tutorName: tutor.fullName,
          tutorAvatar: tutor.avatarUrl,
          headline: tutor.headline,
          subjectNames: tutor.subjects.map((s: { name: string }) => s.name),
          lastMessage: firstMsg ? firstMsg.text : 'Mulai konsultasi...',
          lastMessageTime: firstMsg ? firstMsg.timestamp : new Date().toISOString(),
          unreadCount: 0,
        },
        ...prev,
      ])
    }

    setActiveTutorId(tId)
    setNewChatDialogOpen(false)
    setSelectedTutorForNewChat(null)
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.tutorName.toLowerCase().includes(search.toLowerCase()) ||
      c.subjectNames.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Pesan & Konsultasi Tutor"
          subtitle="Saluran komunikasi langsung dengan tutor privat Anda untuk diskusi materi, konsultasi tugas, dan konfirmasi jadwal."
          badge="Komunikasi Pembelajaran"
          action={
            <Button
              size="sm"
              onClick={() => setNewChatDialogOpen(true)}
              className="min-h-[44px] gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              <Plus className="w-4 h-4" />
              <span>Mulai Konsultasi Baru</span>
            </Button>
          }
        />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
          <div className="md:col-span-4 lg:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-primary" />
                  <span>Daftar Percakapan</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {conversations.length} Tutor
                </span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Cari tutor atau mata pelajaran..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                  <p className="text-xs">Memuat daftar tutor...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Tidak ada percakapan
                  </p>
                  <p className="text-[11px]">
                    Klik tombol di atas untuk memulai konsultasi dengan tutor pilihan.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.tutorId === activeTutorId
                  const initials = conv.tutorName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()

                  return (
                    <button
                      key={conv.tutorId}
                      type="button"
                      onClick={() => setActiveTutorId(conv.tutorId)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                        isSelected
                          ? 'bg-slate-50 dark:bg-slate-800/80 border-l-4 border-l-brand-primary'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {conv.tutorName}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatShortDate(conv.lastMessageTime)}
                          </span>
                        </div>
                        {conv.subjectNames.length > 0 && (
                          <div className="flex flex-wrap gap-1 my-1">
                            {conv.subjectNames.slice(0, 2).map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-8 flex flex-col bg-slate-50/40 dark:bg-slate-900/40">
            {activeConversation ? (
              <>
                <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {activeConversation.tutorName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {activeConversation.tutorName}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {activeConversation.headline ||
                          (activeConversation.subjectNames.length > 0
                            ? `Pengajar: ${activeConversation.subjectNames.join(', ')}`
                            : 'Mitra Tutor Laits LMS')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {activeTutor && (
                      <Link
                        to={`/tutor/${activeTutor.id}`}
                        className="text-xs text-brand-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span>Profil</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    <Link to="/student/schedule">
                      <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Jadwal Sesi</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[350px]">
                  <div className="text-center py-2">
                    <span className="text-[11px] text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800 shadow-2xs">
                      Pesan dilindungi oleh pedoman komunitas Laits LMS
                    </span>
                  </div>

                  {activeMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isStudent ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.isStudent
                            ? 'bg-brand-primary text-white rounded-tr-xs shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            msg.isStudent ? 'text-white/70' : 'text-slate-400'
                          }`}
                        >
                          <span>{formatShortDate(msg.timestamp)}</span>
                          {msg.isStudent && <CheckCheck className="w-3 h-3 text-white/90" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-4 pt-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                      Bantuan Cepat:
                    </span>
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[11px] bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full shrink-0 transition-colors"
                      >
                        {prompt.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      type="text"
                      placeholder="Tulis pesan konsultasi Anda..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 text-xs py-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="bg-brand-primary text-white hover:bg-brand-primary/90 h-9 px-4 gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Kirim</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                  Pilih Percakapan Tutor
                </h4>
                <p className="text-xs max-w-sm">
                  Pilih tutor dari daftar di sebelah kiri atau mulai konsultasi baru untuk menanyakan materi belajar dan jadwal bimbingan privat.
                </p>
                <Button
                  size="sm"
                  onClick={() => setNewChatDialogOpen(true)}
                  className="bg-brand-primary text-white hover:bg-brand-primary/90 mt-2 text-xs"
                >
                  Mulai Konsultasi Baru
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mulai Konsultasi dengan Tutor</DialogTitle>
            <DialogDescription>
              Pilih tutor yang ingin Anda hubungi untuk berdiskusi materi dan jadwal les privat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-72 overflow-y-auto">
            {tutors.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Tidak ada data tutor terdaftar.
              </p>
            ) : (
              tutors.map((tutor) => {
                const tId = tutor.userId || tutor.id
                const isSelected = selectedTutorForNewChat === tId

                return (
                  <label
                    key={tId}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedTutor"
                      value={tId}
                      checked={isSelected}
                      onChange={() => setSelectedTutorForNewChat(tId)}
                      className="mt-0.5 text-brand-primary focus:ring-brand-primary"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {tutor.fullName}
                      </p>
                      {tutor.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tutor.subjects.slice(0, 3).map((sub: { id: string; name: string }) => (
                            <Badge
                              key={sub.id}
                              variant="outline"
                              className="text-[9px] py-0 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {sub.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                )
              })
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setNewChatDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleStartNewConsultation}
              disabled={!selectedTutorForNewChat}
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              Mulai Percakapan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
