import { Link } from 'react-router'
import { Calendar, UserCheck } from 'lucide-react'
import { EmptyState } from './EmptyState'

export function UpcomingLessonCard() {
  return (
    <div className="surface-card p-4 sm:p-6 flex flex-col justify-between bg-white border border-border min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#E8ECF6] text-[#183058] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-[#17181C]">Jadwal Belajar Mendatang</h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#ECF0F7] text-[#676A78] shrink-0">
          0 Sesi
        </span>
      </div>

      <div className="py-4">
        <EmptyState
          icon={Calendar}
          title="Belum ada jadwal belajar."
          description="Anda belum memiliki sesi bimbingan les privat aktif minggu ini. Cari dan pilih tutor sesuai mata pelajaran pilihan Anda."
          action={
            <Link
              to="/student/tutors"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] active:scale-[0.98] transition-colors min-h-[44px] w-full sm:w-auto"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Temukan Tutor</span>
            </Link>
          }
        />
      </div>

      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-[#676A78]">
        <span>Sistem penjadwalan bimbingan</span>
        <Link
          to="/student/schedule"
          className="min-h-[44px] inline-flex items-center font-semibold text-[#183058] hover:underline"
        >
          Lihat Kalender Lengkap
        </Link>
      </div>
    </div>
  )
}
