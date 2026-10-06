import { AlertCircle, RotateCcw } from 'lucide-react'

interface ReportErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ReportErrorState({
  title = 'Tidak dapat memuat laporan',
  message,
  onRetry,
}: ReportErrorStateProps) {
  return (
    <div
      role="alert"
      className="p-6 rounded-2xl bg-white border border-[#E96A6A]/30 text-center max-w-md mx-auto space-y-3 shadow-sm"
    >
      <div className="w-10 h-10 rounded-xl bg-[#FDECEC] text-[#C64848] flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-[#17181C]">{title}</h3>
      <p className="text-xs text-[#676A78] leading-relaxed">{message}</p>
      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4F5FB] hover:bg-[#EAEBF0] text-[#17181C] text-xs font-bold transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}
    </div>
  )
}
