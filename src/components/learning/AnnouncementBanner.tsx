import { useState, useEffect } from 'react'
import { Megaphone, X, ChevronRight } from 'lucide-react'
import type { Announcement } from '@/types/announcement'
import { announcementService } from '@/services/announcementService'

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let isMounted = true
    announcementService
      .getAnnouncements()
      .then((data) => {
        if (isMounted) setAnnouncements(data)
      })
      .catch(() => {
        // Safe silence for announcement banner
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (dismissed || announcements.length === 0) return null
  const latest = announcements[0]
  if (!latest) return null

  return (
    <div className="bg-gradient-to-r from-[#6C5CE7] to-[#8F7FF7] rounded-2xl p-4 text-white shadow-md relative overflow-hidden flex items-center justify-between gap-4 animate-in fade-in-50">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Pengumuman
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
              {latest.title}
            </h4>
          </div>
          <p className="text-[11px] text-white/90 truncate mt-0.5 max-w-xl">
            {latest.content}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-white/70 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Tutup pengumuman"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
