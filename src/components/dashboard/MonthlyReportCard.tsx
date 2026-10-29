import { Link } from 'react-router'
import { FileText, Clock } from 'lucide-react'

export function MonthlyReportCard() {
  return (
    <div className="surface-card p-4 sm:p-6 flex flex-col justify-between bg-white border border-border min-w-0">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#E8ECF6] text-[#183058] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-[#17181C]">Laporan Perkembangan</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#ECF0F7] text-[#676A78] shrink-0">
            Belum ada laporan
          </span>
        </div>

        <div className="py-5 sm:py-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#ECF0F7] text-[#676A78] flex items-center justify-center mx-auto mb-2">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#17181C]">Belum Ada Laporan Bulanan</p>
          <p className="text-xs text-[#676A78] max-w-sm mx-auto leading-relaxed">
            Laporan perkembangan akan tersedia setelah Anda mulai mengikuti sesi pembelajaran bersama tutor dan menyelesaikan evaluasi berkala.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-border/60">
        <Link
          to="/student/learning?tab=reports"
          className="min-h-[44px] inline-flex items-center text-xs font-bold text-[#183058] hover:underline"
        >
          Buka Arsip Laporan Belajar
        </Link>
      </div>
    </div>
  )
}
