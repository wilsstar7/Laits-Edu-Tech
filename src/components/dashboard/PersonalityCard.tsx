import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Compass, Brain, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { personalityService } from '@/services/personalityService'
import type { AssessmentResult } from '@/types/assessment'

export function PersonalityCard() {
  const { user } = useAuth()
  const [result, setResult] = useState<AssessmentResult | null>(null)
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
      <div className="surface-card p-4 sm:p-6 flex flex-col justify-between bg-white border border-border min-h-[220px] animate-pulse rounded-3xl">
        <div className="h-4 w-32 bg-[#EAEBF0] rounded" />
        <div className="h-16 w-full bg-[#F4F6FA] rounded-xl my-4" />
        <div className="h-8 w-28 bg-[#EAEBF0] rounded-lg" />
      </div>
    )
  }

  const isCompleted = !!result
  const isPotential =
    result?.package_code === 'PAKET_2_PERSONA_POTENTIAL' || Boolean(result?.potential_result)
  const potential = result?.potential_result
  const modality = result?.modality_result
  const pType = result?.personality_type

  return (
    <div className="surface-card p-4 sm:p-6 flex flex-col justify-between bg-white border border-border rounded-3xl space-y-4 min-w-0">
      <div>
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#E8ECF6] text-[#183058] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#183058] block">
                {isPotential ? 'Paket 2: Persona Potential' : 'Paket 1: Persona Modality'}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-[#17181C]">
                {isPotential ? 'Karakter & Potensi Siswa' : 'Profil Belajar Siswa'}
              </h3>
            </div>
          </div>
          {isCompleted ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesai ({result?.student_level || 'SMA'})</span>
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FDF4E2] text-[#B87A14] shrink-0">
              Belum Dikerjakan
            </span>
          )}
        </div>

        <div className="py-4 space-y-3">
          {isCompleted ? (
            <div className="space-y-2.5">
              {isPotential && potential ? (
                <>
                  <div className="p-4 rounded-2xl bg-[#F4F6FA] border border-border/80 space-y-1.5">
                    <span className="text-xs font-bold text-[#183058]">
                      Tipologi MBTI &amp; Gaya Kognitif:
                    </span>
                    <p className="text-base font-extrabold text-[#17181C]">
                      {potential.paket_2_modules.PP_MBTI_02.personality_code} · {potential.paket_2_modules.PP_MBTI_02.nickname}
                    </p>
                    <p className="text-xs text-[#676A78] leading-relaxed line-clamp-2">
                      {potential.paket_2_modules.PP_MBTI_02.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#F9FAFD] border border-border/60">
                      <span className="text-xs text-[#676A78] block">Top Gateway Kecerdasan:</span>
                      <span className="font-bold text-[#17181C] text-xs">
                        {potential.paket_2_modules.PP_MI_03.ranking[0]?.name || 'Visual-Spasial'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F9FAFD] border border-border/60">
                      <span className="text-xs text-[#676A78] block">Modalitas Sensori:</span>
                      <span className="font-bold text-[#17181C] text-xs">
                        {potential.paket_1_results.PM_VAK_01.title}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-[#F4F6FA] border border-border/80 space-y-1.5">
                    <span className="text-xs font-bold text-[#183058]">
                      Modalitas Belajar Sensori:
                    </span>
                    <p className="text-base font-extrabold text-[#17181C]">
                      {modality?.modules.PM_VAK_01.title || pType?.name || 'Profil Belajar Ditemukan'}
                    </p>
                    <p className="text-xs text-[#676A78] leading-relaxed line-clamp-2">
                      {modality?.modules.PM_VAK_01.summary || pType?.description}
                    </p>
                  </div>

                  {modality && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#F9FAFD] border border-border/60 flex sm:block items-center justify-between">
                        <span className="text-xs text-[#676A78] block">Visual:</span>
                        <span className="font-bold text-[#17181C] text-xs">
                          {modality.modules.PM_VAK_01.scores.V} Soal ({modality.modules.PM_VAK_01.percentages.V}%)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#F9FAFD] border border-border/60 flex sm:block items-center justify-between">
                        <span className="text-xs text-[#676A78] block">Auditori:</span>
                        <span className="font-bold text-[#17181C] text-xs">
                          {modality.modules.PM_VAK_01.scores.A} Soal ({modality.modules.PM_VAK_01.percentages.A}%)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#F9FAFD] border border-border/60 flex sm:block items-center justify-between">
                        <span className="text-xs text-[#676A78] block">Kinestetik:</span>
                        <span className="font-bold text-[#17181C] text-xs">
                          {modality.modules.PM_VAK_01.scores.K} Soal ({modality.modules.PM_VAK_01.percentages.K}%)
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F4F6FA] border border-border">
              <Brain className="w-5 h-5 text-[#183058] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#17181C]">
                  Petakan Karakter &amp; Gaya Belajarmu
                </p>
                <p className="text-xs text-[#676A78] leading-relaxed">
                  Asesmen diagnostik Persona Modality &amp; Potential memetakan cara belajar sensori VAK, dominasi kognitif MBTI, dan 8 kecerdasan majemuk.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2.5">
        {isCompleted ? (
          <Link
            to="/student/personality"
            className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] active:scale-[0.98] transition-colors min-h-[44px] gap-1.5"
          >
            <span>Buka Laporan Hasil Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        ) : (
          <Link
            to="/student/assessment"
            className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] active:scale-[0.98] transition-colors min-h-[44px] gap-1.5"
          >
            <span>Mulai Asesmen Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        )}
      </div>
    </div>
  )
}
