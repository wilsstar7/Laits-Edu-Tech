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
    <div className={`bg-gradient-to-br from-[#17181C] to-[#252630] rounded-2xl p-5 text-white shadow-md relative overflow-hidden ${className}`}>
      {/* Decorative ambient blur */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[#6C5CE7]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center ring-1 ring-orange-500/30">
            <Flame className="w-5 h-5 fill-orange-500/30 text-orange-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Streak Belajar</h4>
            <p className="text-[11px] text-[#8A8D9A]">Konsistensi aktivitas harian</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-orange-400 leading-none">{current}</span>
          <span className="text-xs text-orange-300/80 ml-1 font-semibold">Hari</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-[#8F7FF7]" />
          <span className="text-[#8A8D9A]">Rekor: <strong className="text-white font-semibold">{longest} hari</strong></span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Calendar className="w-3.5 h-3.5 text-[#8A8D9A]" />
          <span className="text-[#8A8D9A] text-[11px]">
            {streak.lastActivityDate ? 'Aktif Terakhir' : 'Mulai Hari Ini'}
          </span>
        </div>
      </div>
    </div>
  )
}
