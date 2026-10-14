import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Clock,
  CheckCircle2,
  Lock,
  Layers,
  GraduationCap,
  ArrowRight,
  Loader2,
  BookOpen,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { assessmentSessionService } from '@/services/assessmentSessionService'
import { personalityService } from '@/services/personalityService'
import {
  ASSESSMENT_PACKAGES,
  LEVEL_CONFIG,
  type StudentLevel,
  type AssessmentPackage,
} from '@/data/personaModalityData'
import { PACKAGE_LEVEL_CONFIG } from '@/data/personaPotentialData'
import type { AssessmentSession, AssessmentResult } from '@/types/assessment'
import { formatLongDate } from '@/utils/format'
import { PRIMARY_ASSESSMENT_ID } from '@/services/assessmentService'

export function AssessmentIntroPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<AssessmentPackage>(
    ASSESSMENT_PACKAGES[0]!
  )
  const [selectedLevel, setSelectedLevel] = useState<StudentLevel>('SMA')
  const [activeSession, setActiveSession] = useState<AssessmentSession | null>(null)
  const [latestResult, setLatestResult] = useState<AssessmentResult | null>(null)
  const [consentChecked, setConsentChecked] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      setLoading(true)
      setErrorMsg(null)
      try {
        const [session, result] = await Promise.all([
          assessmentSessionService.getActiveSession(user.id, PRIMARY_ASSESSMENT_ID),
          personalityService.getLatestResult(user.id),
        ])

        setActiveSession(session)
        setLatestResult(result)
        if (session?.student_level) {
          setSelectedLevel(session.student_level)
        }
        if (session?.package_code) {
          const pkg = ASSESSMENT_PACKAGES.find((p) => p.code === session.package_code)
          if (pkg) setSelectedPackage(pkg)
        }
      } catch (err) {
        console.error('Failed to load assessment session state:', err)
        setErrorMsg('Gagal memuat status asesmen. Silakan muat ulang halaman.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleStart = async () => {
    if (!user) return
    if (!consentChecked && !activeSession) return

    setActionLoading(true)
    setErrorMsg(null)

    try {
      if (activeSession) {
        navigate(`/student/assessment/${activeSession.id}`)
      } else {
        const session = await assessmentSessionService.startNewSession(
          user.id,
          PRIMARY_ASSESSMENT_ID,
          selectedLevel,
          selectedPackage.code
        )
        navigate(`/student/assessment/${session.id}`)
      }
    } catch (err) {
      console.error('Error starting session:', err)
      setErrorMsg('Gagal memulai sesi asesmen. Silakan coba kembali.')
      setActionLoading(false)
    }
  }

  const handleAbandon = async () => {
    if (!activeSession) return
    const ok = window.confirm(
      'Progres sesi ini akan dibatalkan dan tidak bisa dilanjutkan lagi. Lanjutkan?'
    )
    if (!ok) return

    setActionLoading(true)
    setErrorMsg(null)
    try {
      await assessmentSessionService.abandonSession(activeSession.id)
      setActiveSession(null)
      setConsentChecked(false)
    } catch (err) {
      console.error('Error abandoning session:', err)
      setErrorMsg('Gagal membatalkan sesi. Silakan coba kembali.')
    } finally {
      setActionLoading(false)
    }
  }

  const isPackage2 = selectedPackage.code === 'PAKET_2_PERSONA_POTENTIAL'
  const currentLevelConfig = LEVEL_CONFIG[selectedLevel]
  const currentTotalQuestions = isPackage2
    ? PACKAGE_LEVEL_CONFIG.PAKET_2_PERSONA_POTENTIAL[selectedLevel].totalQuestions
    : currentLevelConfig.totalCount
  const currentEstMinutes = isPackage2
    ? PACKAGE_LEVEL_CONFIG.PAKET_2_PERSONA_POTENTIAL[selectedLevel].estimatedMinutes
    : currentLevelConfig.estimatedMinutes

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
        <p className="text-xs text-[#676A78]">Menyiapkan katalog asesmen...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* 1. Page Header */}
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider">
          Diagnostic Assessment & Pemetaan Belajar
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#17181C] tracking-tight">
          Pilih Paket Asesmen Pembelajaran
        </h1>
        <p className="text-xs sm:text-sm text-[#676A78] max-w-2xl leading-relaxed">
          Temukan metode belajar terbaik, dominasi kognitif, dan gaya pengajaran tutor yang paling tepat melalui instrumen diagnostik psikologi pendidikan.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Banner: Active Session or Completed Result */}
      {activeSession ? (
        <div className="surface-card bg-[#FDF4E2] border border-[#F2B84B]/60 p-6 rounded-3xl space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#92580E] uppercase tracking-wide">
                Sesi Berjalan Ditemukan
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-[#17181C]">
                Kamu memiliki progres tes yang belum selesai
              </h2>
              <p className="text-xs text-[#676A78]">
                Lanjutkan pengerjaan mulai dari nomor terakhir yang telah tersimpan (
                {ASSESSMENT_PACKAGES.find((p) => p.code === activeSession.package_code)?.name ??
                  'Persona Modality'}
                , Jenjang {activeSession.student_level || 'SMA'}).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleAbandon}
                disabled={actionLoading}
                className="px-5 py-3 rounded-2xl border border-[#92580E]/40 text-[#92580E] hover:bg-[#92580E]/10 text-xs font-bold transition-colors flex items-center gap-2 min-h-[44px] disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Batalkan &amp; Pilih Paket Lain</span>
              </button>

              <button
                type="button"
                onClick={handleStart}
                disabled={actionLoading}
                className="px-6 py-3 rounded-2xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/20 transition-all flex items-center gap-2 min-h-[44px]"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Lanjutkan Pengerjaan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : latestResult ? (
        <div className="surface-card bg-emerald-50/70 border border-emerald-200 p-6 rounded-3xl space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Hasil Terakhir Tersedia
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-emerald-950">
                  {latestResult.modality_result?.modules.PM_VAK_01.title ||
                    latestResult.personality_type?.name ||
                    'Profil Pembelajar Terverifikasi'}
                </h2>
                <p className="text-xs text-emerald-700">
                  Diselesaikan pada {formatLongDate(new Date(latestResult.completed_at))} (Jenjang {latestResult.student_level || 'SMA'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/student/personality')}
                className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm min-h-[42px]"
              >
                Lihat Hasil Profil
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. 3-Package Cards Catalog (Sesuai Soal.Md) */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-[#17181C]">
          Katalog 3 Paket Asesmen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ASSESSMENT_PACKAGES.map((pkg) => {
            const isActive = pkg.status === 'active'
            const isSelected = selectedPackage.code === pkg.code

            return (
              <div
                key={pkg.code}
                onClick={() => isActive && setSelectedPackage(pkg)}
                className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isActive
                    ? isSelected
                      ? 'bg-white border-[#6C5CE7] shadow-md ring-2 ring-[#6C5CE7]/30 cursor-pointer'
                      : 'bg-white border-border/80 hover:border-[#6C5CE7]/40 cursor-pointer'
                    : 'bg-[#F9FAFD] border-border/60 opacity-80 cursor-not-allowed'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        isActive
                          ? 'bg-[#6C5CE7]/10 text-[#6C5CE7]'
                          : 'bg-zinc-200 text-zinc-600 flex items-center gap-1'
                      }`}
                    >
                      {!isActive && <Lock className="w-3 h-3" />}
                      <span>{pkg.badgeText}</span>
                    </span>
                    <span className="text-[11px] text-[#676A78] font-medium">
                      Target: {pkg.targetAge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-[#17181C]">
                      {pkg.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#6C5CE7] mt-0.5">
                      {pkg.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#676A78] leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="pt-2 border-t border-border/60 space-y-1.5">
                    <p className="text-[11px] font-bold text-[#17181C]">Deliverables:</p>
                    <ul className="space-y-1 text-xs text-[#333542]">
                      {pkg.deliverables.map((del, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-1.5">
                          <span className="text-[#6C5CE7] font-bold">•</span>
                          <span className="leading-tight">{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-border/60">
                  {isActive ? (
                    <div className="flex items-center justify-between text-xs font-bold text-[#6C5CE7]">
                      <span>{isSelected ? 'Paket Terpilih' : 'Pilih Paket Ini'}</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isSelected ? 'text-[#6C5CE7]' : 'text-transparent'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-[#888B98]">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Terkunci (Segera Hadir)</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Leveling Filter & Configuration (SD / SMP / SMA) */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#6C5CE7]">
            <GraduationCap className="w-5 h-5" />
            <h2 className="text-base font-extrabold text-[#17181C]">
              Pilih Jenjang Pendidikan Siswa
            </h2>
          </div>
          <p className="text-xs text-[#676A78]">
            Jumlah butir pertanyaan disesuaikan otomatis dengan tingkat perkembangan kognitif siswa.
          </p>
        </div>

        {/* 3 Level Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['SD', 'SMP', 'SMA'] as StudentLevel[]).map((lvl) => {
            const isChosen = selectedLevel === lvl
            const cfg = LEVEL_CONFIG[lvl]

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`p-4 rounded-2xl border text-left transition-all min-h-[52px] ${
                  isChosen
                    ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 ring-1 ring-[#6C5CE7]'
                    : 'border-border/80 hover:border-[#6C5CE7]/30 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-bold text-sm ${
                      isChosen ? 'text-[#6C5CE7]' : 'text-[#17181C]'
                    }`}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[#F4F5FB] text-[#17181C]">
                    {isPackage2
                      ? PACKAGE_LEVEL_CONFIG.PAKET_2_PERSONA_POTENTIAL[lvl].totalQuestions
                      : cfg.totalCount}{' '}
                    Soal
                  </span>
                </div>
                <p className="text-[11px] text-[#676A78] leading-relaxed">
                  {cfg.desc}
                </p>
              </button>
            )
          })}
        </div>

        {/* Breakdown Module Indicator for Selected Level & Package */}
        <div
          className={`grid gap-3 p-4 rounded-2xl bg-[#F4F5FB] border border-border/60 ${
            isPackage2 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-1 sm:grid-cols-3'
          }`}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-[#6C5CE7] shrink-0" />
            <div>
              <p className="text-[11px] text-[#676A78]">Modul 1: VAK</p>
              <p className="text-xs font-bold text-[#17181C]">
                {currentLevelConfig.vakCount} Soal Sensori
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#6C5CE7] shrink-0" />
            <div>
              <p className="text-[11px] text-[#676A78]">Modul 2: Hemisfer</p>
              <p className="text-xs font-bold text-[#17181C]">
                {currentLevelConfig.hemCount} Soal Berpikir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#6C5CE7] shrink-0" />
            <div>
              <p className="text-[11px] text-[#676A78]">Modul 3: Kebiasaan</p>
              <p className="text-xs font-bold text-[#17181C]">
                {currentLevelConfig.skbCount} Soal Lingkungan
              </p>
            </div>
          </div>

          {isPackage2 && (
            <>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-[#6C5CE7] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#676A78]">Modul 4: MBTI</p>
                  <p className="text-xs font-bold text-[#17181C]">20 Soal Kepribadian</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#6C5CE7] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#676A78]">Modul 5: Gardner MI</p>
                  <p className="text-xs font-bold text-[#17181C]">40 Soal 8 Kecerdasan</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Psychological safety & instructions */}
        <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border text-xs text-[#676A78] space-y-1.5 leading-relaxed">
          <p className="font-bold text-[#17181C]">Panduan Pengerjaan:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tidak ada jawaban benar atau salah, pilih yang paling nyaman dan menggambarkan dirimu apa adanya.</li>
            <li>Jawaban otomatis tersimpan berkala, kamu dapat kembali ke nomor sebelumnya bila diperlukan.</li>
            <li>Hasil asesmen digunakan untuk memetakan metode belajar personal dan bimbingan privat terarah.</li>
          </ul>
        </div>

        {/* Consent Checkbox */}
        {!activeSession && (
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#BDC1D0] text-[#6C5CE7] focus:ring-[#6C5CE7]"
              />
              <span className="text-xs text-[#17181C] font-medium leading-relaxed">
                Saya memahami bahwa asesmen ini digunakan untuk pengenalan gaya belajar personal, bukan diagnosis psikologis klinis.
              </span>
            </label>
          </div>
        )}

        {/* Action Button */}
        {!activeSession && (
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60">
            <p className="text-[11px] text-[#676A78]">
              {consentChecked
                ? `Siap mengerjakan ${currentTotalQuestions} butir soal (${currentLevelConfig.label} - estimasi ~${currentEstMinutes} menit).`
                : 'Beri tanda centang pada pernyataan persetujuan untuk memulai.'}
            </p>

            <button
              type="button"
              onClick={handleStart}
              disabled={!consentChecked || actionLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[46px]"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyiapkan Sesi...</span>
                </>
              ) : latestResult ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Ambil Ulang ({selectedLevel} - {selectedPackage.name})</span>
                </>
              ) : (
                <>
                  <span>Mulai Asesmen ({selectedLevel} - {selectedPackage.name})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
