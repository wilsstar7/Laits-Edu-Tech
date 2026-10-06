import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { personalityReportService } from '@/services/personalityReportService'
import type { PersonalityReport, ReportStatus } from '@/types/report'
import { ReportGenerationDialog } from './ReportGenerationDialog'
import { useNavigate } from 'react-router'

interface ReportGenerationButtonProps {
  assessmentResultId: string
  onGenerated?: (report: PersonalityReport) => void
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function ReportGenerationButton({
  assessmentResultId,
  onGenerated,
  variant = 'primary',
  size = 'md',
  className = '',
  label = 'Generate PDF Report',
}: ReportGenerationButtonProps) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<ReportStatus | 'idle'>('idle')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [generatedReport, setGeneratedReport] = useState<PersonalityReport | null>(null)

  const handleGenerate = async () => {
    if (status === 'generating') return
    setStatus('generating')
    setErrorMessage(null)
    setIsDialogOpen(true)

    try {
      const response = await personalityReportService.generateReport(assessmentResultId)
      setStatus('ready')
      setGeneratedReport(response.report)
      if (onGenerated) {
        onGenerated(response.report)
      }
      toast.success(response.message || 'Laporan berhasil dibuat.')
    } catch (err: unknown) {
      console.error('Report generation error:', err)
      setStatus('failed')
      const msg = err instanceof Error ? err.message : 'Gagal membuat laporan.'
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-150 select-none min-h-[44px]'

  const variantStyles = {
    primary: 'bg-[#6C5CE7] hover:bg-[#5243D6] text-white shadow-sm shadow-[#6C5CE7]/20',
    secondary: 'bg-[#F4F5FB] hover:bg-[#EAEBF0] text-[#17181C]',
  }[variant]

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-4 py-2.5 text-xs',
    lg: 'px-6 py-3 text-sm',
  }[size]

  return (
    <>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={status === 'generating'}
        aria-busy={status === 'generating'}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className} ${
          status === 'generating' ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {status === 'generating' ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
        )}
        <span>{status === 'generating' ? 'Menyusun Laporan...' : label}</span>
      </button>

      <ReportGenerationDialog
        isOpen={isDialogOpen}
        status={status}
        errorMessage={errorMessage}
        onClose={() => setIsDialogOpen(false)}
        onViewReport={() => {
          setIsDialogOpen(false)
          if (generatedReport) {
            navigate(`/student/reports/${generatedReport.id}`)
          }
        }}
      />
    </>
  )
}
