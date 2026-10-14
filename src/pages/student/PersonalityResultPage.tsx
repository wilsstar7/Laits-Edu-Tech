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
  GraduationCap,
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
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { personalityService } from '@/services/personalityService'
import type { AssessmentResult } from '@/types/assessment'
import { formatLongDate } from '@/utils/format'
import { LEVEL_CONFIG } from '@/data/personaModalityData'

export function PersonalityResultPage() {
  const { resultId } = useParams<{ resultId?: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
        <p className="text-xs text-[#676A78]">Menyiapkan laporan diagnostik Persona Modality...</p>
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
          Kamu belum menyelesaikan asesmen diagnostik Persona Modality atau data sesi belum tersimpan.
        </p>
        <button
          type="button"
          onClick={() => navigate('/student/assessment')}
          className="px-6 py-3 rounded-2xl bg-[#6C5CE7] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/20"
        >
          Mulai Asesmen Sekarang
        </button>
      </div>
    )
  }

  const modality = result.modality_result
  const studentLevel = result.student_level || 'SMA'
  const levelInfo = LEVEL_CONFIG[studentLevel]

  // Fallback data if viewing an older result record
  const vak = modality?.modules.PM_VAK_01 || {
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

  const hem = modality?.modules.PM_HEM_02 || {
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

  const habits = modality?.modules.PM_SKB_03 || {
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

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* 1. Header & Hero Diagnostic Card */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#6C5CE7]" />
              <span className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider">
                Hasil Asesmen Paket 1: Persona Modality
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight mt-1">
              Profil Karakter Belajar Siswa
            </h1>
            <p className="text-xs text-[#676A78] mt-1">
              Diselesaikan pada {formatLongDate(new Date(result.completed_at))} • Jenjang {levelInfo.label} ({levelInfo.totalCount} Soal Selesai)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-emerald-700 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Diagnostik Terverifikasi</span>
            </span>
          </div>
        </div>

        {/* Executive Summary Banner */}
        <div className="p-5 rounded-2xl bg-[#F4F5FB] border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wider">
              Kesimpulan Modalitas Utama:
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#17181C]">
              {vak.title}
            </h2>
            <p className="text-xs text-[#676A78] max-w-2xl leading-relaxed">
              {vak.summary}
            </p>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <span className="text-[11px] text-[#676A78] block">Tipe Dominasi Sensori:</span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#6C5CE7]/10 text-[#6C5CE7] inline-block mt-0.5">
              {vak.dominance_type === 'SINGLE_DOMINANCE'
                ? 'Dominasi Tunggal'
                : vak.dominance_type === 'BIMODAL'
                ? 'Bimodal (Dua Jalur)'
                : 'Multimodal (Seimbang)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Modul 1.1: Sensory Modality (VAK) */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wide">
                Modul 1.1: Sensory Modality (PM-VAK-01)
              </span>
              <h2 className="text-lg font-extrabold text-[#17181C]">
                Penerimaan & Pemrosesan Informasi (VAK)
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F5FB] text-[#676A78]">
            {vak.total_questions} Butir Soal Terukur
          </span>
        </div>

        {/* 3 Modality Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Visual */}
          <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Visual (V)</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#17181C]">
                {vak.scores.V} Poin ({vak.percentages.V}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EAEBF0] overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${vak.percentages.V}%` }}
              />
            </div>
            <p className="text-[11px] text-[#676A78]">
              Memproses materi via gambar, video, diagram, dan representasi spasial visual.
            </p>
          </div>

          {/* Auditory */}
          <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Auditori (A)</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#17181C]">
                {vak.scores.A} Poin ({vak.percentages.A}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EAEBF0] overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${vak.percentages.A}%` }}
              />
            </div>
            <p className="text-[11px] text-[#676A78]">
              Memproses materi via suara penjelasan guru, diskusi lisan, dan dialog tanya jawab.
            </p>
          </div>

          {/* Kinesthetic */}
          <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Kinestetik (K)</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#17181C]">
                {vak.scores.K} Poin ({vak.percentages.K}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EAEBF0] overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${vak.percentages.K}%` }}
              />
            </div>
            <p className="text-[11px] text-[#676A78]">
              Memproses materi via praktik langsung, sentuhan taktil, dan memori gerakan fisik.
            </p>
          </div>
        </div>

        {/* Study Recommendations & Tutor SOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Recommendations for Student */}
          <div className="p-5 rounded-2xl bg-white border border-border/80 space-y-3">
            <div className="flex items-center gap-2 text-[#6C5CE7]">
              <BookOpen className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17181C]">
                Rekomendasi Belajar Mandiri di Rumah
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#333542]">
              {vak.study_recommendations.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SOP Tutor for VAK */}
          <div className="p-5 rounded-2xl bg-[#FDF4E2]/60 border border-[#F2B84B]/60 space-y-2">
            <div className="flex items-center gap-2 text-[#92580E]">
              <GraduationCap className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#92580E]">
                Panduan Intervensi Guru Privat (SOP VAK)
              </h3>
            </div>
            <p className="text-xs text-[#4A320A] leading-relaxed">
              {vak.tutor_sop}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Modul 1.2: Dominasi Hemisfer Otak (PM-HEM-02) */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wide">
                Modul 1.2: Dominasi Hemisfer Otak (PM-HEM-02)
              </span>
              <h2 className="text-lg font-extrabold text-[#17181C]">
                Gaya Berpikir & Pemecahan Masalah
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F5FB] text-[#676A78]">
            {hem.total_questions} Butir Soal Terukur
          </span>
        </div>

        {/* Visual Brain Balance Comparison */}
        <div className="p-6 rounded-2xl bg-[#F9FAFD] border border-border/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wide">
                Kategori Dominasi:
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#17181C]">
                {hem.title}
              </h3>
            </div>

            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#6C5CE7]/10 text-[#6C5CE7]">
              {hem.dominance_category === 'LEFT_DOMINANT'
                ? 'Dominan Otak Kiri (>65%)'
                : hem.dominance_category === 'RIGHT_DOMINANT'
                ? 'Dominan Otak Kanan (>65%)'
                : 'Whole-Brain (Keseimbangan ≤65%)'}
            </span>
          </div>

          {/* Split bar: Left vs Right */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-sky-700">
                Otak Kiri (Analitis): {hem.percentages.LEFT_BRAIN}% ({hem.scores.LEFT_BRAIN} soal)
              </span>
              <span className="text-purple-700">
                Otak Kanan (Kreatif): {hem.percentages.RIGHT_BRAIN}% ({hem.scores.RIGHT_BRAIN} soal)
              </span>
            </div>

            <div className="w-full h-3.5 rounded-full bg-[#EAEBF0] overflow-hidden flex">
              <div
                className="h-full bg-sky-600 transition-all duration-500"
                style={{ width: `${hem.percentages.LEFT_BRAIN}%` }}
                title={`Otak Kiri: ${hem.percentages.LEFT_BRAIN}%`}
              />
              <div
                className="h-full bg-purple-600 transition-all duration-500"
                style={{ width: `${hem.percentages.RIGHT_BRAIN}%` }}
                title={`Otak Kanan: ${hem.percentages.RIGHT_BRAIN}%`}
              />
            </div>
          </div>

          <p className="text-xs text-[#676A78] leading-relaxed">
            {hem.summary}
          </p>
        </div>

        {/* SOP Guru Privat Otak Kiri / Kanan */}
        <div className="p-5 rounded-2xl bg-[#F4F5FB] border border-[#6C5CE7]/30 space-y-2">
          <div className="flex items-center gap-2 text-[#6C5CE7]">
            <Brain className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17181C]">
              SOP Tindak Lanjut Guru Privat: Pendekatan Berpikir
            </h3>
          </div>
          <p className="text-xs text-[#333542] leading-relaxed">
            {hem.tutor_sop}
          </p>
        </div>
      </div>

      {/* 4. Modul 1.3: Screening Kebiasaan & Lingkungan Belajar (PM-SKB-03) */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wide">
                Modul 1.3: Screening Kebiasaan Belajar (PM-SKB-03)
              </span>
              <h2 className="text-lg font-extrabold text-[#17181C]">
                3 Klaster Lingkungan & Kebiasaan Belajar
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F5FB] text-[#676A78]">
            15 Butir Soal Terukur
          </span>
        </div>

        {/* 3 Cluster Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Klaster 1: Jam Biologis */}
          <div className="p-5 rounded-2xl border border-border/80 bg-white flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  {habits.clusters.chronobiology.result === 'MORNING_PERSON' ? (
                    <Sun className="w-4 h-4" />
                  ) : habits.clusters.chronobiology.result === 'AFTERNOON_PERSON' ? (
                    <Sunset className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#676A78] uppercase tracking-wider">
                  Klaster 1: Waktu
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#676A78]">Jam Biologis Kognitif:</span>
                <h3 className="text-base font-extrabold text-[#17181C]">
                  {habits.clusters.chronobiology.title}
                </h3>
              </div>

              <p className="text-xs text-[#676A78] leading-relaxed">
                {habits.clusters.chronobiology.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F5FB] border border-border/60 text-xs text-[#333542] space-y-1">
              <span className="text-[10px] font-bold text-[#6C5CE7] block uppercase">
                SOP Guru Privat:
              </span>
              <p className="leading-relaxed">
                {habits.clusters.chronobiology.tutor_sop}
              </p>
            </div>
          </div>

          {/* Klaster 2: Suasana Lingkungan */}
          <div className="p-5 rounded-2xl border border-border/80 bg-white flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  {habits.clusters.environment.result === 'FORMAL_AND_SENSITIVE' ? (
                    <VolumeX className="w-4 h-4" />
                  ) : habits.clusters.environment.result === 'MODERATE_FLEXIBLE' ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    <Coffee className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#676A78] uppercase tracking-wider">
                  Klaster 2: Ruang
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#676A78]">Toleransi Lingkungan:</span>
                <h3 className="text-base font-extrabold text-[#17181C]">
                  {habits.clusters.environment.title}
                </h3>
              </div>

              <p className="text-xs text-[#676A78] leading-relaxed">
                {habits.clusters.environment.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F5FB] border border-border/60 text-xs text-[#333542] space-y-1">
              <span className="text-[10px] font-bold text-[#6C5CE7] block uppercase">
                SOP Guru Privat:
              </span>
              <p className="leading-relaxed">
                {habits.clusters.environment.tutor_sop}
              </p>
            </div>
          </div>

          {/* Klaster 3: Rentang Fokus */}
          <div className="p-5 rounded-2xl border border-border/80 bg-white flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  {habits.clusters.attention_span.result === 'TIPE_MARATON' ? (
                    <Timer className="w-4 h-4" />
                  ) : habits.clusters.attention_span.result === 'TIPE_POMODORO' ? (
                    <Hourglass className="w-4 h-4" />
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
                <h3 className="text-base font-extrabold text-[#17181C]">
                  {habits.clusters.attention_span.title}
                </h3>
              </div>

              <p className="text-xs text-[#676A78] leading-relaxed">
                {habits.clusters.attention_span.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F5FB] border border-border/60 text-xs text-[#333542] space-y-1">
              <span className="text-[10px] font-bold text-[#6C5CE7] block uppercase">
                SOP Guru Privat:
              </span>
              <p className="leading-relaxed">
                {habits.clusters.attention_span.tutor_sop}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Navigation & Next Actions */}
      <div className="p-6 rounded-3xl bg-white border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Cari Tutor Match */}
          <button
            type="button"
            onClick={() => navigate('/student/tutors')}
            className="px-5 py-3 rounded-2xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/20 flex items-center gap-2 min-h-[44px]"
          >
            <Search className="w-4 h-4" />
            <span>Cari Guru Privat Sesuai Profil</span>
          </button>

          {/* Kembali ke Dashboard */}
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-5 py-3 rounded-2xl border border-border text-xs font-bold text-[#17181C] bg-[#F4F5FB] hover:bg-[#EAEBF0] transition-colors min-h-[44px]"
          >
            Kembali ke Dashboard Siswa
          </button>
        </div>

        {/* Retake Assessment */}
        <button
          type="button"
          onClick={() => navigate('/student/assessment')}
          className="text-xs font-bold text-[#676A78] hover:text-[#17181C] flex items-center gap-1.5 py-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ambil Ulang Asesmen</span>
        </button>
      </div>

      {/* 6. Psychological Safety Note */}
      <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border text-[11px] text-[#676A78] leading-relaxed text-center">
        Pemberitahuan: Hasil diagnostik Persona Modality ditujukan untuk memetakan preferensi kognitif dan membantu penataan gaya belajar serta instruksi tutor privat. Hasil ini bukan diagnosis medis atau psikologis klinis.
      </div>
    </div>
  )
}
