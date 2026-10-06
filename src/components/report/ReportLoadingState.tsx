import { Loader2 } from 'lucide-react'

interface ReportLoadingStateProps {
  message?: string
}

export function ReportLoadingState({ message = 'Memuat data laporan...' }: ReportLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3" role="status">
      <Loader2 className="w-7 h-7 animate-spin text-[#6C5CE7]" aria-hidden="true" />
      <p className="text-xs font-medium text-[#676A78]">{message}</p>
      <span className="sr-only">Sedang memuat</span>
    </div>
  )
}
