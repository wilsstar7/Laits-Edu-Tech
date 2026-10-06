import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Compass, Brain, CheckCircle2, ArrowRight, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { personalityService } from '@/services/personalityService'
import { personalityReportService } from '@/services/personalityReportService'
import type { AssessmentResult } from '@/types/assessment'
import type { PersonalityReport } from '@/types/report'

export function PersonalityCard() {
  const { user } = useAuth()
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [report, setReport] = useState<PersonalityReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const latest = await personalityService.getLatestResult(user.id)
        setResult(latest)
        if (latest) {
          const latestRep = await personalityReportService.getLatestReport(latest.id)
          setReport(latestRep)
        }
      } catch (err) {
        console.error('Failed to load personality result for dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="surface-card p-6 flex flex-col justify-between bg-white border border-border min-h-[220px] animate-pulse">
        <div className="h-4 w-32 bg-[#EAEBF0] rounded" />
        <div className="h-16 w-full bg-[#F4F5FB] rounded-xl my-4" />
        <div className="h-8 w-28 bg-[#EAEBF0] rounded-lg" />
      </div>
    )
  }

  const isCompleted = !!result
  const pType = result?.personality_type

  return (
    <div className="surface-card p-6 flex flex-col justify-between bg-white border border-border">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-[#17181C]">Profil Belajar Anda</h3>
          </div>
          {isCompleted ? (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Selesai</span>
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FDF4E2] text-[#B87A14]">
              Belum Dikerjakan
            </span>
          )}
        </div>

        <div className="py-5 space-y-3">
          {isCompleted ? (
            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-[#F4F5FB] border border-border space-y-1">
                <span className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wide">
                  Tipe Kepribadian Belajar:
                </span>
                <p className="text-sm font-extrabold text-[#17181C]">
                  {pType?.name || 'Tipe Profil Ditemukan'}
                </p>
                <p className="text-xs text-[#676A78] leading-relaxed line-clamp-2">
                  {pType?.learning_style}
                </p>
              </div>
              <p className="text-xs text-[#676A78]">
                Skor Keseluruhan: <span className="font-bold text-[#17181C]">{Math.round(result.overall_score)}%</span>
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F4F5FB] border border-border">
                <Brain className="w-5 h-5 text-[#6C5CE7] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#17181C]">
                    Temukan Gaya Belajar & Potensi Unik Anda
                  </p>
                  <p className="text-xs text-[#676A78] leading-relaxed">
                    Asesmen kepribadian membantu tutor menyesuaikan metode mengajar yang paling efektif untuk Anda.
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#676A78]">
                Status: Asesmen belum dikerjakan.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2.5">
        {isCompleted ? (
          <>
            <Link
              to="/student/personality"
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-sm hover:bg-[#5243D6] transition-colors min-h-[40px] gap-1.5"
            >
              <span>Lihat Hasil Profil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {report && report.status === 'ready' && (
              <Link
                to={`/student/reports/${report.id}`}
                className="inline-flex items-center justify-center w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-[#F4F5FB] text-[#17181C] hover:bg-[#EAEBF0] text-xs font-bold transition-colors min-h-[40px] gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#6C5CE7]" />
                <span>Laporan PDF</span>
              </Link>
            )}
          </>
        ) : (
          <Link
            to="/student/assessment"
            className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-sm hover:bg-[#5243D6] transition-colors min-h-[40px]"
          >
            Mulai Asesmen
          </Link>
        )}
      </div>
    </div>
  )
}
