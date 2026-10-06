import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, ExternalLink, ShieldCheck, Calendar, FileText } from 'lucide-react'
import { personalityReportService } from '@/services/personalityReportService'
import type { PersonalityReport } from '@/types/report'
import { ReportDownloadButton } from './ReportDownloadButton'
import { ReportLoadingState } from './ReportLoadingState'
import { ReportErrorState } from './ReportErrorState'
import { formatReportDate, formatFileSize } from '@/utils/format'

interface ReportPreviewProps {
  reportId: string
}

export function ReportPreview({ reportId }: ReportPreviewProps) {
  const navigate = useNavigate()
  const [report, setReport] = useState<PersonalityReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [fetchTrigger, setFetchTrigger] = useState(0)

  useEffect(() => {
    let isMounted = true
    let activeObjectUrl: string | null = null

    async function fetchReport() {
      try {
        const data = await personalityReportService.getReport(reportId)
        if (!isMounted) return

        if (!data) {
          setErrorMsg('Dokumen laporan tidak ditemukan atau Anda tidak memiliki akses.')
          return
        }

        setReport(data)
        setErrorMsg(null)

        // Generate in-memory PDF blob for zero-storage preview
        try {
          const { blob } = await personalityReportService.getReportBlob(reportId)
          if (isMounted) {
            activeObjectUrl = URL.createObjectURL(blob)
            setBlobUrl(activeObjectUrl)
          }
        } catch (blobErr) {
          console.warn('In-memory preview generation note:', blobErr)
        }
      } catch (err: unknown) {
        console.error('Failed to load report:', err)
        if (isMounted) {
          setErrorMsg('Gagal memuat dokumen laporan. Silakan coba kembali.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchReport()

    return () => {
      isMounted = false
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl)
      }
    }
  }, [reportId, fetchTrigger])

  const handleRetry = () => {
    setLoading(true)
    setErrorMsg(null)
    setFetchTrigger((c) => c + 1)
  }

  if (loading) {
    return <ReportLoadingState message="Menyiapkan dokumen pratinjau..." />
  }

  if (errorMsg || !report) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/student/reports')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#676A78] hover:text-[#17181C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat Laporan</span>
        </button>
        <ReportErrorState message={errorMsg || 'Laporan tidak ditemukan'} onRetry={handleRetry} />
      </div>
    )
  }

  const pdfUrl = blobUrl || report.signedUrl

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-border/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/student/reports')}
              className="p-1.5 rounded-lg hover:bg-[#F4F5FB] text-[#676A78] hover:text-[#17181C] transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold text-[#17181C]">
              Pratinjau Dokumen Laporan
            </h1>
            <span className="text-[11px] font-bold text-[#6C5CE7] bg-[#EFEDFD] px-2.5 py-0.5 rounded-md">
              v{report.report_version}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#676A78] pl-7">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatReportDate(report.generated_at)}</span>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>{formatFileSize(report.file_size)}</span>
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-[#F4F5FB] hover:bg-[#EAEBF0] text-[#17181C] text-xs font-bold transition-colors min-h-[44px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Tab Baru</span>
            </a>
          )}
          <ReportDownloadButton report={report} variant="primary" size="md" />
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div className="w-full bg-[#17181C]/5 rounded-2xl border border-border/80 overflow-hidden shadow-xs">
        {pdfUrl ? (
          <div className="relative w-full h-[75vh] min-h-[550px] bg-[#525659]">
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              title="Pratinjau Laporan Profil Belajar"
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="p-12 text-center space-y-3 bg-white">
            <p className="text-xs text-[#676A78]">
              Tautan pratinjau kedaluwarsa atau tidak dapat diakses. Silakan unduh file secara langsung.
            </p>
            <ReportDownloadButton report={report} variant="primary" size="md" />
          </div>
        )}
      </div>

      {/* Psychological Safety Footer Notice */}
      <div className="p-4 rounded-xl bg-white border border-border/80 text-[11px] text-[#676A78] leading-relaxed flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#45B97C] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#17181C]">Dokumen Pembelajaran Resmi: </span>
          Hasil asesmen ini ditujukan untuk membantu pengenalan diri dan pengembangan strategi belajar. Dokumen ini bukan diagnosis medis atau psikologis dan tidak menggantikan evaluasi profesional.
        </div>
      </div>
    </div>
  )
}
