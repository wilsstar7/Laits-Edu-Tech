import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Clock,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  History,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { assessmentService } from '@/services/assessmentService'
import { assessmentSessionService } from '@/services/assessmentSessionService'
import { personalityService } from '@/services/personalityService'
import type { Assessment, AssessmentSession, AssessmentResult } from '@/types/assessment'
import { formatLongDate } from '@/utils/format'

export function AssessmentIntroPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [activeSession, setActiveSession] = useState<AssessmentSession | null>(null)
  const [latestResult, setLatestResult] = useState<AssessmentResult | null>(null)
  const [history, setHistory] = useState<AssessmentResult[]>([])
  const [consentChecked, setConsentChecked] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function loadAssessmentState() {
      if (!user) return
      setLoading(true)
      setErrorMsg(null)

      try {
        const activeAsm = await assessmentService.getActiveAssessment()
        setAssessment(activeAsm)

        if (activeAsm) {
          const [session, result, userHistory] = await Promise.all([
            assessmentSessionService.getActiveSession(user.id, activeAsm.id),
            personalityService.getLatestResult(user.id),
            personalityService.getHistory(user.id),
          ])

          setActiveSession(session)
          setLatestResult(result)
          setHistory(userHistory)
        }
      } catch (err) {
        console.error('Failed to load assessment data:', err)
        setErrorMsg('Gagal memuat informasi asesmen. Silakan muat ulang halaman.')
      } finally {
        setLoading(false)
      }
    }

    loadAssessmentState()
  }, [user])

  const handleStart = async () => {
    if (!user || !assessment) return
    if (!consentChecked && !activeSession) return

    setActionLoading(true)
    setErrorMsg(null)

    try {
      if (activeSession) {
        // Resume existing in_progress session
        navigate(`/student/assessment/${activeSession.id}`)
      } else {
        // Create new session with consent timestamp
        const newSession = await assessmentSessionService.startNewSession(
          user.id,
          assessment.id
        )
        navigate(`/student/assessment/${newSession.id}`)
      }
    } catch (err) {
      console.error('Error starting assessment:', err)
      setErrorMsg('Gagal memulai sesi asesmen. Silakan coba kembali.')
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
        <p className="text-xs text-[#676A78]">Memuat informasi asesmen...</p>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#EAEBF0] text-[#676A78] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold text-[#17181C]">
          Belum ada asesmen yang tersedia
        </h1>
        <p className="text-xs text-[#676A78]">
          Asesmen kepribadian belajar sedang disiapkan oleh tim kurikulum. Silakan periksa kembali nanti.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Page Title */}
      <div className="space-y-1.5 text-center sm:text-left">
        <span className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider">
          Asesmen Karakter & Gaya Belajar
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17181C] tracking-tight">
          {assessment.name}
        </h1>
        <p className="text-xs sm:text-sm text-[#676A78] max-w-2xl">
          {assessment.description}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* State A: Student has a completed result */}
      {latestResult && !activeSession && (
        <div className="surface-card bg-emerald-50/60 border border-emerald-200 p-6 rounded-2xl space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Asesmen Telah Selesai
                </span>
                <h2 className="text-lg font-extrabold text-emerald-950">
                  {latestResult.personality_type?.name || 'Profil Belajar Ditemukan'}
                </h2>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Diselesaikan pada {formatLongDate(new Date(latestResult.completed_at))}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/student/personality')}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm min-h-[42px]"
            >
              Lihat Hasil Profil
            </button>
          </div>
        </div>
      )}

      {/* State B: In-progress session resume banner */}
      {activeSession && (
        <div className="surface-card bg-[#FDF4E2] border border-[#F2B84B]/60 p-6 rounded-2xl space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#92580E] uppercase tracking-wide">
                Sesi Belum Selesai
              </span>
              <h2 className="text-base font-extrabold text-[#17181C]">
                Anda memiliki progres asesmen yang tersimpan
              </h2>
              <p className="text-xs text-[#676A78]">
                Lanjutkan pengerjaan mulai dari pertanyaan terakhir yang telah Anda simpan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStart}
              disabled={actionLoading}
              className="px-6 py-3 rounded-xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/20 transition-all flex items-center gap-2 min-h-[44px]"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Lanjutkan Asesmen</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Assessment Info Card */}
      <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 rounded-2xl space-y-6">
        <h2 className="text-base font-extrabold text-[#17181C]">
          Panduan Pengerjaan
        </h2>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#F4F5FB] border border-border/60 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#6C5CE7] shrink-0" />
            <div>
              <p className="text-[11px] text-[#676A78]">Estimasi Waktu</p>
              <p className="text-xs font-bold text-[#17181C]">
                ± {assessment.estimated_minutes} Menit
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4F5FB] border border-border/60 flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-[#6C5CE7] shrink-0" />
            <div>
              <p className="text-[11px] text-[#676A78]">Format Soal</p>
              <p className="text-xs font-bold text-[#17181C]">
                20 Pernyataan Reflektif
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4F5FB] border border-border/60 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[11px] text-[#676A78]">Tipe Jawaban</p>
              <p className="text-xs font-bold text-[#17181C]">
                Skala Likert (1 - 5)
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-xs text-[#333542] leading-relaxed">
          <p className="font-bold text-[#17181C]">Instruksi Khusus:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#676A78]">
            <li>Tidak ada jawaban benar atau salah. Pilihlah jawaban yang paling jujur menggambarkan diri Anda.</li>
            <li>Setiap jawaban yang Anda pilih otomatis tersimpan ke server secara berkala.</li>
            <li>Anda dapat kembali ke pertanyaan sebelumnya jika ingin memperbaiki pilihan jawaban.</li>
          </ul>
        </div>

        {/* Psychological Safety Disclaimer */}
        <div className="p-4 rounded-xl bg-[#F9FAFD] border border-border text-xs text-[#676A78] space-y-1.5">
          <p className="font-bold text-[#17181C]">Pemberitahuan & Pernyataan:</p>
          <p className="leading-relaxed">
            Hasil assessment ini ditujukan untuk membantu pengenalan diri dan pengembangan strategi belajar. Assessment ini bukan diagnosis medis atau psikologis dan tidak menggantikan evaluasi profesional.
          </p>
        </div>

        {/* Consent Checkbox (only required for starting a new attempt) */}
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
                Saya memahami bahwa assessment ini digunakan untuk pengenalan diri dan pengembangan pembelajaran, bukan diagnosis psikologis atau medis.
              </span>
            </label>
          </div>
        )}

        {/* Action Button */}
        {!activeSession && (
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-[#676A78]">
              {consentChecked
                ? 'Persetujuan terverifikasi. Anda siap memulai.'
                : 'Beri tanda centang pada pernyataan persetujuan untuk memulai.'}
            </p>

            <button
              type="button"
              onClick={handleStart}
              disabled={!consentChecked || actionLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[46px]"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyiapkan Sesi...</span>
                </>
              ) : latestResult ? (
                <span>Ambil Ulang Asesmen</span>
              ) : (
                <span>Mulai Asesmen</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* History section if available */}
      {history.length > 0 && (
        <div className="surface-card bg-white p-6 border border-border/80 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#6C5CE7]" />
            <h3 className="text-xs font-bold text-[#17181C] uppercase tracking-wider">
              Riwayat Asesmen Anda ({history.length})
            </h3>
          </div>

          <div className="divide-y divide-border/60">
            {history.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#17181C]">
                    {item.personality_type?.name || 'Hasil Asesmen'}
                  </p>
                  <p className="text-[11px] text-[#676A78]">
                    {formatLongDate(new Date(item.completed_at))}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/student/personality/${item.id}`)}
                  className="px-3 py-1.5 rounded-lg border border-border text-[#6C5CE7] font-bold hover:bg-[#6C5CE7]/5 transition-colors"
                >
                  Lihat Hasil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
