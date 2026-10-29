import { Link } from 'react-router'
import { TrendingUp } from 'lucide-react'

export function ProgressCard() {
  const percent = 0

  return (
    <div className="surface-card p-4 sm:p-6 flex flex-col justify-between bg-white border border-border min-w-0">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#E8ECF6] text-[#183058] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#17181C]">Progres Pembelajaran</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#E6F6EE] text-[#45B97C] shrink-0">
            Status: Baru
          </span>
        </div>

        <div className="py-4 sm:py-5 space-y-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-[#676A78] font-medium">Target Mingguan</span>
            <span className="font-extrabold text-[#17181C] text-lg">{percent}%</span>
          </div>

          <div className="w-full h-2.5 bg-[#ECF0F7] rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-[#183058] rounded-full"
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
          className="min-h-[44px] inline-flex items-center text-xs font-bold text-[#183058] hover:underline"
        >
          Lihat Katalog Materi Belajar
        </Link>
      </div>
    </div>
  )
}
