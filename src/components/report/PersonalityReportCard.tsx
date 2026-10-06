import { useNavigate } from 'react-router'
import { FileText, Calendar, CheckCircle2, Clock, AlertCircle, ArrowUpRight } from 'lucide-react'
import type { PersonalityReport } from '@/types/report'
import { ReportDownloadButton } from './ReportDownloadButton'
import { formatReportDate, formatFileSize } from '@/utils/format'

interface PersonalityReportCardProps {
  report: PersonalityReport
  personalityType?: string
  assessmentName?: string
  className?: string
}

export function PersonalityReportCard({
  report,
  personalityType = 'Profil Belajar Siswa',
  assessmentName = 'Learning Personality Assessment',
  className = '',
}: PersonalityReportCardProps) {
  const navigate = useNavigate()

  const isReady = report.status === 'ready'
  const isGenerating = report.status === 'generating'
  const isFailed = report.status === 'failed'

  return (
    <div
      className={`surface-card p-5 sm:p-6 bg-white border border-border/80 rounded-2xl hover:border-border transition-all duration-150 flex flex-col justify-between gap-5 ${className}`}
    >
      <div className="space-y-3">
        {/* Top Badges & Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#6C5CE7] bg-[#EFEDFD] px-2.5 py-0.5 rounded-md">
              v{report.report_version}
            </span>
            <span className="text-[11px] text-[#676A78] font-medium">
              {report.file_size > 0 ? formatFileSize(report.file_size) : 'PDF'}
            </span>
          </div>

          <div>
            {isReady && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Siap Diunduh</span>
              </span>
            )}
            {isGenerating && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Clock className="w-3 h-3 animate-pulse" />
                <span>Diproses</span>
              </span>
            )}
            {isFailed && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C64848] bg-[#FDECEC] px-2 py-0.5 rounded-md border border-[#E96A6A]/30">
                <AlertCircle className="w-3 h-3" />
                <span>Gagal</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Personality Type */}
        <div className="space-y-1">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4F5FB] text-[#17181C] flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#17181C] leading-snug">
                Personality & Learning Profile Report
              </h3>
              <p className="text-xs font-semibold text-[#6C5CE7] mt-0.5">{personalityType}</p>
            </div>
          </div>
        </div>

        {/* Metadata info */}
        <div className="pt-2 border-t border-border/50 text-[11px] text-[#676A78] flex flex-wrap items-center gap-y-1 gap-x-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#676A78]" />
            <span>Digenerate: {formatReportDate(report.generated_at)}</span>
          </div>
          <span className="text-border">|</span>
          <span className="truncate max-w-[200px]">{assessmentName}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-2.5">
        {isReady ? (
          <>
            <button
              type="button"
              onClick={() => navigate(`/student/reports/${report.id}`)}
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-xs transition-colors min-h-[44px]"
            >
              <span>Lihat Laporan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <ReportDownloadButton report={report} variant="secondary" size="sm" />
          </>
        ) : (
          <div className="text-xs text-[#676A78]">
            {isGenerating ? 'Laporan sedang diproses di server...' : 'Laporan gagal dibuat.'}
          </div>
        )}
      </div>
    </div>
  )
}
