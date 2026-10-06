import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { FileText, CheckCircle2, ArrowRight } from 'lucide-react'
import { personalityReportService } from '@/services/personalityReportService'
import type { PersonalityReport } from '@/types/report'
import { ReportGenerationButton } from './ReportGenerationButton'
import { ReportDownloadButton } from './ReportDownloadButton'
import { formatReportDate } from '@/utils/format'

interface ReportStatusCardProps {
  assessmentResultId: string
  className?: string
}

export function ReportStatusCard({ assessmentResultId, className = '' }: ReportStatusCardProps) {
  const navigate = useNavigate()
  const [report, setReport] = useState<PersonalityReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadReport() {
      try {
        const existing = await personalityReportService.getLatestReport(assessmentResultId)
        if (isMounted) {
          setReport(existing)
        }
      } catch (err) {
        console.warn('Failed to load existing report status:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadReport()
    return () => {
      isMounted = false
    }
  }, [assessmentResultId])

  if (loading) {
    return (
      <div className={`surface-card p-6 bg-white border border-border/80 rounded-2xl animate-pulse space-y-3 ${className}`}>
        <div className="h-4 w-40 bg-[#EAEBF0] rounded" />
        <div className="h-3 w-64 bg-[#F4F5FB] rounded" />
      </div>
    )
  }

  const isReady = report?.status === 'ready'

  return (
    <div
      className={`surface-card p-6 sm:p-7 bg-white border border-border/80 rounded-2xl shadow-xs transition-all duration-150 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-[#17181C]">
              {isReady ? 'Dokumen Laporan Profil Belajar' : 'Laporan Resmi Belajar (PDF)'}
            </h3>
            {isReady && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Tersedia</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#676A78] leading-relaxed">
            {isReady
              ? `Laporan resmi Anda telah digenerate pada ${formatReportDate(
                  report.generated_at
                )} (Versi ${report.report_version}). Anda dapat melihat preview atau mengunduh file PDF.`
              : 'Dapatkan dokumen resmi analisis gaya belajar, peta dimensi kognitif, dan rekomendasi tutor privat dalam format PDF 9 halaman yang tersimpan aman di akun Anda.'}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
          {isReady && report ? (
            <>
              <button
                type="button"
                onClick={() => navigate(`/student/reports/${report.id}`)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-sm transition-colors min-h-[44px]"
              >
                <span>Lihat Laporan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <ReportDownloadButton report={report} variant="secondary" size="md" />
            </>
          ) : (
            <ReportGenerationButton
              assessmentResultId={assessmentResultId}
              onGenerated={(newReport) => setReport(newReport)}
              variant="primary"
              label="Generate PDF Report"
            />
          )}
        </div>
      </div>
    </div>
  )
}
