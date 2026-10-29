import { Flame, Award, Calendar } from 'lucide-react'
import type { StudentStreak } from '@/types/engagement'

interface StreakCardProps {
  streak: StudentStreak
  className?: string
}

export function StreakCard({ streak, className = '' }: StreakCardProps) {
  const current = streak.currentStreak || 0
  const longest = streak.longestStreak || 0

  return (
    <div className={`bg-[#0F1D33] rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center ring-1 ring-orange-500/30 shrink-0">
            <Flame className="w-5 h-5 fill-orange-500/30 text-orange-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white tracking-tight">Streak Belajar</h4>
            <p className="text-xs text-[#B0B4E0] truncate">Konsistensi aktivitas harian</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-extrabold text-orange-400 leading-none">{current}</span>
          <span className="text-xs text-orange-300 ml-1 font-semibold">Hari</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-[#B0B4E0] shrink-0" />
          <span className="text-[#C9D2E3]">Rekor: <strong className="text-white font-semibold">{longest} hari</strong></span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Calendar className="w-3.5 h-3.5 text-[#B0B4E0] shrink-0" />
          <span className="text-[#C9D2E3] text-xs">
            {streak.lastActivityDate ? 'Aktif Terakhir' : 'Mulai Hari Ini'}
          </span>
        </div>
      </div>
    </div>
  )
}
