import { Link } from 'react-router'
import { Calendar, UserCheck } from 'lucide-react'
import { EmptyState } from './EmptyState'

export function UpcomingLessonCard() {
  return (
    <div className="surface-card p-6 flex flex-col justify-between bg-white border border-border">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base text-[#17181C]">Jadwal Belajar Mendatang</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EEF0F8] text-[#676A78]">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-sm hover:bg-[#5243D6] transition-colors min-h-[40px]"
            >
              <UserCheck className="w-4 h-4" />
              <span>Temukan Tutor</span>
            </Link>
          }
        />
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-[#676A78]">
        <span>Sistem penjadwalan bimbingan</span>
        <Link to="/student/schedule" className="font-semibold text-[#6C5CE7] hover:underline">
          Lihat Kalender Lengkap
        </Link>
      </div>
    </div>
  )
}
