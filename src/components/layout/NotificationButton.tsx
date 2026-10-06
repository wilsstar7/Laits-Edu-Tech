import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { Bell, CheckCheck, Loader2, ArrowRight } from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import type { AppNotification } from '@/types/notification'
import { formatShortDate } from '@/utils/format'

export function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    async function fetchUnread() {
      try {
        const count = await notificationService.getUnreadCount()
        if (mounted) setUnreadCount(count)
      } catch {
        // silent fallback
      }
    }
    fetchUnread()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    let mounted = true
    async function loadNotifications() {
      setLoading(true)
      try {
        const res = await notificationService.getNotifications(1, 5)
        if (mounted) {
          setNotifications(res.notifications)
        }
      } catch {
        // handled
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadNotifications()
    return () => {
      mounted = false
    }
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      // handled
    }
  }

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id)
        setUnreadCount((c) => Math.max(0, c - 1))
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        )
      } catch {
        // handled
      }
    }
    if (notif.linkUrl) {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifikasi"
        aria-expanded={isOpen}
        className="relative w-10 h-10 rounded-xl bg-white border border-border/80 flex items-center justify-center text-foreground hover:bg-[#EEF0F8] transition-colors focus-visible:outline-2 focus-visible:outline-[#6C5CE7]"
      >
        <Bell className="w-5 h-5 text-[#676A78]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-in zoom-in-75">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-border shadow-xl p-4 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h4 className="font-semibold text-sm text-foreground">Notifikasi</h4>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-[#6C5CE7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto divide-y divide-border/60">
            {loading ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#6C5CE7]" />
                <span className="text-xs text-muted-foreground">Memuat notifikasi...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-foreground">Belum ada notifikasi baru</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                  Aktivitas belajar, jadwal sesi, dan pengumuman sistem akan ditampilkan di sini.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3 transition-colors cursor-pointer rounded-xl my-1 ${
                    notif.isRead ? 'hover:bg-[#F4F5FB]' : 'bg-[#EFEDFD]/30 hover:bg-[#EFEDFD]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs ${notif.isRead ? 'font-medium text-foreground' : 'font-bold text-[#17181C]'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatShortDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-border mt-1">
            <Link
              to="/student/notifications"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 px-3 rounded-xl bg-[#F4F5FB] hover:bg-[#EEF0F8] text-xs font-bold text-[#6C5CE7] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Lihat Semua Notifikasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
