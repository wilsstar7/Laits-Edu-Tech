import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  Volume2,
  Activity,
  Brain,
  Home,
  Hourglass,
  Search,
  RotateCcw,
  Loader2,
  BookOpen,
  Sun,
  Moon,
  Sunset,
  VolumeX,
  Coffee,
  Zap,
  Timer,
  Layers,
  Award,
  Users,
  Lightbulb,
  Music,
  Trees,
  Calculator,
  ArrowRight,
  Lock,
  GraduationCap,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { personalityService } from '@/services/personalityService'
import { assessmentSessionService } from '@/services/assessmentSessionService'
import { PRIMARY_ASSESSMENT_ID } from '@/services/assessmentService'
import type { AssessmentResult, AssessmentPackageCode } from '@/types/assessment'
import { formatLongDate } from '@/utils/format'
import { LEVEL_CONFIG, ASSESSMENT_PACKAGES } from '@/data/personaModalityData'
import { PACKAGE_LEVEL_CONFIG } from '@/data/personaPotentialData'

export function PersonalityResultPage() {
  const { resultId } = useParams<{ resultId?: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [startingNextPkg, setStartingNextPkg] = useState(false)
  const [showPkg3Info, setShowPkg3Info] = useState(false)

  useEffect(() => {
    async function loadResult() {
      if (!user) return
      setLoading(true)
      setErrorMsg(null)

      try {
        let data: AssessmentResult | null = null
        if (resultId) {
          data = await personalityService.getResultById(resultId)
        } else {
          data = await personalityService.getLatestResult(user.id)
        }

        // Jika hasil yang dimuat adalah Paket 1, pastikan memori Paket 2 & Paket 3 lama dihapus
        if (
          data &&
          data.package_code !== 'PAKET_2_PERSONA_POTENTIAL' &&
          !data.potential_result
        ) {
          personalityService.resetSubsequentPackages(user.id)
        }

        setResult(data)
      } catch (err) {
        console.error('Failed to load assessment result:', err)
        setErrorMsg('Gagal memuat hasil profil belajar. Silakan coba kembali.')
      } finally {
        setLoading(false)
      }
    }

    loadResult()
  }, [user, resultId])

  const handleContinueToPackage2 = async (
    targetPkg: AssessmentPackageCode = 'PAKET_2_PERSONA_POTENTIAL'
  ) => {
    if (!user || !result || startingNextPkg) return
    setStartingNextPkg(true)
    setErrorMsg(null)
    try {
      const level = result.student_level || 'SMA'
      const session = await assessmentSessionService.startNewSession(
        user.id,
        PRIMARY_ASSESSMENT_ID,
        level,
        'PAKET_2_PERSONA_POTENTIAL',
        targetPkg
      )
      navigate(`/student/assessment/${session.id}`)
    } catch (err) {
      console.error('Failed to start Paket 2 session:', err)
      setErrorMsg('Gagal memulai sesi Paket 2. Silakan coba kembali.')
      setStartingNextPkg(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#183058]" />
        <p className="text-sm text-slate-500 font-medium">Menyiapkan laporan diagnostik asesmen...</p>
      </div>
    )
  }

  if (errorMsg || !result) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#0F1D33]">
            {errorMsg || 'Hasil asesmen belum tersedia'}
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Kamu belum menyelesaikan asesmen diagnostik atau data sesi belum tersimpan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/student/assessment')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#183058] hover:bg-[#102342] text-white text-sm font-semibold transition-colors"
        >
          <span>Mulai Asesmen Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const isPotential =
    result.package_code === 'PAKET_2_PERSONA_POTENTIAL' || Boolean(result.potential_result)
  const potential = result.potential_result
  const p1Modules =
    isPotential && potential
      ? potential.paket_1_results
      : result.modality_result?.modules

  const studentLevel = result.student_level || 'SMA'
  const levelInfo = LEVEL_CONFIG[studentLevel]
  const pkg2TotalQuestions =
    PACKAGE_LEVEL_CONFIG.PAKET_2_PERSONA_POTENTIAL[studentLevel].totalQuestions

  const totalQuestionsDone = isPotential
    ? pkg2TotalQuestions
    : levelInfo.totalCount

  const choseNextTarget =
    !isPotential &&
    (result.target_package_code === 'PAKET_2_PERSONA_POTENTIAL' ||
      result.target_package_code === 'PAKET_3_PERSONA_MASTERY')

  // Data Paket 1 (VAK, Otak, Kebiasaan)
  const vak = p1Modules?.PM_VAK_01 || {
    total_questions: 30,
    scores: { V: 14, A: 9, K: 7 },
    percentages: { V: 46.67, A: 30.0, K: 23.33 },
    dominance_type: 'SINGLE_DOMINANCE' as const,
    primary_modality: 'VISUAL' as const,
    secondary_modality: null,
    title: result.personality_type?.name || 'Dominan Visual',
    summary:
      result.personality_type?.description ||
      'Siswa sangat mengandalkan representasi grafis, diagram, kode warna, teks tertulis, dan demonstrasi visual.',
    study_recommendations: result.personality_type?.recommended_study_method || [
      'Gunakan peta pikiran (mind map) dan stabilo aneka warna untuk menandai kata kunci penting.',
      'Sertakan diagram alur konsep atau infografis ketika mempelajari bab baru.',
      'Jaga kebersihan dan keteraturan meja belajar agar mata tidak mudah terdistraksi.',
    ],
    tutor_sop:
      result.personality_type?.recommended_tutor_style?.[0] ||
      'Tutor wajib menyajikan tulisan rumus rapi, diagram alur konsep, dan peta pikiran di kertas/papan catatan.',
  }

  const hem = p1Modules?.PM_HEM_02 || {
    total_questions: 20,
    scores: { LEFT_BRAIN: 9, RIGHT_BRAIN: 11 },
    percentages: { LEFT_BRAIN: 45.0, RIGHT_BRAIN: 55.0 },
    dominance_category: 'WHOLE_BRAIN' as const,
    tutor_sop_key: 'SOP_HEM_WHOLE_BRAIN' as const,
    title: 'Seimbang / Whole-Brain (Adaptif & Fleksibel)',
    summary:
      'Siswa mampu memanfaatkan belahan otak analitis dan kreatif secara seimbang tergantung konteks materi pelajaran.',
    tutor_sop:
      'Guru privat dapat menggunakan metode kombinasi. Buka sesi dengan cerita/visual (untuk otak kanan), lalu masuk ke pengerjaan soal presisi langkah demi langkah (untuk otak kiri). Anak tipe ini adalah pembelajar yang paling adaptif.',
  }

  const habits = p1Modules?.PM_SKB_03 || {
    total_questions: 15,
    clusters: {
      chronobiology: {
        scores: { A: 1, B: 3, C: 1 },
        result: 'AFTERNOON_PERSON',
        title: 'Afternoon Person',
        description: 'Fokus dan stamina belajar paling stabil di sore hari setelah jeda istirahat sekolah.',
        tutor_sop_key: 'SOP_BIO_B',
        tutor_sop:
          'Performa otak stabil di sore hari sepulang sekolah. Sangat cocok untuk sesi bimbingan belajar reguler harian.',
      },
      environment: {
        scores: { A: 4, B: 1, C: 0 },
        result: 'FORMAL_AND_SENSITIVE',
        title: 'Formal & Sensitive',
        description: 'Sensitif terhadap kebisingan dan membutuhkan ruang yang hening serta meja tertata rapi.',
        tutor_sop_key: 'SOP_ENV_A',
        tutor_sop:
          'Guru les wajib menjaga keheningan, dilarang mengajak ngobrol di luar konteks pelajaran saat anak sedang fokus, dan pastikan meja bersih.',
      },
      attention_span: {
        scores: { A: 1, B: 3, C: 1 },
        result: 'TIPE_POMODORO',
        title: 'Tipe Pomodoro',
        description: 'Optimal dengan ritme belajar 30-45 menit yang diselingi istirahat sejenak.',
        tutor_sop_key: 'SOP_FOCUS_B',
        tutor_sop:
          'Terapkan jeda 5 menit setiap 30 menit. Izinkan anak ke toilet atau sekadar minum air putih agar stamina kognitif terjaga.',
      },
    },
  }

  // Data Paket 2 (MBTI & Multiple Intelligences)
  const mbti = potential?.paket_2_modules.PP_MBTI_02
  const mi = potential?.paket_2_modules.PP_MI_03

  const miIconMap: Record<string, React.ReactNode> = {
    MI_LINGUISTIK: <BookOpen className="w-4 h-4 text-sky-700" />,
    MI_LOGIS: <Calculator className="w-4 h-4 text-emerald-700" />,
    MI_SPASIAL: <Eye className="w-4 h-4 text-purple-700" />,
    MI_KINESTETIK: <Activity className="w-4 h-4 text-amber-700" />,
    MI_MUSIKAL: <Music className="w-4 h-4 text-pink-700" />,
    MI_INTERPERSONAL: <Users className="w-4 h-4 text-blue-700" />,
    MI_INTRAPERSONAL: <Brain className="w-4 h-4 text-indigo-700" />,
    MI_NATURALIS: <Trees className="w-4 h-4 text-teal-700" />,
  }

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-10 px-4 sm:px-6 space-y-8 font-sans">
      {/* 1. Masthead & Executive Diagnostic Summary */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Document Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <GraduationCap className="w-4 h-4 text-[#183058]" />
              <span>Laporan Diagnostik Asesmen</span>
              <span>/</span>
              <span className="text-[#183058]">
                {isPotential ? 'Paket 2 · Persona Potential' : 'Paket 1 · Persona Modality'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1D33] tracking-tight">
              {isPotential
                ? 'Profil Karakter, Tipologi Kognitif & Peta Bakat Siswa'
                : 'Profil Karakter Belajar Siswa'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Diselesaikan pada {formatLongDate(new Date(result.completed_at))}</span>
              <span>·</span>
              <span>Jenjang {levelInfo.label}</span>
              <span>·</span>
              <span>{totalQuestionsDone} Soal Terverifikasi</span>
            </p>
          </div>

          <div className="self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isPotential ? 'Paket 2 Terverifikasi' : 'Paket 1 Terverifikasi'}</span>
            </span>
          </div>
        </div>

        {/* Primary Diagnostic Finding / Executive Summary */}
        <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <span className="text-xs font-semibold text-slate-500">
                {isPotential ? 'Kesimpulan Tipologi Utama' : 'Kesimpulan Diagnostik Utama'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F1D33] tracking-tight">
                {isPotential && mbti
                  ? `${mbti.personality_code}: ${mbti.nickname} (${mbti.title})`
                  : `${vak.title} / ${hem.title}`}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isPotential && mbti ? mbti.description : vak.summary}
              </p>
            </div>

            <div className="shrink-0 pt-1 md:text-right">
              <span className="text-xs text-slate-500 block">Status Progres:</span>
              <span className="inline-block mt-1 px-2.5 py-1 rounded text-xs font-medium bg-slate-200/70 text-slate-800">
                {isPotential ? 'Paket 1 & Paket 2 Selesai' : 'Paket 1 Selesai'}
              </span>
            </div>
          </div>

          {/* 3 Core Diagnostic Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/60">
            <div className="p-3.5 rounded-lg bg-white border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 block">
                Pilar A · Sensori Belajar (VAK)
              </span>
              <div className="text-sm font-bold text-[#0F1D33] mt-1">{vak.title}</div>
              <span className="text-xs text-slate-500 block mt-0.5 tabular-nums">
                {vak.percentages.V}% dominan visual
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 block">
                Pilar B · Dominasi Hemisfer
              </span>
              <div className="text-sm font-bold text-[#0F1D33] mt-1">{hem.title}</div>
              <span className="text-xs text-slate-500 block mt-0.5 tabular-nums">
                {hem.percentages.RIGHT_BRAIN}% Kanan / {hem.percentages.LEFT_BRAIN}% Kiri
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500 block">
                Pilar C · Ritme &amp; Fokus
              </span>
              <div className="text-sm font-bold text-[#0F1D33] mt-1">
                {habits.clusters.chronobiology.title}
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                {habits.clusters.attention_span.title}
              </span>
            </div>
          </div>
        </div>

        {/* Continuation Banner (if selected next target earlier) */}
        {choseNextTarget && (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#183058]">
                Tahap 1 Selesai · Siap Melanjutkan ke Tahap Berikutnya
              </span>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Kamu telah menyelesaikan Paket 1 ({levelInfo.totalCount} Soal). Kamu dapat langsung melanjutkan pengerjaan ke Soal Paket 2 ({pkg2TotalQuestions} Soal terpisah: 20 MBTI + 40 Kecerdasan Majemuk) atau memilih opsi Paket 3.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleContinueToPackage2(result.target_package_code)}
              disabled={startingNextPkg}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-[#183058] hover:bg-[#102342] text-white text-xs font-semibold flex items-center gap-2 min-h-[42px] transition-colors disabled:opacity-50"
            >
              {startingNextPkg ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Lanjutkan ke Soal Paket 2</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          BAGIAN KHUSUS PAKET 2: TIPOLOGI MBTI & MULTIPLE INTELLIGENCES (jika ada)
          ========================================================================= */}
      {isPotential && mbti && mi && (
        <>
          {/* MBTI Section */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#183058]">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-semibold text-slate-500">
                    Paket 2 (Bagian A) · Tipologi Kepribadian
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#0F1D33] tracking-tight">
                  4 Dimensi Kognitif: {mbti.personality_code}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  Memetakan cara otak anak mengelola energi kognitif, menyerap informasi, merumuskan keputusan, dan merespons jadwal belajar.
                </p>
              </div>

              <div className="shrink-0 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 block">Kode MBTI:</span>
                <span className="text-lg font-extrabold text-[#183058] tracking-wider">
                  {mbti.personality_code}
                </span>
              </div>
            </div>

            {/* 4 Dimension Comparison Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dimensi 1: EI */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F1D33]">Arah Energi Kognitif</span>
                  <span className="font-semibold text-[#183058] tabular-nums">
                    Dominan {mbti.dimensions.EI.dominant} ({mbti.dimensions.EI.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                  <span className={mbti.dimensions.EI.dominant === 'E' ? 'font-bold text-[#0F1D33]' : ''}>
                    Extraversion (E): {mbti.dimensions.EI.E}/5
                  </span>
                  <span className={mbti.dimensions.EI.dominant === 'I' ? 'font-bold text-[#0F1D33]' : ''}>
                    Introversion (I): {mbti.dimensions.EI.I}/5
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-sm overflow-hidden flex">
                  <div
                    className="h-full bg-[#183058]"
                    style={{ width: `${(mbti.dimensions.EI.E / 5) * 100}%` }}
                  />
                  <div
                    className="h-full bg-slate-400"
                    style={{ width: `${(mbti.dimensions.EI.I / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {mbti.dimensions.EI.dominant === 'E'
                    ? 'Interactive Processor: Belajar optimal melalui verbalisasi aktif, tanya jawab, dan diskusi materi.'
                    : 'Internal Processor: Belajar melalui kontemplasi dan membutuhkan waktu hening untuk mencerna materi.'}
                </p>
              </div>

              {/* Dimensi 2: SN */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F1D33]">Persepsi Informasi</span>
                  <span className="font-semibold text-[#183058] tabular-nums">
                    Dominan {mbti.dimensions.SN.dominant} ({mbti.dimensions.SN.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                  <span className={mbti.dimensions.SN.dominant === 'S' ? 'font-bold text-[#0F1D33]' : ''}>
                    Sensing (S): {mbti.dimensions.SN.S}/5
                  </span>
                  <span className={mbti.dimensions.SN.dominant === 'N' ? 'font-bold text-[#0F1D33]' : ''}>
                    Intuition (N): {mbti.dimensions.SN.N}/5
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-sm overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${(mbti.dimensions.SN.S / 5) * 100}%` }}
                  />
                  <div
                    className="h-full bg-teal-500"
                    style={{ width: `${(mbti.dimensions.SN.N / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {mbti.dimensions.SN.dominant === 'S'
                    ? 'Concrete & Practical: Menyerap fakta nyata, urutan bertahap, dan penerapan praktis di lapangan.'
                    : 'Abstract & Conceptual: Menyukai pola konseptual besar, analogi, dan visi makna jangka panjang.'}
                </p>
              </div>

              {/* Dimensi 3: TF */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F1D33]">Kriteria Pengambilan Keputusan</span>
                  <span className="font-semibold text-[#183058] tabular-nums">
                    Dominan {mbti.dimensions.TF.dominant} ({mbti.dimensions.TF.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                  <span className={mbti.dimensions.TF.dominant === 'T' ? 'font-bold text-[#0F1D33]' : ''}>
                    Thinking (T): {mbti.dimensions.TF.T}/5
                  </span>
                  <span className={mbti.dimensions.TF.dominant === 'F' ? 'font-bold text-[#0F1D33]' : ''}>
                    Feeling (F): {mbti.dimensions.TF.F}/5
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-sm overflow-hidden flex">
                  <div
                    className="h-full bg-sky-600"
                    style={{ width: `${(mbti.dimensions.TF.T / 5) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${(mbti.dimensions.TF.F / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {mbti.dimensions.TF.dominant === 'T'
                    ? 'Objective Logic: Menuntut konsistensi logis dan bukti rasional dalam pemecahan soal.'
                    : 'Subjective Values: Mengutamakan rasa aman, empati, kehangatan relasi, dan keterikatan emosional.'}
                </p>
              </div>

              {/* Dimensi 4: JP */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F1D33]">Orientasi Struktur &amp; Jadwal</span>
                  <span className="font-semibold text-[#183058] tabular-nums">
                    Dominan {mbti.dimensions.JP.dominant} ({mbti.dimensions.JP.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                  <span className={mbti.dimensions.JP.dominant === 'J' ? 'font-bold text-[#0F1D33]' : ''}>
                    Judging (J): {mbti.dimensions.JP.J}/5
                  </span>
                  <span className={mbti.dimensions.JP.dominant === 'P' ? 'font-bold text-[#0F1D33]' : ''}>
                    Perceiving (P): {mbti.dimensions.JP.P}/5
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-sm overflow-hidden flex">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${(mbti.dimensions.JP.J / 5) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${(mbti.dimensions.JP.P / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {mbti.dimensions.JP.dominant === 'J'
                    ? 'Structured & Planned: Belajar nyaman dengan jadwal yang terprediksi, target teratur, dan kepastian tenggat.'
                    : 'Flexible & Adaptable: Menikmati fleksibilitas, eksplorasi spontan, dan variasi metode belajar.'}
                </p>
              </div>
            </div>

            {/* Tutor SOP for MBTI */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#183058]" />
                <h3 className="text-sm font-bold text-[#0F1D33]">
                  SOP Intervensi Guru Privat (Mencegah Bentrok Emosional)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mbti.tutor_sop_details.map((sopItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#183058]">
                        Huruf {sopItem.letter} ({sopItem.dimension})
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        Prosedur Wajib
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#0F1D33]">{sopItem.rule}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{sopItem.instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Multiple Intelligences Section */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#183058]">
                <Lightbulb className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-500">
                  Paket 2 (Bagian B) · Peta 8 Kecerdasan Majemuk
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#0F1D33] tracking-tight">
                8 Kecerdasan Majemuk Howard Gardner
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                Setiap anak memiliki pintu gerbang kecerdasan yang unik. Tiga kecerdasan teratas menjadi jalur paling efektif untuk membantu anak menaklukkan materi yang sulit.
              </p>
            </div>

            {/* Top 3 Gateways */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Top 3 Pintu Gerbang Kecerdasan Utama:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mi.ranking.slice(0, 3).map((item, rankIdx) => (
                  <div
                    key={item.category}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-5 h-5 rounded-full bg-[#183058] text-white font-bold text-[11px] flex items-center justify-center">
                          {rankIdx + 1}
                        </span>
                        <span className="text-xs font-semibold text-[#183058] tabular-nums">
                          {item.raw}/20 Poin ({item.percentage}%)
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#0F1D33] flex items-center gap-1.5">
                          {miIconMap[item.category]}
                          <span>{item.name}</span>
                        </h4>
                        <span className="text-xs text-slate-500 block">
                          {item.alias}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 text-xs space-y-1">
                      <span className="text-[11px] font-semibold text-[#183058] block">
                        Strategi Menembus Materi:
                      </span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{item.gateway_strategy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 8 Intelligences Ranking */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Distribusi Peringkat 8 Kecerdasan Majemuk:
              </span>
              <div className="space-y-2.5">
                {mi.ranking.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {miIconMap[item.category]}
                        <span className="font-semibold text-[#0F1D33]">{item.name}</span>
                        <span className="text-slate-500">({item.alias})</span>
                      </div>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {item.raw}/20 ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-[#183058]"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* =========================================================================
          HASIL ASESMEN PAKET 1: PERSONA MODALITY (RINCIAN DIAGNOSTIK)
          ========================================================================= */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
        <div className="pb-4 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500 block">
            Rincian Diagnostik Paket 1 ({levelInfo.totalCount} Soal)
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F1D33] tracking-tight mt-1">
            Analisis Komprehensif Gaya &amp; Karakter Belajar
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Bedah hasil diagnostik modalitas sensori (VAK), belahan otak dominan, dan 3 klaster kebiasaan belajar harian siswa.
          </p>
        </div>

        {/* Bagian A Paket 1: Sensory Modality (VAK) */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-[#183058]">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-500">
                  Bagian A · Modalitas Belajar Sensori (VAK)
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F1D33] tracking-tight mt-0.5">
                Distribusi Panca Indra Belajar
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Total 30 Soal Pertanyaan Sensori
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            Mengukur saluran sensori primer yang paling cepat menerima, menyandi, dan mengonstruksi pemahaman materi pelajaran baru ke dalam memori jangka panjang.
          </p>

          {/* 3 Modality Refined Data Rows */}
          <div className="space-y-3 pt-1">
            {/* Visual */}
            <div className={`p-4 rounded-xl border transition-all ${
              vak.primary_modality === 'VISUAL'
                ? 'bg-slate-50/80 border-slate-300'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#183058]">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F1D33]">Visual (Penglihatan &amp; Spasial)</span>
                      {vak.primary_modality === 'VISUAL' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#183058] text-white rounded">
                          Modalitas Primer
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">Menyerap materi lewat bagan, kode warna, teks, dan demonstrasi</span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-sm font-bold text-[#0F1D33] tabular-nums">
                    {vak.percentages.V}%
                  </span>
                  <span className="text-xs text-slate-500 block tabular-nums">
                    {vak.scores.V} dari {vak.total_questions} soal
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-200/80 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-[#183058] rounded-sm transition-all"
                  style={{ width: `${vak.percentages.V}%` }}
                />
              </div>
            </div>

            {/* Auditori */}
            <div className={`p-4 rounded-xl border transition-all ${
              vak.primary_modality === 'AUDITORY'
                ? 'bg-slate-50/80 border-slate-300'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sky-700">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F1D33]">Auditori (Pendengaran &amp; Diskusi)</span>
                      {vak.primary_modality === 'AUDITORY' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-700 text-white rounded">
                          Modalitas Primer
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">Menyerap materi lewat intonasi suara, tanya jawab, dan diskusi</span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-sm font-bold text-[#0F1D33] tabular-nums">
                    {vak.percentages.A}%
                  </span>
                  <span className="text-xs text-slate-500 block tabular-nums">
                    {vak.scores.A} dari {vak.total_questions} soal
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-200/80 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-sky-700 rounded-sm transition-all"
                  style={{ width: `${vak.percentages.A}%` }}
                />
              </div>
            </div>

            {/* Kinestetik */}
            <div className={`p-4 rounded-xl border transition-all ${
              vak.primary_modality === 'KINESTHETIC'
                ? 'bg-slate-50/80 border-slate-300'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-emerald-700">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0F1D33]">Kinestetik (Gerakan &amp; Praktik)</span>
                      {vak.primary_modality === 'KINESTHETIC' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-700 text-white rounded">
                          Modalitas Primer
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">Menyerap materi lewat praktik langsung, eksperimen, dan simulasi fisik</span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-sm font-bold text-[#0F1D33] tabular-nums">
                    {vak.percentages.K}%
                  </span>
                  <span className="text-xs text-slate-500 block tabular-nums">
                    {vak.scores.K} dari {vak.total_questions} soal
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-200/80 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-emerald-700 rounded-sm transition-all"
                  style={{ width: `${vak.percentages.K}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actionable Recommendations & Tutor SOP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-[#0F1D33] block">
                Rekomendasi Metode Belajar Mandiri:
              </span>
              <ul className="space-y-2 text-xs text-slate-700">
                {vak.study_recommendations.map((rec: string, rIdx: number) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <span className="text-[#183058] font-bold select-none">•</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-[#0F1D33] block">
                Instruksi Khusus untuk Guru Privat (SOP Intervensi VAK):
              </span>
              <div className="border-l-2 border-[#183058] pl-3 py-0.5">
                <p className="text-xs text-slate-700 leading-relaxed">
                  {vak.tutor_sop}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bagian B Paket 1: Dominasi Hemisfer Otak */}
        {p1Modules?.PM_HEM_02 && (
          <div className="space-y-5 pt-8 border-t border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#183058]">
                <Brain className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-500">
                  Bagian B · Gaya Berpikir Kognitif
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F1D33] tracking-tight">
                Dominasi Belahan Otak: {hem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Memetakan orientasi berpikir: Analitis-Sekuensial (Otak Kiri) vs Intuitif-Holistik (Otak Kanan).
              </p>
            </div>

            {/* Brain Balance Dual Meter */}
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-sky-800">
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  <span className="tabular-nums">Otak Kiri: {hem.percentages.LEFT_BRAIN}%</span>
                </div>
                <div className="text-slate-500 text-xs font-normal">
                  Rasio: <span className="font-semibold text-[#0F1D33]">{hem.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-800">
                  <span className="tabular-nums">Otak Kanan: {hem.percentages.RIGHT_BRAIN}%</span>
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                </div>
              </div>

              {/* Dual Bar Balance Meter */}
              <div className="h-2.5 w-full bg-slate-200 rounded-sm overflow-hidden flex">
                <div
                  className="h-full bg-sky-700 transition-all"
                  style={{ width: `${hem.percentages.LEFT_BRAIN}%` }}
                />
                <div
                  className="h-full bg-rose-600 transition-all"
                  style={{ width: `${hem.percentages.RIGHT_BRAIN}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-sky-900 block text-[11px]">
                    Karakteristik Belahan Otak Kiri:
                  </span>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Logis, sistematis, analitis, menyukai urutan terstruktur langkah demi langkah, dan ketepatan aturan fakta/angka.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-rose-900 block text-[11px]">
                    Karakteristik Belahan Otak Kanan:
                  </span>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Kreatif, imajinatif, holistik (melihat gambaran besar), menyukai analogi visual, dan hubungan kontekstual yang luwes.
                  </p>
                </div>
              </div>
            </div>

            {/* Brain Tutor SOP Card */}
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-[#0F1D33] block">
                SOP Guru Privat untuk Karakteristik Berpikir Ini:
              </span>
              <div className="border-l-2 border-[#183058] pl-3 py-0.5">
                <p className="text-xs text-slate-700 leading-relaxed">
                  {hem.tutor_sop}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bagian C Paket 1: 3 Klaster Kebiasaan & Lingkungan Belajar */}
        {p1Modules?.PM_SKB_03 && (
          <div className="space-y-5 pt-8 border-t border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#183058]">
                <Hourglass className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-500">
                  Bagian C · Kebiasaan &amp; Lingkungan Belajar
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F1D33] tracking-tight">
                3 Klaster Gaya Kerja &amp; Stamina Belajar Harian
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Pemetaan ritme jam biologis prima, toleransi terhadap kebisingan ruang, dan rentang fokus belajar efektif.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Klaster 1: Kronobiologi */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      {habits.clusters.chronobiology.result === 'MORNING_LARK' ? (
                        <Sun className="w-4 h-4" />
                      ) : habits.clusters.chronobiology.result === 'AFTERNOON_PERSON' ? (
                        <Sunset className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Klaster 1 · Waktu Prima
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">Ritme Biologis:</span>
                    <h4 className="text-base font-bold text-[#0F1D33] mt-0.5">
                      {habits.clusters.chronobiology.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {habits.clusters.chronobiology.description}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#183058] block">
                    Panduan Tutor:
                  </span>
                  <p className="leading-relaxed text-slate-700">
                    {habits.clusters.chronobiology.tutor_sop}
                  </p>
                </div>
              </div>

              {/* Klaster 2: Lingkungan Belajar */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                      {habits.clusters.environment.result === 'FORMAL_AND_SENSITIVE' ? (
                        <VolumeX className="w-4 h-4" />
                      ) : habits.clusters.environment.result === 'AMBIENT_TOLERANT' ? (
                        <Coffee className="w-4 h-4" />
                      ) : (
                        <Home className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Klaster 2 · Suasana Ruang
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">Toleransi Suasana:</span>
                    <h4 className="text-base font-bold text-[#0F1D33] mt-0.5">
                      {habits.clusters.environment.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {habits.clusters.environment.description}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#183058] block">
                    Panduan Tutor:
                  </span>
                  <p className="leading-relaxed text-slate-700">
                    {habits.clusters.environment.tutor_sop}
                  </p>
                </div>
              </div>

              {/* Klaster 3: Rentang Fokus */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                      {habits.clusters.attention_span.result === 'TIPE_POMODORO' ? (
                        <Timer className="w-4 h-4" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Klaster 3 · Rentang Fokus
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">Durasi Ketahanan:</span>
                    <h4 className="text-base font-bold text-[#0F1D33] mt-0.5">
                      {habits.clusters.attention_span.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {habits.clusters.attention_span.description}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#183058] block">
                    Panduan Tutor:
                  </span>
                  <p className="leading-relaxed text-slate-700">
                    {habits.clusters.attention_span.tutor_sop}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 7. Informasi Status Paket Lanjutan (Paket 2 & 3) */}
      {!isPotential ? (
        <section className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">
                Status Asesmen Lanjutan
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0F1D33]">
                Informasi Paket 2 &amp; Paket 3
              </h3>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                {ASSESSMENT_PACKAGES.find((p) => p.code === 'PAKET_2_PERSONA_POTENTIAL')?.status === 'active'
                  ? 'Hasil Paket 2 dan Paket 3 baru akan ditampilkan setelah Anda menyelesaikan soal paket terkait. Silakan pilih opsi di samping jika ingin melanjutkan ke tahap berikutnya.'
                  : 'Akses Paket 2 (Persona Potential) dan Paket 3 (Persona Mastery) saat ini ditutup sementara untuk penyesuaian materi kurikulum. Hasil asesmen Paket 1 Anda sudah tersimpan dengan aman di sistem.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {ASSESSMENT_PACKAGES.find((p) => p.code === 'PAKET_2_PERSONA_POTENTIAL')?.status === 'active' ? (
                <>
                  <button
                    type="button"
                    disabled={startingNextPkg}
                    onClick={() => handleContinueToPackage2('PAKET_2_PERSONA_POTENTIAL')}
                    className="px-5 py-2.5 rounded-xl bg-[#183058] hover:bg-[#102342] text-white text-xs font-semibold flex items-center gap-2 min-h-[42px] transition-colors disabled:opacity-50"
                  >
                    <span>{startingNextPkg ? 'Menyiapkan Sesi...' : 'Lanjut ke Paket 2 (60 Soal)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPkg3Info((prev) => !prev)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#183058] border border-slate-300 text-xs font-semibold flex items-center gap-1.5 min-h-[42px] transition-colors"
                  >
                    <span>Opsi Lanjut ke Paket 3</span>
                  </button>
                </>
              ) : (
                <div className="px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Paket 2 &amp; 3 Ditutup Sementara</span>
                </div>
              )}
            </div>
          </div>

          {showPkg3Info && ASSESSMENT_PACKAGES.find((p) => p.code === 'PAKET_2_PERSONA_POTENTIAL')?.status === 'active' && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
              <p className="leading-relaxed">
                Untuk menuju <strong>Paket 3 (Persona Mastery)</strong>, silakan selesaikan <strong>Paket 2 (60 Soal)</strong> terlebih dahulu agar pemetaan berjalan berurutan.
              </p>
              <button
                type="button"
                disabled={startingNextPkg}
                onClick={() => handleContinueToPackage2('PAKET_3_PERSONA_MASTERY')}
                className="shrink-0 px-4 py-2 rounded-lg bg-[#183058] hover:bg-[#102342] text-white text-xs font-semibold flex items-center gap-1.5 min-h-[38px] transition-colors disabled:opacity-50"
              >
                <span>Mulai Tahap 2 Menuju Paket 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>
      ) : null}

      {/* 8. Action Toolbar & Navigation */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Cari Tutor Match */}
          <button
            type="button"
            onClick={() => navigate('/student/tutors')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#183058] hover:bg-[#102342] text-white text-xs font-semibold flex items-center justify-center gap-2 min-h-[42px] transition-colors shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Cari Guru Privat Sesuai Profil</span>
          </button>

          {/* Kembali ke Dashboard */}
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors min-h-[42px] flex items-center justify-center"
          >
            Kembali ke Dashboard Siswa
          </button>
        </div>

        {/* Retake Assessment */}
        <button
          type="button"
          onClick={() => {
            if (user) {
              personalityService.resetSubsequentPackages(user.id)
            }
            navigate('/student/assessment')
          }}
          className="text-xs font-medium text-slate-500 hover:text-[#0F1D33] flex items-center gap-1.5 py-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ambil Ulang Asesmen dari Paket 1</span>
        </button>
      </section>

      {/* 9. Psychological Safety & Diagnostic Disclaimer */}
      <footer className="text-center py-2">
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Pemberitahuan: Hasil diagnostik Persona dirancang untuk memetakan preferensi kognitif dan membantu penataan gaya belajar serta panduan tutor privat. Hasil ini bukan diagnosis medis atau psikologis klinis.
        </p>
      </footer>
    </div>
  )
}
