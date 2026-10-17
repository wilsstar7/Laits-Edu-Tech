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
        // Sesuai aturan bertahap: jika memilih Paket 2 atau Paket 3, kerjakan Paket 1 dahulu
        // sambil menyimpan target paket pilihan siswa (targetPackageCode).
        const session = await assessmentSessionService.startNewSession(
          user.id,
          PRIMARY_ASSESSMENT_ID,
          selectedLevel,
          'PAKET_1_PERSONA_MODALITY',
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

  const handleStartPackage2Direct = async () => {
    if (!user) return
    if (!consentChecked) return

    setActionLoading(true)
    setErrorMsg(null)

    try {
      const session = await assessmentSessionService.startNewSession(
        user.id,
        PRIMARY_ASSESSMENT_ID,
        selectedLevel,
        'PAKET_2_PERSONA_POTENTIAL',
        selectedPackage.code === 'PAKET_3_PERSONA_MASTERY'
          ? 'PAKET_3_PERSONA_MASTERY'
          : 'PAKET_2_PERSONA_POTENTIAL'
      )
      navigate(`/student/assessment/${session.id}`)
    } catch (err) {
      console.error('Error starting Paket 2 session:', err)
      setErrorMsg('Gagal memulai sesi Paket 2. Silakan coba kembali.')
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
  const isPackage3 = selectedPackage.code === 'PAKET_3_PERSONA_MASTERY'
  const currentLevelConfig = LEVEL_CONFIG[selectedLevel]
  const currentTotalQuestions = currentLevelConfig.totalCount
  const currentEstMinutes = currentLevelConfig.estimatedMinutes
  const package2QuestionsCount =
    PACKAGE_LEVEL_CONFIG.PAKET_2_PERSONA_POTENTIAL[selectedLevel].totalQuestions

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#183058]" />
        <p className="text-xs text-[#676A78]">Menyiapkan katalog asesmen...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* 1. Page Header */}
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold text-[#183058] uppercase tracking-wider">
          Diagnostic Assessment & Pemetaan Belajar
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#17181C] tracking-tight">
          Pilih Paket Asesmen Pembelajaran
        </h1>
        <p className="text-xs sm:text-sm text-[#676A78] max-w-2xl leading-relaxed">
          Soal asesmen kini dipisahkan per paket secara bertahap. Jika memilih Paket 2 atau Paket 3, kamu akan mengerjakan Paket 1 terlebih dahulu hingga selesai sebelum melanjutkan ke paket berikutnya.
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
                className="px-6 py-3 rounded-2xl bg-[#183058] hover:bg-[#102342] text-white text-xs font-bold shadow-md shadow-[#183058]/20 transition-all flex items-center gap-2 min-h-[44px]"
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
                  Hasil Terakhir Tersedia (
                  {latestResult.package_code === 'PAKET_2_PERSONA_POTENTIAL'
                    ? 'Paket 2: Persona Potential'
                    : 'Paket 1: Persona Modality'}
                  )
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
                Lihat Hasil &amp; Opsi Paket Lanjutan
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. 3-Package Cards Catalog (Semua paket dapat dipilih, pengerjaan bertahap dari Paket 1) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-[#17181C]">
            Katalog 3 Paket Asesmen (Soal Dipisahkan Per Paket)
          </h2>
          <span className="text-xs text-[#676A78] font-medium">
            Pilih Paket 1, Paket 2, atau Paket 3 untuk memulai
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ASSESSMENT_PACKAGES.map((pkg, pkgIdx) => {
            const isSelected = selectedPackage.code === pkg.code
            const isPkg3 = pkg.code === 'PAKET_3_PERSONA_MASTERY'
            const questionCountBadge =
              pkg.code === 'PAKET_1_PERSONA_MODALITY'
                ? `${currentLevelConfig.totalCount} Soal (Tahap 1)`
                : pkg.code === 'PAKET_2_PERSONA_POTENTIAL'
                ? '60 Soal Terpisah (Tahap 2)'
                : 'Tahap 3 (Mulai dari Paket 1)'

            return (
              <div
                key={pkg.code}
                onClick={() => setSelectedPackage(pkg)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedPackage(pkg)
                  }
                }}
                className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#183058] shadow-md ring-2 ring-[#183058]/30'
                    : 'bg-white border-border/80 hover:border-[#183058]/40'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        isPkg3
                          ? 'bg-amber-100 text-amber-800 flex items-center gap-1'
                          : 'bg-[#183058]/10 text-[#183058]'
                      }`}
                    >
                      {isPkg3 && <Lock className="w-3 h-3" />}
                      <span>Paket {pkgIdx + 1} • {pkg.badgeText}</span>
                    </span>
                    <span className="text-[11px] text-[#676A78] font-bold">
                      {questionCountBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-[#17181C]">
                      {pkg.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#183058] mt-0.5">
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
                          <span className="text-[#183058] font-bold">•</span>
                          <span className="leading-tight">{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs font-bold text-[#183058]">
                    <span>
                      {isSelected
                        ? pkg.code === 'PAKET_1_PERSONA_MODALITY'
                          ? 'Paket 1 Terpilih'
                          : `${pkg.name} Terpilih (Mulai dari Paket 1)`
                        : 'Pilih Paket Ini'}
                    </span>
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        isSelected ? 'text-[#183058]' : 'text-transparent'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. Leveling Filter & Configuration (SD / SMP / SMA) */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl space-y-6">
        {(isPackage2 || isPackage3) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#E8ECF6]/70 border border-[#183058]/20 space-y-2">
            <div className="flex items-center gap-2 text-[#183058]">
              <Layers className="w-4 h-4 shrink-0" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Alur Pengerjaan Bertahap ({selectedPackage.name})
              </span>
            </div>
            <p className="text-xs text-[#1D1D24] leading-relaxed">
              Karena kamu memilih <strong>{selectedPackage.name}</strong>, soal dipisahkan per paket agar tidak digabung sekaligus. Kamu akan mengerjakan <strong>Soal Paket 1 (Persona Modality: {currentTotalQuestions} Soal)</strong> terlebih dahulu hingga selesai dan melihat hasilnya, kemudian tersedia pilihan langsung untuk melanjutkan ke <strong>Paket 2 (60 Soal: 20 MBTI + 40 Kecerdasan Majemuk)</strong> maupun <strong>Paket 3 (Persona Mastery)</strong>.
            </p>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#183058]">
            <GraduationCap className="w-5 h-5" />
            <h2 className="text-base font-extrabold text-[#17181C]">
              Pilih Jenjang Pendidikan Siswa
            </h2>
          </div>
          <p className="text-xs text-[#676A78]">
            Jumlah butir pertanyaan Paket 1 disesuaikan dengan tingkat perkembangan kognitif siswa, sedangkan Paket 2 terdiri dari 60 soal terpisah.
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
                    ? 'border-[#183058] bg-[#183058]/5 ring-1 ring-[#183058]'
                    : 'border-border/80 hover:border-[#183058]/30 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-bold text-sm ${
                      isChosen ? 'text-[#183058]' : 'text-[#17181C]'
                    }`}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[#F4F6FA] text-[#17181C]">
                    Paket 1: {cfg.totalCount} Soal
                  </span>
                </div>
                <p className="text-[11px] text-[#676A78] leading-relaxed">
                  {cfg.desc}
                </p>
              </button>
            )
          })}
        </div>

        {/* Breakdown Module Indicator Separated Per Package */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#F4F6FA] border border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0F1D33]">
                Tahap 1 - Soal Paket 1 (Persona Modality): {currentTotalQuestions} Soal
              </span>
              <span className="text-[11px] font-semibold text-[#183058] bg-[#E8ECF6] px-2.5 py-0.5 rounded-full">
                Dikerjakan Pertama
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[#183058] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#676A78]">Modul 1.1: VAK</p>
                  <p className="text-xs font-bold text-[#17181C]">
                    {currentLevelConfig.vakCount} Soal Sensori
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-[#183058] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#676A78]">Modul 1.2: Hemisfer</p>
                  <p className="text-xs font-bold text-[#17181C]">
                    {currentLevelConfig.hemCount} Soal Berpikir
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#183058] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#676A78]">Modul 1.3: Kebiasaan</p>
                  <p className="text-xs font-bold text-[#17181C]">
                    {currentLevelConfig.skbCount} Soal Lingkungan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {(isPackage2 || isPackage3) && (
            <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-[#183058]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0F1D33]">
                  Tahap 2 - Soal Paket 2 (Persona Potential): {package2QuestionsCount} Soal Terpisah
                </span>
                <span className="text-[11px] font-semibold text-[#183058] bg-white border border-[#183058]/20 px-2.5 py-0.5 rounded-full">
                  Dilanjutkan Setelah Paket 1 Selesai
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-[#183058] shrink-0" />
                  <div>
                    <p className="text-[11px] text-[#676A78]">Modul 2.1: MBTI Edukatif</p>
                    <p className="text-xs font-bold text-[#17181C]">20 Soal Kepribadian (Terpisah)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#183058] shrink-0" />
                  <div>
                    <p className="text-[11px] text-[#676A78]">Modul 2.2: Gardner MI</p>
                    <p className="text-xs font-bold text-[#17181C]">40 Soal 8 Kecerdasan (Terpisah)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Psychological safety & instructions */}
        <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border text-xs text-[#676A78] space-y-1.5 leading-relaxed">
          <p className="font-bold text-[#17181C]">Panduan Pengerjaan:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tidak ada jawaban benar atau salah, pilih yang paling nyaman dan menggambarkan dirimu apa adanya.</li>
            <li>Soal dipisahkan per paket sehingga kamu dapat fokus menyelesaikan Paket 1 terlebih dahulu, melihat hasilnya, lalu melanjutkan ke Paket 2 atau Paket 3.</li>
            <li>Jawaban otomatis tersimpan berkala, kamu dapat kembali ke nomor sebelumnya bila diperlukan.</li>
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
                className="mt-0.5 w-4 h-4 rounded border-[#BDC1D0] text-[#183058] focus:ring-[#183058]"
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
                ? isPackage2 || isPackage3
                  ? `Tahap 1: Siap mengerjakan ${currentTotalQuestions} butir soal Paket 1 terlebih dahulu (${currentLevelConfig.label} - estimasi ~${currentEstMinutes} menit), lalu lanjut ke ${selectedPackage.name}.`
                  : `Siap mengerjakan ${currentTotalQuestions} butir soal Paket 1 (${currentLevelConfig.label} - estimasi ~${currentEstMinutes} menit).`
                : 'Beri tanda centang pada pernyataan persetujuan untuk memulai.'}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              {latestResult && (isPackage2 || isPackage3) && (
                <button
                  type="button"
                  onClick={handleStartPackage2Direct}
                  disabled={!consentChecked || actionLoading}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[#183058] bg-[#E8ECF6]/60 hover:bg-[#E8ECF6] text-[#183058] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <span>Langsung Soal Paket 2 ({package2QuestionsCount} Soal)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleStart}
                disabled={!consentChecked || actionLoading}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#183058] hover:bg-[#102342] text-white text-xs font-bold shadow-md shadow-[#183058]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[46px]"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyiapkan Sesi...</span>
                  </>
                ) : isPackage2 || isPackage3 ? (
                  <>
                    <span>
                      Mulai dari Soal Paket 1 (Menuju {selectedPackage.name})
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : latestResult ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Ambil Ulang Paket 1 ({selectedLevel})</span>
                  </>
                ) : (
                  <>
                    <span>Mulai Paket 1 ({selectedLevel} - {currentTotalQuestions} Soal)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
