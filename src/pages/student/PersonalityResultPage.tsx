import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  Compass,
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
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { personalityService } from '@/services/personalityService'
import { assessmentSessionService } from '@/services/assessmentSessionService'
import { PRIMARY_ASSESSMENT_ID } from '@/services/assessmentService'
import type { AssessmentResult, AssessmentPackageCode } from '@/types/assessment'
import { formatLongDate } from '@/utils/format'
import { LEVEL_CONFIG } from '@/data/personaModalityData'
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
        <p className="text-xs text-[#676A78]">Menyiapkan laporan diagnostik asesmen...</p>
      </div>
    )
  }

  if (errorMsg || !result) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#EAEBF0] text-[#676A78] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-[#17181C]">
          {errorMsg || 'Hasil asesmen belum tersedia'}
        </h1>
        <p className="text-xs text-[#676A78]">
          Kamu belum menyelesaikan asesmen diagnostik atau data sesi belum tersimpan.
        </p>
        <button
          type="button"
          onClick={() => navigate('/student/assessment')}
          className="px-6 py-3 rounded-2xl bg-[#183058] text-white text-xs font-bold shadow-md shadow-[#183058]/20"
        >
          Mulai Asesmen Sekarang
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
    MI_LINGUISTIK: <BookOpen className="w-4 h-4 text-sky-600" />,
    MI_LOGIS: <Calculator className="w-4 h-4 text-emerald-600" />,
    MI_SPASIAL: <Eye className="w-4 h-4 text-purple-600" />,
    MI_KINESTETIK: <Activity className="w-4 h-4 text-amber-600" />,
    MI_MUSIKAL: <Music className="w-4 h-4 text-pink-600" />,
    MI_INTERPERSONAL: <Users className="w-4 h-4 text-blue-600" />,
    MI_INTRAPERSONAL: <Brain className="w-4 h-4 text-indigo-600" />,
    MI_NATURALIS: <Trees className="w-4 h-4 text-teal-600" />,
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* 1. Header & Hero Diagnostic Card */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#183058]" />
              <span className="text-xs font-bold text-[#183058] uppercase tracking-wider">
                {isPotential
                  ? 'Hasil Asesmen Paket 2: Persona Potential'
                  : 'Hasil Asesmen Paket 1: Persona Modality'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight mt-1">
              {isPotential
                ? 'Profil Karakter, Tipologi Kognitif & Peta Bakat Siswa'
                : 'Profil Karakter Belajar Siswa (Paket 1 Selesai)'}
            </h1>
            <p className="text-xs text-[#676A78] mt-1">
              Diselesaikan pada {formatLongDate(new Date(result.completed_at))} • Jenjang {levelInfo.label} ({totalQuestionsDone} Soal Paket {isPotential ? '2' : '1'} Selesai)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isPotential ? 'Paket 2 Terverifikasi' : 'Paket 1 Terverifikasi'}</span>
            </span>
          </div>
        </div>

        {/* Executive Summary Banner */}
        <div className="p-5 rounded-2xl bg-[#F4F6FA] border border-border/60 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#183058] uppercase tracking-wider">
                {isPotential ? 'Profil Karakter Utama (Paket 1 & Paket 2):' : 'Ringkasan Hasil Paket 1 (Persona Modality):'}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#17181C]">
                {isPotential && mbti
                  ? `${mbti.personality_code}: ${mbti.nickname} (${mbti.title})`
                  : `${vak.title} • ${hem.title}`}
              </h2>
              <p className="text-xs text-[#676A78] max-w-2xl leading-relaxed">
                {isPotential && mbti ? mbti.description : vak.summary}
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <span className="text-[11px] text-[#676A78] block">
                Status Penyelesaian:
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#183058]/10 text-[#183058] inline-block mt-0.5">
                {isPotential ? 'Paket 1 & Paket 2 Selesai' : 'Hanya Paket 1 (Paket 2 & 3 Belum Dikerjakan)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-border/60 text-xs">
            <div className="px-3.5 py-2.5 rounded-xl bg-white border border-border/60">
              <span className="text-[10px] font-bold text-[#676A78] uppercase block">
                Paket 1 (Bagian A • Sensori VAK)
              </span>
              <span className="font-extrabold text-[#183058]">{vak.title}</span>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-white border border-border/60">
              <span className="text-[10px] font-bold text-[#676A78] uppercase block">
                Paket 1 (Bagian B • Dominasi Otak)
              </span>
              <span className="font-extrabold text-[#183058]">{hem.title}</span>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-white border border-border/60">
              <span className="text-[10px] font-bold text-[#676A78] uppercase block">
                Paket 1 (Bagian C • Kebiasaan Belajar)
              </span>
              <span className="font-extrabold text-[#183058]">
                {habits.clusters.chronobiology.title} • {habits.clusters.attention_span.title}
              </span>
            </div>
          </div>
        </div>

        {/* Banner Lanjutan jika siswa memilih Paket 2 atau Paket 3 di awal dan baru selesai Paket 1 */}
        {choseNextTarget && (
          <div className="p-5 rounded-2xl bg-[#E8ECF6]/80 border border-[#183058]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold text-[#183058] uppercase tracking-wider">
                Tahap 1 (Paket 1) Selesai • Siap Melanjutkan ke Tahap Berikutnya
              </span>
              <p className="text-xs text-[#1D1D24] leading-relaxed max-w-2xl">
                Kamu telah menyelesaikan <strong>Soal Paket 1 ({levelInfo.totalCount} Soal)</strong>. Di bawah ini adalah hasil Paket 1 milikmu. Kamu dapat langsung melanjutkan pengerjaan ke <strong>Soal Paket 2 ({pkg2TotalQuestions} Soal terpisah: 20 MBTI + 40 Kecerdasan Majemuk)</strong> atau memilih opsi <strong>Paket 3</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleContinueToPackage2(result.target_package_code)}
              disabled={startingNextPkg}
              className="shrink-0 px-5 py-3 rounded-2xl bg-[#183058] hover:bg-[#102342] text-white text-xs font-bold shadow-md shadow-[#183058]/20 flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              {startingNextPkg ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Lanjutkan ke Soal Paket 2 ({pkg2TotalQuestions} Soal)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          BAGIAN KHUSUS PAKET 2: TIPOLOGI MBTI & MULTIPLE INTELLIGENCES
          ========================================================================= */}
      {isPotential && mbti && mi && (
        <>
          {/* 2. Hasil Paket 2 (Bagian A): Tipologi Kepribadian Belajar (MBTI Edukatif) */}
          <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#183058]">
                  <Layers className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Hasil Paket 2 (Bagian A): Tipologi Kepribadian (MBTI)
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-[#17181C]">
                  4 Dimensi Kognitif: {mbti.personality_code}
                </h2>
                <p className="text-xs text-[#676A78]">
                  Memetakan cara otak anak mengelola energi kognitif, menyerap informasi, merumuskan keputusan, dan merespons jadwal belajar.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-2xl bg-[#183058]/10 border border-[#183058]/20">
                <span className="text-xs font-bold text-[#183058]">Kode:</span>
                <span className="text-lg font-black tracking-widest text-[#183058]">
                  {mbti.personality_code}
                </span>
              </div>
            </div>

            {/* 4 Dimension Comparison Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dimensi 1: EI */}
              <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17181C]">Arah Energi Kognitif</span>
                  <span className="font-mono font-bold text-[#183058]">
                    Dominan {mbti.dimensions.EI.dominant} ({mbti.dimensions.EI.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#676A78]">
                  <span className={mbti.dimensions.EI.dominant === 'E' ? 'font-bold text-[#17181C]' : ''}>
                    Extraversion (E): {mbti.dimensions.EI.E}/5
                  </span>
                  <span className={mbti.dimensions.EI.dominant === 'I' ? 'font-bold text-[#17181C]' : ''}>
                    Introversion (I): {mbti.dimensions.EI.I}/5
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#EAEBF0] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#183058] transition-all"
                    style={{ width: `${(mbti.dimensions.EI.E / 5) * 100}%` }}
                  />
                  <div
                    className="h-full bg-[#A29BFE] transition-all"
                    style={{ width: `${(mbti.dimensions.EI.I / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#676A78] leading-tight">
                  {mbti.dimensions.EI.dominant === 'E'
                    ? 'Interactive Processor: Belajar melalui verbalisasi aktif dan berdiskusi.'
                    : 'Internal Processor: Belajar melalui kontemplasi dan butuh waktu hening untuk berpikir.'}
                </p>
              </div>

              {/* Dimensi 2: SN */}
              <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17181C]">Persepsi Informasi</span>
                  <span className="font-mono font-bold text-[#183058]">
                    Dominan {mbti.dimensions.SN.dominant} ({mbti.dimensions.SN.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#676A78]">
                  <span className={mbti.dimensions.SN.dominant === 'S' ? 'font-bold text-[#17181C]' : ''}>
                    Sensing (S): {mbti.dimensions.SN.S}/5
                  </span>
                  <span className={mbti.dimensions.SN.dominant === 'N' ? 'font-bold text-[#17181C]' : ''}>
                    Intuition (N): {mbti.dimensions.SN.N}/5
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#EAEBF0] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(mbti.dimensions.SN.S / 5) * 100}%` }}
                  />
                  <div
                    className="h-full bg-teal-400 transition-all"
                    style={{ width: `${(mbti.dimensions.SN.N / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#676A78] leading-tight">
                  {mbti.dimensions.SN.dominant === 'S'
                    ? 'Concrete / Detail: Menyerap fakta nyata, urutan bertahap, dan hal-hal praktis di bumi.'
                    : 'Abstract / Concept: Menyukai pola besar, imajinasi konseptual, dan makna masa depan.'}
                </p>
              </div>

              {/* Dimensi 3: TF */}
              <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17181C]">Kriteria Keputusan</span>
                  <span className="font-mono font-bold text-[#183058]">
                    Dominan {mbti.dimensions.TF.dominant} ({mbti.dimensions.TF.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#676A78]">
                  <span className={mbti.dimensions.TF.dominant === 'T' ? 'font-bold text-[#17181C]' : ''}>
                    Thinking (T): {mbti.dimensions.TF.T}/5
                  </span>
                  <span className={mbti.dimensions.TF.dominant === 'F' ? 'font-bold text-[#17181C]' : ''}>
                    Feeling (F): {mbti.dimensions.TF.F}/5
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#EAEBF0] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-sky-500 transition-all"
                    style={{ width: `${(mbti.dimensions.TF.T / 5) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${(mbti.dimensions.TF.F / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#676A78] leading-tight">
                  {mbti.dimensions.TF.dominant === 'T'
                    ? 'Objective Logic: Menuntut konsistensi logis dan bukti rasional dalam materi pelajaran.'
                    : 'Subjective Values: Mengutamakan rasa aman, empati, kehangatan hubungan, dan ikatan batin.'}
                </p>
              </div>

              {/* Dimensi 4: JP */}
              <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#17181C]">Orientasi Struktur & Jadwal</span>
                  <span className="font-mono font-bold text-[#183058]">
                    Dominan {mbti.dimensions.JP.dominant} ({mbti.dimensions.JP.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#676A78]">
                  <span className={mbti.dimensions.JP.dominant === 'J' ? 'font-bold text-[#17181C]' : ''}>
                    Judging (J): {mbti.dimensions.JP.J}/5
                  </span>
                  <span className={mbti.dimensions.JP.dominant === 'P' ? 'font-bold text-[#17181C]' : ''}>
                    Perceiving (P): {mbti.dimensions.JP.P}/5
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#EAEBF0] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${(mbti.dimensions.JP.J / 5) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-400 transition-all"
                    style={{ width: `${(mbti.dimensions.JP.P / 5) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#676A78] leading-tight">
                  {mbti.dimensions.JP.dominant === 'J'
                    ? 'Structured / Closure: Belajar optimal dengan jadwal terprediksi dan target yang pasti.'
                    : 'Flexible / Open: Menikmati fleksibilitas, spontanitas, dan variasi cara penyelesaian.'}
                </p>
              </div>
            </div>

            {/* SOP Intervensi Guru Privat (Mencegah Bentrok Emosional) */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#183058]" />
                <h3 className="text-sm font-extrabold text-[#17181C]">
                  SOP Intervensi Guru Privat (Mencegah Bentrok Emosional)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {mbti.tutor_sop_details.map((sopItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F4F6FA] border border-border/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#183058] uppercase">
                        Huruf {sopItem.letter} ({sopItem.dimension})
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#183058]/10 text-[#183058] text-[10px] font-bold">
                        Wajib
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#17181C]">{sopItem.rule}</p>
                    <p className="text-xs text-[#333542] leading-relaxed">{sopItem.instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Hasil Paket 2 (Bagian B): Peta 8 Kecerdasan Majemuk (Multiple Intelligences) */}
          <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl shadow-sm space-y-6">
            <div className="space-y-1 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2 text-[#183058]">
                <Lightbulb className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Hasil Paket 2 (Bagian B): Peta 8 Kecerdasan Majemuk
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#17181C]">
                8 Kecerdasan Majemuk Howard Gardner
              </h2>
              <p className="text-xs text-[#676A78]">
                Setiap anak adalah jenius di ranahnya masing-masing. Pintu gerbang kecerdasan tertinggi digunakan tutor untuk menaklukkan pelajaran yang sulit.
              </p>
            </div>

            {/* Top 3 Gateways Callout Cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-[#17181C]">
                  Top 3 Pintu Gerbang Kecerdasan Utama (Primary Intelligence Gateways)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mi.ranking.slice(0, 3).map((item, rankIdx) => (
                  <div
                    key={item.category}
                    className="p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-gradient-to-b from-[#183058]/5 to-transparent border-[#183058]/30 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-[#183058] text-white font-bold text-xs flex items-center justify-center">
                          #{rankIdx + 1}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#183058]">
                          {item.raw}/20 Poin ({item.percentage}%)
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-[#17181C] flex items-center gap-1.5">
                          {miIconMap[item.category]}
                          <span>{item.name}</span>
                        </h4>
                        <span className="text-[11px] font-semibold text-[#183058]">
                          {item.alias}
                        </span>
                      </div>
                      <p className="text-xs text-[#676A78] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/60 text-xs text-[#333542] space-y-1">
                      <span className="text-[10px] font-bold text-[#183058] uppercase block">
                        Strategi Menembus Materi Sulit:
                      </span>
                      <p className="leading-relaxed text-[11px]">{item.gateway_strategy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Horizontal Bar Chart of 8 Intelligences */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              <h3 className="text-sm font-extrabold text-[#17181C]">
                Distribusi Peringkat 8 Kecerdasan Majemuk
              </h3>

              <div className="space-y-3">
                {mi.ranking.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {miIconMap[item.category]}
                        <span className="font-bold text-[#17181C]">{item.name}</span>
                        <span className="text-[11px] text-[#676A78]">({item.alias})</span>
                      </div>
                      <span className="font-mono font-bold text-[#17181C]">
                        {item.raw}/20 ({item.percentage}%)
                      </span>
                    </div>

                    <div className="h-3 w-full bg-[#EAEBF0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-[#183058]"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          HASIL ASESMEN PAKET 1: PERSONA MODALITY (TERPADU DALAM 1 KARTU)
          ========================================================================= */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-[#183058]/10 text-[#183058] text-[11px] font-bold uppercase tracking-wider inline-block">
              Hasil Paket 1 • Persona Modality ({levelInfo.totalCount} Soal)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#17181C]">
              Rincian Diagnostik Fondasi &amp; Cara Belajar Siswa (Paket 1)
            </h2>
            <p className="text-xs text-[#676A78]">
              Ketiga aspek di bawah ini (Modalitas Sensori VAK, Dominasi Belahan Otak, dan Kebiasaan Belajar) merupakan satu kesatuan hasil dari pengerjaan Soal Paket 1.
            </p>
          </div>
        </div>

        {/* Bagian A Paket 1: Sensory Modality (VAK) */}
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#183058]">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Paket 1 (Bagian A): Modalitas Belajar Sensori (VAK)
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#17181C]">
              Distribusi Modalitas Belajar Sensori (VAK)
            </h3>
            <p className="text-xs text-[#676A78]">
              Mengukur panca indra dominan yang digunakan otak anak untuk menerima dan memproses materi baru secara cepat.
            </p>
          </div>

          {/* 3 Modality Bars */}
          <div className="space-y-4">
            {/* Visual */}
            <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#183058]" />
                  <span className="font-bold text-[#17181C]">Visual (Penglihatan)</span>
                </div>
                <span className="font-mono font-bold text-[#17181C]">
                  {vak.scores.V} Soal ({vak.percentages.V}%)
                </span>
              </div>
              <div className="h-3 w-full bg-[#EAEBF0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-[#183058]"
                  style={{ width: `${vak.percentages.V}%` }}
                />
              </div>
            </div>

            {/* Auditori */}
            <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-[#17181C]">Auditori (Pendengaran)</span>
                </div>
                <span className="font-mono font-bold text-[#17181C]">
                  {vak.scores.A} Soal ({vak.percentages.A}%)
                </span>
              </div>
              <div className="h-3 w-full bg-[#EAEBF0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-sky-500"
                  style={{ width: `${vak.percentages.A}%` }}
                />
              </div>
            </div>

            {/* Kinestetik */}
            <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-[#17181C]">Kinestetik (Gerakan &amp; Praktik)</span>
                </div>
                <span className="font-mono font-bold text-[#17181C]">
                  {vak.scores.K} Soal ({vak.percentages.K}%)
                </span>
              </div>
              <div className="h-3 w-full bg-[#EAEBF0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-emerald-500"
                  style={{ width: `${vak.percentages.K}%` }}
                />
              </div>
            </div>
          </div>

          {/* Study Recommendations & Tutor SOP for VAK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#F4F6FA] border border-border/60 space-y-2">
              <span className="text-xs font-bold text-[#183058] block uppercase tracking-wide">
                Rekomendasi Metode Belajar Mandiri:
              </span>
              <ul className="space-y-1.5 text-xs text-[#333542]">
                {vak.study_recommendations.map((rec: string, rIdx: number) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <span className="text-[#183058] font-bold">•</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F6FA] border border-border/60 space-y-2">
              <span className="text-xs font-bold text-[#183058] block uppercase tracking-wide">
                Instruksi Khusus untuk Guru Privat (SOP Intervensi VAK):
              </span>
              <p className="text-xs text-[#333542] leading-relaxed">
                {vak.tutor_sop}
              </p>
            </div>
          </div>
        </div>

        {/* Bagian B Paket 1: Dominasi Hemisfer Otak */}
        <div className="space-y-5 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#183058]">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Paket 1 (Bagian B): Dominasi Belahan Otak
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#17181C]">
              Gaya Berpikir Kognitif: {hem.title}
            </h3>
            <p className="text-xs text-[#676A78]">
              Memetakan orientasi berpikir dari soal Paket 1: Analitis-Sekuensial (Otak Kiri) vs Intuitif-Holistik (Otak Kanan).
            </p>
          </div>

          {/* Brain Balance Split Display */}
          <div className="p-5 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5 text-sky-700">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Otak Kiri: {hem.percentages.LEFT_BRAIN}%</span>
              </div>
              <div className="text-[#676A78] text-[11px] font-normal">
                Status: <span className="font-bold text-[#17181C]">{hem.title}</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-700">
                <span>Otak Kanan: {hem.percentages.RIGHT_BRAIN}%</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
            </div>

            {/* Dual Bar Balance Meter */}
            <div className="h-4 w-full bg-[#EAEBF0] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-sky-500 transition-all"
                style={{ width: `${hem.percentages.LEFT_BRAIN}%` }}
              />
              <div
                className="h-full bg-rose-500 transition-all"
                style={{ width: `${hem.percentages.RIGHT_BRAIN}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1">
                <span className="font-bold text-sky-800 block text-[11px] uppercase tracking-wide">
                  Karakter Otak Kiri:
                </span>
                <p className="text-[#676A78] text-xs leading-relaxed">
                  Logis, matematis, analitis, sekuensial, teratur, menyukai kepastian aturan angka.
                </p>
              </div>
              <div className="space-y-1 text-right">
                <span className="font-bold text-rose-800 block text-[11px] uppercase tracking-wide">
                  Karakter Otak Kanan:
                </span>
                <p className="text-[#676A78] text-xs leading-relaxed">
                  Kreatif, imajinatif, holistik, menyukai cerita kontekstual, analogi visual bebas.
                </p>
              </div>
            </div>
          </div>

          {/* Brain Tutor SOP Card */}
          <div className="p-4 rounded-2xl bg-[#F4F6FA] border border-border/60 space-y-2">
            <span className="text-xs font-bold text-[#183058] block uppercase tracking-wide">
              SOP Guru Privat untuk Gaya Berpikir Ini:
            </span>
            <p className="text-xs text-[#333542] leading-relaxed">
              {hem.tutor_sop}
            </p>
          </div>
        </div>

        {/* Bagian C Paket 1: 3 Klaster Kebiasaan & Lingkungan Belajar */}
        <div className="space-y-5 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#183058]">
              <Hourglass className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Paket 1 (Bagian C): Kebiasaan &amp; Lingkungan Belajar
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#17181C]">
              3 Klaster Gaya Kerja &amp; Stamina Belajar Harian
            </h3>
            <p className="text-xs text-[#676A78]">
              Hasil screening jam biologis prima, toleransi kebisingan ruangan, dan durasi rentang ketahanan fokus dari soal Paket 1.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Klaster 1: Kronobiologi */}
            <div className="p-5 rounded-2xl border border-border/80 bg-[#F9FAFD] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    {habits.clusters.chronobiology.result === 'MORNING_LARK' ? (
                      <Sun className="w-4 h-4" />
                    ) : habits.clusters.chronobiology.result === 'AFTERNOON_PERSON' ? (
                      <Sunset className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-[#676A78] uppercase tracking-wider">
                    Klaster 1: Jam Prima
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-[#676A78]">Ritme Biologis:</span>
                  <h4 className="text-base font-extrabold text-[#17181C]">
                    {habits.clusters.chronobiology.title}
                  </h4>
                </div>

                <p className="text-xs text-[#676A78] leading-relaxed">
                  {habits.clusters.chronobiology.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F6FA] border border-border/60 text-xs text-[#333542] space-y-1">
                <span className="text-[10px] font-bold text-[#183058] block uppercase">
                  SOP Guru Privat:
                </span>
                <p className="leading-relaxed">
                  {habits.clusters.chronobiology.tutor_sop}
                </p>
              </div>
            </div>

            {/* Klaster 2: Lingkungan Belajar */}
            <div className="p-5 rounded-2xl border border-border/80 bg-[#F9FAFD] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    {habits.clusters.environment.result === 'FORMAL_AND_SENSITIVE' ? (
                      <VolumeX className="w-4 h-4" />
                    ) : habits.clusters.environment.result === 'AMBIENT_TOLERANT' ? (
                      <Coffee className="w-4 h-4" />
                    ) : (
                      <Home className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-[#676A78] uppercase tracking-wider">
                    Klaster 2: Suasana
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-[#676A78]">Toleransi Ruang:</span>
                  <h4 className="text-base font-extrabold text-[#17181C]">
                    {habits.clusters.environment.title}
                  </h4>
                </div>

                <p className="text-xs text-[#676A78] leading-relaxed">
                  {habits.clusters.environment.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F6FA] border border-border/60 text-xs text-[#333542] space-y-1">
                <span className="text-[10px] font-bold text-[#183058] block uppercase">
                  SOP Guru Privat:
                </span>
                <p className="leading-relaxed">
                  {habits.clusters.environment.tutor_sop}
                </p>
              </div>
            </div>

            {/* Klaster 3: Rentang Fokus */}
            <div className="p-5 rounded-2xl border border-border/80 bg-[#F9FAFD] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    {habits.clusters.attention_span.result === 'TIPE_POMODORO' ? (
                      <Timer className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-[#676A78] uppercase tracking-wider">
                    Klaster 3: Fokus
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-[#676A78]">Rentang Ketahanan:</span>
                  <h4 className="text-base font-extrabold text-[#17181C]">
                    {habits.clusters.attention_span.title}
                  </h4>
                </div>

                <p className="text-xs text-[#676A78] leading-relaxed">
                  {habits.clusters.attention_span.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F6FA] border border-border/60 text-xs text-[#333542] space-y-1">
                <span className="text-[10px] font-bold text-[#183058] block uppercase">
                  SOP Guru Privat:
                </span>
                <p className="leading-relaxed">
                  {habits.clusters.attention_span.tutor_sop}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Opsi Melanjutkan ke Paket Berikutnya (Tanpa menampilkan kartu hasil paket yang belum dikerjakan) */}
      {!isPotential ? (
        <div className="surface-card p-6 sm:p-8 border border-[#183058]/25 rounded-3xl space-y-4 bg-[#F4F6FA]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-[#183058] text-white text-[11px] font-bold uppercase tracking-wider inline-block">
                Paket 1 Selesai • Opsi Lanjut Paket Berikutnya
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#17181C]">
                Ingin Melanjutkan ke Paket 2 atau Paket 3?
              </h3>
              <p className="text-xs text-[#676A78] max-w-xl leading-relaxed">
                Hasil Paket 2 dan Paket 3 baru akan ditampilkan setelah Anda menyelesaikan soal paket terkait. Silakan pilih opsi di samping jika ingin melanjutkan ke tahap berikutnya.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                disabled={startingNextPkg}
                onClick={() => handleContinueToPackage2('PAKET_2_PERSONA_POTENTIAL')}
                className="px-5 py-3 rounded-2xl bg-[#183058] hover:bg-[#102342] text-white text-xs font-bold shadow-sm flex items-center gap-2 min-h-[44px] disabled:opacity-50"
              >
                <span>{startingNextPkg ? 'Menyiapkan Sesi...' : 'Lanjut ke Paket 2 (60 Soal)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowPkg3Info((prev) => !prev)}
                className="px-4 py-3 rounded-2xl bg-white hover:bg-[#E8ECF6] text-[#183058] border border-[#183058]/30 text-xs font-bold flex items-center gap-1.5 min-h-[44px]"
              >
                <span>Opsi Lanjut ke Paket 3</span>
              </button>
            </div>
          </div>

          {showPkg3Info && (
            <div className="p-4 rounded-2xl bg-white border border-[#183058]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#333542]">
              <p className="leading-relaxed">
                Untuk menuju <strong>Paket 3 (Persona Mastery)</strong>, silakan selesaikan <strong>Paket 2 (60 Soal)</strong> terlebih dahulu agar pemetaan berjalan berurutan.
              </p>
              <button
                type="button"
                disabled={startingNextPkg}
                onClick={() => handleContinueToPackage2('PAKET_3_PERSONA_MASTERY')}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#183058] hover:bg-[#102342] text-white text-xs font-bold flex items-center gap-1.5 min-h-[40px] disabled:opacity-50"
              >
                <span>Mulai Tahap 2 Menuju Paket 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* 8. Navigation & Next Actions */}
      <div className="p-6 rounded-3xl bg-white border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Cari Tutor Match */}
          <button
            type="button"
            onClick={() => navigate('/student/tutors')}
            className="px-5 py-3 rounded-2xl bg-[#183058] hover:bg-[#102342] text-white text-xs font-bold shadow-md shadow-[#183058]/20 flex items-center gap-2 min-h-[44px]"
          >
            <Search className="w-4 h-4" />
            <span>Cari Guru Privat Sesuai Profil</span>
          </button>

          {/* Kembali ke Dashboard */}
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-5 py-3 rounded-2xl border border-border text-xs font-bold text-[#17181C] bg-[#F4F6FA] hover:bg-[#EAEBF0] transition-colors min-h-[44px]"
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
          className="text-xs font-bold text-[#676A78] hover:text-[#17181C] flex items-center gap-1.5 py-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ambil Ulang Asesmen dari Paket 1</span>
        </button>
      </div>

      {/* 9. Psychological Safety Note */}
      <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border text-[11px] text-[#676A78] leading-relaxed text-center">
        Pemberitahuan: Hasil diagnostik Persona dirancang untuk memetakan preferensi kognitif dan membantu penataan gaya belajar serta panduan tutor privat. Hasil ini bukan diagnosis medis atau psikologis klinis.
      </div>
    </div>
  )
}
