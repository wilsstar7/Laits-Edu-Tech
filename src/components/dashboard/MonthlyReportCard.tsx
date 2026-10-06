import { Link } from 'react-router'
import { FileText, Clock } from 'lucide-react'

export function MonthlyReportCard() {
  return (
    <div className="surface-card p-6 flex flex-col justify-between bg-white border border-border">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-[#17181C]">Laporan Perkembangan</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EEF0F8] text-[#676A78]">
            Status: Belum ada laporan
          </span>
        </div>

        <div className="py-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#EEF0F8] text-[#676A78] flex items-center justify-center mx-auto mb-2">
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
          to="/student/reports"
          className="inline-block text-xs font-bold text-[#6C5CE7] hover:underline"
        >
          Buka Arsip Laporan Belajar
        </Link>
      </div>
    </div>
  )
}
