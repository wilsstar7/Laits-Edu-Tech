import { useNavigate } from 'react-router'
import { FileText, ArrowRight } from 'lucide-react'

interface ReportEmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function ReportEmptyState({
  title = 'Belum ada laporan profil',
  description = 'Selesaikan asesmen kepribadian belajar Anda untuk membuat dokumen laporan profil pertama Anda.',
  actionLabel = 'Mulai Asesmen',
  actionHref = '/student/assessment',
}: ReportEmptyStateProps) {
  const navigate = useNavigate()

  return (
    <div className="p-8 sm:p-12 rounded-2xl bg-white border border-border text-center max-w-lg mx-auto space-y-4 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto">
        <FileText className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-extrabold text-[#17181C]">{title}</h3>
        <p className="text-xs text-[#676A78] leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate(actionHref)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-sm transition-colors min-h-[44px]"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
