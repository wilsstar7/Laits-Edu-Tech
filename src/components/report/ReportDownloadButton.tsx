import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { personalityReportService } from '@/services/personalityReportService'
import type { PersonalityReport } from '@/types/report'

interface ReportDownloadButtonProps {
  report: PersonalityReport
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md'
  className?: string
  showText?: boolean
}

export function ReportDownloadButton({
  report,
  variant = 'secondary',
  size = 'md',
  className = '',
  showText = true,
}: ReportDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      await personalityReportService.downloadReport(report)
      toast.success('Laporan berhasil diunduh.')
    } catch (err: unknown) {
      console.error('Download error:', err)
      const msg = err instanceof Error ? err.message : 'Gagal mengunduh file laporan.'
      toast.error(msg)
    } finally {
      setDownloading(false)
    }
  }

  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-150 select-none min-h-[44px]'

  const variantStyles = {
    primary: 'bg-[#6C5CE7] hover:bg-[#5243D6] text-white shadow-sm shadow-[#6C5CE7]/20',
    secondary: 'bg-[#F4F5FB] hover:bg-[#EAEBF0] text-[#17181C]',
    outline: 'border border-border/80 hover:bg-[#F4F5FB] text-[#17181C] bg-white',
  }[variant]

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs',
  }[size]

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading || report.status !== 'ready'}
      aria-label={`Unduh laporan PDF ${report.file_name}`}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className} ${
        downloading || report.status !== 'ready' ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" aria-hidden="true" />
      ) : (
        <Download className="w-4 h-4 shrink-0 text-current" aria-hidden="true" />
      )}
      {showText && <span>{downloading ? 'Mengunduh...' : 'Unduh PDF'}</span>}
    </button>
  )
}
