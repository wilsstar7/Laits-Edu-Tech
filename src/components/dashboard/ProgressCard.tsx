import { Link } from 'react-router'
import { TrendingUp } from 'lucide-react'

export function ProgressCard() {
  const percent = 0

  return (
    <div className="surface-card p-6 flex flex-col justify-between bg-white border border-border">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-[#17181C]">Progres Pembelajaran</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#E6F6EE] text-[#45B97C]">
            Status: Baru
          </span>
        </div>

        <div className="py-5 space-y-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-[#676A78] font-medium">Target Mingguan</span>
            <span className="font-extrabold text-[#17181C] text-lg">{percent}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-[#EEF0F8] rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-[#6C5CE7] rounded-full"
              style={{ width: `${Math.max(percent, 2)}%` }}
            />
          </div>

          <p className="text-xs text-[#676A78] leading-relaxed pt-1">
            Belum ada aktivitas belajar yang diselesaikan. Progres akan terisi secara berkala setelah Anda mengambil sesi privat atau menyelesaikan materi.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-border/60">
        <Link
          to="/student/learning"
          className="inline-block text-xs font-bold text-[#6C5CE7] hover:underline"
        >
          Lihat Katalog Materi Belajar
        </Link>
      </div>
    </div>
  )
}
