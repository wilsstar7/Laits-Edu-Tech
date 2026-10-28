import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  CheckCircle2,
  Lock,
  GraduationCap,
  ArrowRight,
  Loader2,
  AlertCircle,
  RotateCcw,
  Eye,
  Volume2,
  Activity,
  Check,
  Compass,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { assessmentSessionService } from '@/services/assessmentSessionService'
import { personalityService } from '@/services/personalityService'
import { assessmentAdminService } from '@/services/assessmentAdminService'
import {
  ASSESSMENT_PACKAGES,
  LEVEL_CONFIG as FALLBACK_LEVEL_CONFIG,
  type StudentLevel,
  type AssessmentPackage,
} from '@/data/personaModalityData'
import { PACKAGE_LEVEL_CONFIG } from '@/data/personaPotentialData'
import type { AssessmentSession, AssessmentResult } from '@/types/assessment'
import { formatLongDate } from '@/utils/format'
import { PRIMARY_ASSESSMENT_ID } from '@/services/assessmentService'
import { Button } from '@/components/ui/button'

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
  const [configVersion, setConfigVersion] = useState(0)

  // Listen to live level config changes from Super Admin
  useEffect(() => {
    const onUpdated = () => setConfigVersion((v) => v + 1)
    window.addEventListener('laits_assessment_updated', onUpdated)
    return () => window.removeEventListener('laits_assessment_updated', onUpdated)
  }, [])

  // Dynamic Level Config from admin service (falls back to static LEVEL_CONFIG)
  const dynamicLevelConfig = useMemo(() => {
    try {
      const cfg = assessmentAdminService.getLevelConfig()
      if (cfg && cfg.SD && cfg.SMP && cfg.SMA) {
        return cfg
      }
    } catch {
      // Fallback
    }
    return FALLBACK_LEVEL_CONFIG
  }, [configVersion])

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
  const currentLevelConfig = dynamicLevelConfig[selectedLevel] || FALLBACK_LEVEL_CONFIG[selectedLevel]
  const currentTotalQuestions = currentLevelConfig.totalCount
  const currentEstMinutes = currentLevelConfig.estimatedMinutes
  const package2QuestionsCount =
    PACKAGE_LEVEL_CONFIG.PAKET_2_PERSONA_POTENTIAL[selectedLevel].totalQuestions

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#183058]" />
        <p className="text-xs text-muted-foreground font-medium">Menyiapkan katalog asesmen...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 pb-20">
      {/* =========================================================================
          1. PAGE HEADER: EDITORIAL SCOPE & INTENT
          ========================================================================= */}
      <div className="space-y-2 border-b border-border/60 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#183058]">
          <Compass className="w-3.5 h-3.5" />
          <span>Asesmen Diagnostik &amp; Pemetaan Belajar</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight">
          Pilih Paket Asesmen Pembelajaran
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Pemetaan modalitas sensori belajar siswa dilakukan secara bertahap. Siswa memulai dari <strong>Paket 1 (Persona Modality)</strong> untuk menemukan gaya belajar dominan sebelum melangkah ke eksplorasi karakter dan karier.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          2. BANNER: ACTIVE IN-PROGRESS SESSION OR VERIFIED PAST RESULT
          ========================================================================= */}
      {activeSession ? (
        <div className="border border-amber-300 bg-amber-50/50 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                Sesi Belum Selesai Terdeteksi
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Kamu memiliki asesmen berjalan yang tersimpan otomatis
              </h2>
              <p className="text-xs text-slate-600">
                Lanjutkan pengerjaan mulai dari nomor terakhir yang telah tersimpan (
                {ASSESSMENT_PACKAGES.find((p) => p.code === activeSession.package_code)?.name ??
                  'Persona Modality'}
                , Jenjang {activeSession.student_level || 'SMA'}).
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAbandon}
                disabled={actionLoading}
                className="text-xs font-medium text-amber-900 border-amber-300 hover:bg-amber-100/60"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Mulai Ulang
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleStart}
                disabled={actionLoading}
                className="text-xs font-semibold bg-[#183058] hover:bg-[#102342] text-white shadow-xs"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <>
                    <span>Lanjutkan Sesi</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : latestResult ? (
        <div className="border border-emerald-200/80 bg-emerald-50/40 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Hasil Terakhir Tersedia (
                  {latestResult.package_code === 'PAKET_2_PERSONA_POTENTIAL'
                    ? 'Paket 2: Persona Potential'
                    : 'Paket 1: Persona Modality'}
                  )
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {latestResult.modality_result?.modules.PM_VAK_01.title ||
                    latestResult.personality_type?.name ||
                    'Profil Pembelajar Terverifikasi'}
                </h2>
                <p className="text-xs text-slate-600">
                  Diselesaikan pada {formatLongDate(new Date(latestResult.completed_at))} (Jenjang {latestResult.student_level || 'SMA'})
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => navigate('/student/personality')}
              className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 shadow-xs"
            >
              Lihat Hasil &amp; Opsi Paket Lanjutan
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* =========================================================================
          3. KATALOG 3 PAKET ASESMEN (EDITORIAL TIERS / DIAGNOSTIC JOURNEY)
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Katalog Paket Asesmen Pembelajaran
            </h2>
            <p className="text-xs text-muted-foreground">
              Tiga tahapan bertahap untuk memetakan gaya belajar, kepribadian kognitif, dan arah studi masa depan.
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Tahap 1 Aktif · Tahap 2 &amp; 3 Segera Hadir
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ASSESSMENT_PACKAGES.map((pkg, pkgIdx) => {
            const isSelected = selectedPackage.code === pkg.code
            const isLocked = pkg.status === 'upcoming'
            const questionBadge =
              pkg.code === 'PAKET_1_PERSONA_MODALITY'
                ? `${currentTotalQuestions} Soal (Aktif)`
                : isLocked
                ? 'Segera Hadir'
                : '60 Soal Terpisah'

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
                className={`rounded-2xl p-5 sm:p-6 border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#183058] ring-1 ring-[#183058] shadow-xs'
                    : isLocked
                    ? 'bg-slate-50/60 border-border/80 hover:border-slate-300'
                    : 'bg-white border-border/80 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide inline-flex items-center gap-1 ${
                        isLocked
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                          : 'bg-slate-100 text-slate-800 font-mono'
                      }`}
                    >
                      {isLocked && <Lock className="w-2.5 h-2.5" />}
                      <span>Tahap {pkgIdx + 1}</span>
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {questionBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      {pkg.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="pt-3 border-t border-border/60 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider block">
                      Luaran &amp; Rekomendasi:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {pkg.deliverables.map((del, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span className="leading-snug">{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-[#183058]' : 'text-slate-500'
                    }`}
                  >
                    {isSelected
                      ? isLocked
                        ? `${pkg.name} (Terkunci)`
                        : 'Paket Terpilih'
                      : isLocked
                      ? 'Terkunci'
                      : 'Pilih Paket'}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#183058] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* =========================================================================
          4. LEVELING & SENSORY PREVIEW CARD
          ========================================================================= */}
      <div className="border border-border/80 bg-white rounded-2xl p-6 sm:p-7 space-y-6">
        {/* Notice for Package 2 / 3 selection */}
        {(isPackage2 || isPackage3) && (
          <div className="p-4 rounded-xl bg-slate-50 border border-border/80 space-y-1.5">
            <div className="flex items-center gap-2 text-[#183058]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Alur Pengerjaan Bertahap ({selectedPackage.name})
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Karena kamu memilih <strong>{selectedPackage.name}</strong>, pengerjaan dimulai dari <strong>Paket 1 (Persona Modality: {currentTotalQuestions} Soal)</strong> terlebih dahulu. Setelah selesai dan melihat profil gaya belajarmu, akses untuk melanjutkan ke {selectedPackage.name} akan terbuka secara terpisah.
            </p>
          </div>
        )}

        {/* Section: Select Education Level */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#183058]">
              <GraduationCap className="w-4 h-4" />
              <h2 className="text-base font-bold text-slate-900">
                Pilih Jenjang Pendidikan Siswa
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Jumlah butir pertanyaan Paket 1 disesuaikan dengan kurikulum tahapan kognitif siswa (ditetapkan oleh kurikulum akademik).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['SD', 'SMP', 'SMA'] as StudentLevel[]).map((lvl) => {
              const isChosen = selectedLevel === lvl
              const cfg = dynamicLevelConfig[lvl] || FALLBACK_LEVEL_CONFIG[lvl]

              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isChosen
                      ? 'border-[#183058] bg-slate-50/50 ring-1 ring-[#183058]'
                      : 'border-border/80 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isChosen ? 'text-[#183058]' : 'text-slate-900'
                      }`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {cfg.totalCount} Soal
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {cfg.desc}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    Estimasi waktu: ~{cfg.estimatedMinutes} menit
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3 Sensory Modality Pillars Preview */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Tahap 1: Pemetaan 3 Modalitas Sensori (VAK)
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              Total {currentTotalQuestions} Butir Soal Terkalibrasi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-blue-200/60 bg-blue-50/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-900">Jalur Visual [V]</span>
                <Eye className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <p className="text-xs font-bold text-slate-900">Penglihatan &amp; Spasial</p>
              <p className="text-[11px] text-slate-600 leading-normal">
                Memahami konsep melalui warna, bagan, grafik, catatan terstruktur, dan ilustrasi visual.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200/60 bg-amber-50/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-900">Jalur Auditori [A]</span>
                <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <p className="text-xs font-bold text-slate-900">Pendengaran &amp; Diskusi</p>
              <p className="text-[11px] text-slate-600 leading-normal">
                Menyerap materi melalui penjelasan guru, dialog interaktif, membaca nyaring, dan analogi suara.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200/60 bg-emerald-50/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-900">Jalur Kinestetik [K]</span>
                <Activity className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <p className="text-xs font-bold text-slate-900">Praktik &amp; Motorik</p>
              <p className="text-[11px] text-slate-600 leading-normal">
                Menguasai materi lewat percobaan langsung, simulasi nyata, latihan fisik, dan peragaan aktif.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions & Guidelines */}
        <div className="p-4 rounded-xl bg-slate-50 border border-border/80 text-xs text-slate-600 space-y-1 leading-relaxed">
          <p className="font-semibold text-slate-900">Panduan Pengisian Asesmen:</p>
          <ul className="space-y-1 text-[11px] text-slate-600">
            <li className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>Tidak ada jawaban benar atau salah; pilihlah yang paling menggambarkan kebiasaan belajarmu sehari-hari.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>Jawaban tersimpan otomatis setiap nomor; kamu dapat meninjau dan mengubah pilihan sebelum konfirmasi selesai.</span>
            </li>
          </ul>
        </div>

        {/* Consent Checkbox */}
        {!activeSession && (
          <div className="pt-1">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#183058] focus:ring-[#183058]"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                Saya memahami bahwa asesmen ini digunakan untuk pengenalan gaya belajar personal, bukan diagnosis psikologis klinis.
              </span>
            </label>
          </div>
        )}

        {/* Action Button Footer */}
        {!activeSession && (
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              {selectedPackage.status === 'upcoming'
                ? `${selectedPackage.name} saat ini ditutup untuk penyesuaian materi. Silakan pilih Paket 1 untuk mengerjakan asesmen.`
                : consentChecked
                ? isPackage2 || isPackage3
                  ? `Tahap 1: Mengerjakan ${currentTotalQuestions} butir soal Paket 1 (${currentLevelConfig.label} - estimasi ~${currentEstMinutes} menit), lalu lanjut ke ${selectedPackage.name}.`
                  : `Siap mengerjakan ${currentTotalQuestions} butir soal Paket 1 (${currentLevelConfig.label} - estimasi ~${currentEstMinutes} menit).`
                : 'Beri tanda centang pada pernyataan persetujuan di atas untuk memulai.'}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              {latestResult && (isPackage2 || isPackage3) && selectedPackage.status !== 'upcoming' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStartPackage2Direct}
                  disabled={!consentChecked || actionLoading}
                  className="text-xs font-semibold text-[#183058] border-[#183058]"
                >
                  Langsung Soal Paket 2 ({package2QuestionsCount} Soal)
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}

              <Button
                type="submit"
                onClick={handleStart}
                disabled={!consentChecked || actionLoading || selectedPackage.status === 'upcoming'}
                className="bg-[#183058] hover:bg-[#102342] text-white text-xs font-semibold px-6 shadow-xs"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Menyiapkan Sesi...</span>
                  </>
                ) : selectedPackage.status === 'upcoming' ? (
                  <>
                    <Lock className="w-3.5 h-3.5 mr-1.5" />
                    <span>Paket Belum Dibuka</span>
                  </>
                ) : isPackage2 || isPackage3 ? (
                  <>
                    <span>Mulai dari Soal Paket 1</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                ) : latestResult ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    <span>Ambil Ulang Paket 1 ({selectedLevel})</span>
                  </>
                ) : (
                  <>
                    <span>Mulai Paket 1 ({selectedLevel} - {currentTotalQuestions} Soal)</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
