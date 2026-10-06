import { useState, useEffect } from 'react'
import { Calendar, Award, Clock, Loader2, Sparkles } from 'lucide-react'
import { personalityReportService } from '@/services/personalityReportService'
import { monthlyReportService, type MonthlyLearningReport } from '@/services/monthlyReportService'
import type { PersonalityReport } from '@/types/report'
import { PersonalityReportCard } from './PersonalityReportCard'
import { ReportLoadingState } from './ReportLoadingState'
import { ReportEmptyState } from './ReportEmptyState'
import { ReportErrorState } from './ReportErrorState'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export function ReportHistory() {
  const [personalityReports, setPersonalityReports] = useState<PersonalityReport[]>([])
  const [monthlyReports, setMonthlyReports] = useState<MonthlyLearningReport[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingMonthly, setGeneratingMonthly] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'personality' | 'monthly'>('all')
  const [fetchTrigger, setFetchTrigger] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function fetchAllReports() {
      try {
        const [pData, mData] = await Promise.all([
          personalityReportService.getReports().catch(() => []),
          monthlyReportService.getReports().catch(() => []),
        ])
        if (isMounted) {
          setPersonalityReports(pData)
          setMonthlyReports(mData)
          setErrorMsg(null)
        }
      } catch (err: unknown) {
        logger.error('Failed to load reports history:', err)
        if (isMounted) {
          setErrorMsg('Gagal memuat riwayat dokumen laporan. Silakan coba kembali.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAllReports()

    return () => {
      isMounted = false
    }
  }, [fetchTrigger])

  const handleRetry = () => {
    setLoading(true)
    setErrorMsg(null)
    setFetchTrigger((c) => c + 1)
  }

  const handleGenerateMonthly = async () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    setGeneratingMonthly(true)
    try {
      await monthlyReportService.generateMonthlyReport(year, month)
      toast.success(`Laporan belajar periode ${month}/${year} berhasil dibuat.`)
      setFetchTrigger((c) => c + 1)
    } catch {
      toast.error('Gagal membuat laporan bulanan. Pastikan sesi bimbingan telah tercatat.')
    } finally {
      setGeneratingMonthly(false)
    }
  }

  if (loading) {
    return <ReportLoadingState message="Memuat dokumen arsip laporan belajar..." />
  }

  if (errorMsg) {
    return <ReportErrorState message={errorMsg} onRetry={handleRetry} />
  }

  const totalReports = personalityReports.length + monthlyReports.length

  if (totalReports === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateMonthly}
            disabled={generatingMonthly}
            className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold flex items-center gap-2"
          >
            {generatingMonthly ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Generate Laporan Belajar Bulan Ini</span>
          </Button>
        </div>
        <ReportEmptyState
          title="Belum Ada Laporan Tersimpan"
          description="Laporan kepribadian dan rekap evaluasi bulanan akan otomatis tercatat di sini setelah Anda menyelesaikan asesmen atau mengikuti sesi belajar."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header filter & generate action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#17181C] text-white shadow-xs'
                : 'text-[#676A78] hover:bg-[#EAEBF0] hover:text-[#17181C]'
            }`}
          >
            Semua Laporan ({totalReports})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('personality')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] cursor-pointer ${
              activeTab === 'personality'
                ? 'bg-[#17181C] text-white shadow-xs'
                : 'text-[#676A78] hover:bg-[#EAEBF0] hover:text-[#17181C]'
            }`}
          >
            Personality ({personalityReports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors min-h-[36px] cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-[#17181C] text-white shadow-xs'
                : 'text-[#676A78] hover:bg-[#EAEBF0] hover:text-[#17181C]'
            }`}
          >
            Evaluasi Bulanan ({monthlyReports.length})
          </button>
        </div>

        <Button
          onClick={handleGenerateMonthly}
          disabled={generatingMonthly}
          variant="outline"
          size="sm"
          className="rounded-xl text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          {generatingMonthly ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6C5CE7]" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
          )}
          <span>Perbarui Laporan Bulan Ini</span>
        </Button>
      </div>

      {/* Personality Reports Section */}
      {(activeTab === 'all' || activeTab === 'personality') && personalityReports.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#6C5CE7]" />
            <h3 className="text-sm font-extrabold text-[#17181C]">Laporan Karakter & Kepribadian Belajar</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {personalityReports.map((report) => (
              <PersonalityReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}

      {/* Monthly Reports Section */}
      {(activeTab === 'all' || activeTab === 'monthly') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#22864C]" />
            <h3 className="text-sm font-extrabold text-[#17181C]">Laporan Rekapitulasi Kemajuan Bulanan</h3>
          </div>

          {monthlyReports.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-border text-center space-y-2">
              <p className="text-xs text-[#676A78]">
                Belum ada rekapitulasi laporan bulanan. Tekan tombol &quot;Perbarui Laporan Bulan Ini&quot; di atas untuk merangkum riwayat belajar Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {monthlyReports.map((m) => (
                <div
                  key={m.id}
                  className="surface-card p-5 sm:p-6 bg-white border border-border shadow-xs hover:border-[#6C5CE7]/40 transition-all rounded-2xl space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EBFBF2] text-[#22864C]">
                        Periode {m.periodMonth}/{m.periodYear}
                      </span>
                      <h4 className="text-base font-extrabold text-[#17181C] mt-2">
                        Rekap Aktivitas Belajar
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-[#6C5CE7] bg-[#EFEDFD] px-2.5 py-1 rounded-xl">
                      {m.avgProgressPercentage}% Progres
                    </span>
                  </div>

                  <p className="text-xs text-[#676A78] leading-relaxed line-clamp-3">
                    {m.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#676A78]" />
                      <span className="text-muted-foreground">{m.totalHours} Jam Belajar</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Award className="w-3.5 h-3.5 text-[#676A78]" />
                      <span className="text-muted-foreground">{m.totalSessions} Sesi Selesai</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
