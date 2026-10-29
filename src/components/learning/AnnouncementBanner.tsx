import { useState, useEffect } from 'react'
import { Megaphone, X } from 'lucide-react'
import type { Announcement, AnnouncementAudience } from '@/types/announcement'
import { announcementService } from '@/services/announcementService'

interface AnnouncementBannerProps {
  audience?: AnnouncementAudience
}

const ANNOUNCEMENT_CACHE_TTL_MS = 60_000
const announcementCache = new Map<string, { data: Announcement[]; timestamp: number }>()
const dismissedIds = new Set<string>()

export function AnnouncementBanner({ audience }: AnnouncementBannerProps = {}) {
  const cacheKey = audience ?? 'all'
  const cachedEntry = announcementCache.get(cacheKey)
  const isFresh =
    cachedEntry && Date.now() - cachedEntry.timestamp < ANNOUNCEMENT_CACHE_TTL_MS

  const [announcements, setAnnouncements] = useState<Announcement[]>(
    isFresh ? cachedEntry.data : []
  )
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let isMounted = true
    const currentCached = announcementCache.get(cacheKey)
    if (
      currentCached &&
      Date.now() - currentCached.timestamp < ANNOUNCEMENT_CACHE_TTL_MS
    ) {
      setAnnouncements(currentCached.data)
      return () => {
        isMounted = false
      }
    }

    announcementService
      .getAnnouncements(audience)
      .then((data) => {
        announcementCache.set(cacheKey, { data, timestamp: Date.now() })
        if (isMounted) setAnnouncements(data)
      })
      .catch(() => {
        // Safe silence for announcement banner
      })

    return () => {
      isMounted = false
    }
  }, [audience, cacheKey])

  const latest = announcements[0]
  if (dismissed || !latest || dismissedIds.has(latest.id)) return null

  return (
    <div className="bg-[#183058] rounded-2xl p-4 text-white relative overflow-hidden flex items-start sm:items-center justify-between gap-3 animate-in fade-in-50">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold bg-white/15 px-2 py-0.5 rounded-full">
              Pengumuman
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-white break-words">
              {latest.title}
            </h4>
          </div>
          <p className="text-xs text-[#E8ECF6] line-clamp-2 sm:truncate mt-1 max-w-xl">
            {latest.content}
          </p>
        </div>
      </div>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={() => {
            dismissedIds.add(latest.id)
            setDismissed(true)
          }}
          className="min-w-[44px] min-h-[44px] text-white/80 hover:text-white flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Tutup pengumuman"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
