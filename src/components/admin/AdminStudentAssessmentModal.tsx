import { useEffect, useState } from 'react'
import {
  X,
  User,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  GraduationCap,
  Compass,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { adminService, type AdminStudentAssessmentDetail } from '@/services/adminService'
import { formatReportDate } from '@/utils/format'

interface AdminStudentAssessmentModalProps {
  resultId: string | null
  onClose: () => void
}

export function AdminStudentAssessmentModal({
  resultId,
  onClose,
}: AdminStudentAssessmentModalProps) {
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<AdminStudentAssessmentDetail | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!resultId) return
    let isMounted = true

    async function loadData() {
      setLoading(true)
      setErrorMsg(null)
      try {
        const data = await adminService.getStudentAssessmentDetail(resultId!)
        if (isMounted) {
          if (!data) {
            setErrorMsg('Data asesmen tidak ditemukan.')
          } else {
            setDetail(data)
          }
        }
      } catch (err) {
        console.error('Failed to load assessment detail:', err)
        if (isMounted) {
          setErrorMsg('Gagal memuat detail asesmen siswa.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      isMounted = false
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [resultId, onClose])

  if (!resultId) return null

  const parseArray = (data: unknown): string[] => {
    if (Array.isArray(data)) {
      return data.map((item) => (typeof item === 'string' ? item : String(item?.title || item?.name || item)))
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed.map((item) => (typeof item === 'string' ? item : String(item?.title || item?.name || item)))
        }
      } catch {
        return [data]
      }
    }
    return []
  }

  const pType = detail?.result.personality_type
  const strengths = parseArray(pType?.strengths)
  const challenges = parseArray(pType?.challenges)
  const studyMethods = parseArray(pType?.recommended_study_method)
  const subjects = parseArray(pType?.recommended_subjects)
  const tutorStyles = parseArray(pType?.recommended_tutor_style)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl border border-border shadow-xl overflow-hidden my-auto animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-[#F4F5FB]/70 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#6C5CE7]" />
              <h2 id="modal-title" className="text-base font-extrabold text-[#17181C]">
                Data Profil & Asesmen Belajar Siswa
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFEDFD] text-[#6C5CE7]">
                Mega Admin Mode
              </span>
            </div>
            <p className="text-xs text-[#676A78]">
              Pemeriksaan data terstruktur langsung dari database tanpa membuat berkas PDF.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela"
            className="p-2 rounded-xl text-[#676A78] hover:text-[#17181C] hover:bg-black/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#6C5CE7]" />
              <p className="text-xs text-[#676A78]">Memuat data profil asesmen dari database...</p>
            </div>
          ) : errorMsg || !detail ? (
            <div className="py-12 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-[#E96A6A] mx-auto" />
              <p className="text-xs text-[#E96A6A] font-semibold">{errorMsg || 'Data tidak tersedia.'}</p>
            </div>
          ) : (
            <>
              {/* Student Metadata Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F4F5FB] border border-border/70 text-xs">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[#6C5CE7] shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#676A78] font-bold uppercase tracking-wider">Nama Siswa</p>
                    <p className="font-bold text-[#17181C] truncate">{detail.student.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-[#45B97C] shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#676A78] font-bold uppercase tracking-wider">Email Akun</p>
                    <p className="font-semibold text-[#17181C] truncate">{detail.student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#F2B84B] shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#676A78] font-bold uppercase tracking-wider">Tanggal Selesai</p>
                    <p className="font-semibold text-[#17181C]">{formatReportDate(detail.result.completed_at)}</p>
                  </div>
                </div>
              </div>

              {/* Personality Type Highlight */}
              {pType && (
                <div className="p-5 rounded-2xl border border-[#6C5CE7]/30 bg-gradient-to-br from-[#EFEDFD]/60 to-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#6C5CE7] text-white">
                      TIPE: {pType.code}
                    </span>
                    <span className="text-xs text-[#676A78]">Skor Keseluruhan: {detail.result.overall_score}%</span>
                  </div>
                  <h3 className="text-lg font-black text-[#17181C]">{pType.name}</h3>
                  <p className="text-xs text-[#1D1D24] leading-relaxed">{pType.description}</p>
                </div>
              )}

              {/* Dimensions Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#676A78] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#6C5CE7]" />
                  <span>Dimensi Kepribadian & Gaya Belajar</span>
                </h4>

                <div className="space-y-3">
                  {(detail.result.dimensions ?? []).map((dim) => {
                    const pct = Math.min(100, Math.max(0, Math.round(dim.normalized_score)))
                    const dimName = dim.dimension?.name || 'Dimensi'
                    const dimDesc = dim.dimension?.description
                    return (
                      <div
                        key={dim.id}
                        className="p-3.5 rounded-xl border border-border/80 bg-white space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#17181C]">{dimName}</span>
                          <span className="font-extrabold text-[#6C5CE7]">{pct}%</span>
                        </div>
                        <div className="w-full bg-[#F4F5FB] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#6C5CE7] h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {dimDesc && (
                          <p className="text-[11px] text-[#676A78] leading-normal pt-0.5">
                            {dimDesc}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Strengths & Development Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl border border-border/80 bg-white space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#45B97C] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kekuatan Utama Siswa</span>
                  </h4>
                  {strengths.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-[#1D1D24]">
                      {strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#45B97C] font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#676A78]">Data kekuatan belum tersedia.</p>
                  )}
                </div>

                {/* Challenges / Development Areas */}
                <div className="p-4 rounded-xl border border-border/80 bg-white space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#F2B84B] flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    <span>Area Pengembangan Potensial</span>
                  </h4>
                  {challenges.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-[#1D1D24]">
                      {challenges.map((ch, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#F2B84B] font-bold">•</span>
                          <span>{ch}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#676A78]">Data area pengembangan belum tersedia.</p>
                  )}
                </div>
              </div>

              {/* Learning Profile Details */}
              {pType && (
                <div className="p-4 rounded-xl border border-border/80 bg-[#F4F5FB]/70 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#17181C]">
                    Preferensi & Karakteristik Belajar
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {pType.learning_style && (
                      <div className="p-3 bg-white rounded-lg border border-border/60">
                        <p className="text-[10px] text-[#676A78] font-bold uppercase">Gaya Belajar</p>
                        <p className="text-[#17181C] mt-0.5">{pType.learning_style}</p>
                      </div>
                    )}
                    {pType.motivation && (
                      <div className="p-3 bg-white rounded-lg border border-border/60">
                        <p className="text-[10px] text-[#676A78] font-bold uppercase">Faktor Motivasi</p>
                        <p className="text-[#17181C] mt-0.5">{pType.motivation}</p>
                      </div>
                    )}
                    {pType.communication_style && (
                      <div className="p-3 bg-white rounded-lg border border-border/60">
                        <p className="text-[10px] text-[#676A78] font-bold uppercase">Gaya Komunikasi</p>
                        <p className="text-[#17181C] mt-0.5">{pType.communication_style}</p>
                      </div>
                    )}
                    {studyMethods.length > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-border/60">
                        <p className="text-[10px] text-[#676A78] font-bold uppercase">Metode Belajar Disarankan</p>
                        <p className="text-[#17181C] mt-0.5">{studyMethods.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Subjects & Tutor Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.length > 0 && (
                  <div className="p-4 rounded-xl border border-border/80 bg-white space-y-2">
                    <p className="text-[10px] text-[#676A78] font-bold uppercase tracking-wider">
                      Rekomendasi Bidang Studi
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {subjects.map((subj, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#EFEDFD] text-[#6C5CE7] text-xs font-semibold"
                        >
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tutorStyles.length > 0 && (
                  <div className="p-4 rounded-xl border border-border/80 bg-white space-y-2">
                    <p className="text-[10px] text-[#676A78] font-bold uppercase tracking-wider">
                      Gaya Tutor yang Cocok
                    </p>
                    <ul className="space-y-1 text-xs text-[#1D1D24]">
                      {tutorStyles.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#45B97C] font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Psychological Safety Notice */}
              <div className="p-3.5 rounded-xl bg-[#F4F5FB] border border-border/80 flex items-start gap-2.5 text-[11px] text-[#676A78] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#45B97C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#17181C]">Catatan Edukatif: </span>
                  Hasil asesmen ini ditujukan untuk membantu pengenalan diri dan pengembangan strategi belajar siswa. Data ini bukan diagnosis medis atau psikologis dan tidak menggantikan evaluasi profesional.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-border/80 bg-[#F4F5FB]/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-border text-xs font-bold text-[#17181C] hover:bg-[#EEF0F8] transition-colors min-h-[44px]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
