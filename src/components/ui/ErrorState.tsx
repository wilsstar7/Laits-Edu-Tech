import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Gagal Memuat Data',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-2xl bg-white border border-[#E96A6A]/20 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FDECEC] text-[#E96A6A] flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#17181C] tracking-tight">{title}</h3>
      <p className="text-xs text-[#676A78] mt-1.5 max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2 min-h-[40px] px-4 font-semibold text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </Button>
        </div>
      )}
    </div>
  )
}
