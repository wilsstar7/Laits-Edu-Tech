import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  Download,
  Search,
  RotateCcw,
  Loader2,
  Lightbulb,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { personalityService } from '@/services/personalityService'
import type { AssessmentResult } from '@/types/assessment'
import { DimensionRadar } from '@/components/assessment/DimensionRadar'
import { DimensionScoreCard } from '@/components/assessment/DimensionScoreCard'
import { ReportStatusCard } from '@/components/report/ReportStatusCard'
import { formatLongDate } from '@/utils/format'

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

        if (!data) {
          setResult(null)
        } else {
          setResult(data)
        }
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
        <p className="text-xs text-[#676A78]">Menyiapkan laporan profil belajar Anda...</p>
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
          Anda belum menyelesaikan asesmen kepribadian belajar atau data belum tersimpan.
        </p>
        <button
          type="button"
          onClick={() => navigate('/student/assessment')}
          className="px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/20"
        >
          Mulai Asesmen Sekarang
        </button>
      </div>
    )
  }

  const pType = result.personality_type
  const dimensions = result.dimensions ?? []

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* 1. Header & Personality Hero Card */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#6C5CE7]" />
              <span className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider">
                Laporan Profil Belajar Siswa
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight mt-1">
              {pType?.name || 'Profil Karakter Siswa'}
            </h1>
            <p className="text-xs text-[#676A78] mt-1">
              Diselesaikan pada {formatLongDate(new Date(result.completed_at))}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-[#676A78]">Skor Rata-Rata Dimensi:</span>
            <span className="font-mono font-extrabold text-sm px-3 py-1 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
              {Math.round(result.overall_score)}%
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="p-4 rounded-xl bg-[#F9FAFD] border border-border/60 text-xs sm:text-sm text-[#333542] leading-relaxed">
          {pType?.description}
        </div>
      </div>

      {/* 2. Official Personality PDF Report Status Card */}
      <ReportStatusCard assessmentResultId={result.id} />

      {/* 2. Visualisasi Dimensi Belajar (Radar Chart & Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Chart */}
        <div className="lg:col-span-6 surface-card bg-white p-6 border border-border/80 rounded-2xl shadow-sm flex flex-col items-center">
          <div className="w-full text-left mb-2">
            <h2 className="text-base font-extrabold text-[#17181C]">
              Peta Pola Belajar
            </h2>
            <p className="text-xs text-[#676A78]">
              Visualisasi keseimbangan 5 dimensi karakter belajar.
            </p>
          </div>

          <DimensionRadar dimensions={dimensions} size={340} />
        </div>

        {/* Dimension Breakdown Cards */}
        <div className="lg:col-span-6">
          <DimensionScoreCard dimensions={dimensions} />
        </div>
      </div>

      {/* 3. Strengths & Areas to Watch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="surface-card bg-white p-6 border border-border/80 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <h3 className="text-sm font-extrabold">Karakter Belajar Unggul</h3>
          </div>
          <ul className="space-y-2 text-xs text-[#333542]">
            {(pType?.strengths || []).map((s, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges / Areas to watch */}
        <div className="surface-card bg-white p-6 border border-border/80 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-700">
            <Lightbulb className="w-4 h-4 shrink-0" />
            <h3 className="text-sm font-extrabold">Area yang Perlu Diperhatikan</h3>
          </div>
          <ul className="space-y-2 text-xs text-[#333542]">
            {(pType?.challenges || []).map((c, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Learning Preferences, Communication & Motivation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card bg-white p-5 border border-border/80 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-2 text-[#6C5CE7]">
            <BookOpen className="w-4 h-4" />
            <h4 className="text-xs font-bold text-[#17181C]">Gaya Belajar Utama</h4>
          </div>
          <p className="text-xs text-[#676A78] leading-relaxed">
            {pType?.learning_style}
          </p>
        </div>

        <div className="surface-card bg-white p-5 border border-border/80 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-2 text-[#6C5CE7]">
            <Users className="w-4 h-4" />
            <h4 className="text-xs font-bold text-[#17181C]">Gaya Komunikasi</h4>
          </div>
          <p className="text-xs text-[#676A78] leading-relaxed">
            {pType?.communication_style}
          </p>
        </div>

        <div className="surface-card bg-white p-5 border border-border/80 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-2 text-[#6C5CE7]">
            <Sparkles className="w-4 h-4" />
            <h4 className="text-xs font-bold text-[#17181C]">Faktor Motivasi</h4>
          </div>
          <p className="text-xs text-[#676A78] leading-relaxed">
            {pType?.motivation}
          </p>
        </div>
      </div>

      {/* 5. Recommended Study Method & Subjects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Recommended Study Methods */}
        <div className="surface-card bg-white p-6 border border-border/80 rounded-2xl shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-[#17181C]">
            Pendekatan Belajar yang Direkomendasikan
          </h3>
          <div className="space-y-2">
            {(pType?.recommended_study_method || []).map((method, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#F4F5FB] text-xs font-medium text-[#17181C]"
              >
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Subjects */}
        <div className="surface-card bg-white p-6 border border-border/80 rounded-2xl shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-[#17181C]">
            Kesesuaian Bidang Studi
          </h3>
          <div className="flex flex-wrap gap-2">
            {(pType?.recommended_subjects || []).map((subj, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold"
              >
                {subj}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Recommended Tutor Characteristics */}
      <div className="surface-card bg-white p-6 border border-border/80 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#6C5CE7]" />
          <h3 className="text-sm font-extrabold text-[#17181C]">
            Karakteristik Tutor yang Cocok untuk Siswa
          </h3>
        </div>
        <p className="text-xs text-[#676A78]">
          Profil ini menjadi acuan sistem dalam mencocokkan tutor privat yang memiliki metode mengajar seirama dengan kebutuhan siswa.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {(pType?.recommended_tutor_style || []).map((style, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-border/80 bg-[#F9FAFD] text-xs text-[#333542] leading-relaxed"
            >
              {style}
            </div>
          ))}
        </div>
      </div>

      {/* 7. Action Bar (PDF, Search Tutor, Retake) */}
      <div className="p-6 rounded-2xl bg-white border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* PDF Reports Link */}
          <button
            type="button"
            onClick={() => navigate('/student/reports')}
            className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-[#17181C] bg-[#F4F5FB] hover:bg-[#EAEBF0] transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <Download className="w-4 h-4 text-[#6C5CE7]" />
            <span>Dokumen Laporan PDF</span>
          </button>

          {/* Cari Tutor (Placeholder Phase 4) */}
          <button
            type="button"
            onClick={() => navigate('/student/tutors')}
            className="px-4 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-sm flex items-center gap-2 min-h-[42px]"
          >
            <Search className="w-4 h-4" />
            <span>Cari Tutor yang Cocok</span>
          </button>
        </div>

        {/* Retake Assessment Link */}
        <button
          type="button"
          onClick={() => navigate('/student/assessment')}
          className="text-xs font-bold text-[#676A78] hover:text-[#17181C] flex items-center gap-1.5 py-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ambil Ulang Asesmen</span>
        </button>
      </div>

      {/* 8. Psychological Safety Disclaimer */}
      <div className="p-4 rounded-xl bg-[#F9FAFD] border border-border text-[11px] text-[#676A78] leading-relaxed text-center">
        Pemberitahuan: Hasil assessment ini ditujukan untuk membantu pengenalan diri dan pengembangan strategi belajar. Assessment ini bukan diagnosis medis atau psikologis dan tidak menggantikan evaluasi profesional.
      </div>
    </div>
  )
}
