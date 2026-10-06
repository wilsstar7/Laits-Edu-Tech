import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { StreakCard } from '@/components/learning/StreakCard'
import { engagementService } from '@/services/engagementService'
import type { Achievement, Certificate, StudentStreak } from '@/types/engagement'
import {
  Award,
  CheckCircle2,
  Lock,
  ExternalLink,
  Copy,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function StudentAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [streak, setStreak] = useState<StudentStreak>({ studentId: '', currentStreak: 0, longestStreak: 0, lastActivityDate: null })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'achievements' | 'certificates'>('achievements')

  useEffect(() => {
    let isMounted = true
    Promise.all([
      engagementService.getAchievements(),
      engagementService.getCertificates(),
      engagementService.getStreak(),
    ]).then(([achData, certData, streakData]) => {
      if (isMounted) {
        setAchievements(achData)
        setCertificates(certData)
        setStreak(streakData)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const earnedAchievements = achievements.filter((a) => a.isEarned)

  const handleCopyVerification = (certNumber: string) => {
    const url = `${window.location.origin}/certificate/${certNumber}`
    navigator.clipboard.writeText(url)
    toast.success('Tautan verifikasi sertifikat berhasil disalin!')
  }

  return (
    <AppShell>
      <PageHeader
        title="Pencapaian & Sertifikasi"
        subtitle="Apresiasi hasil belajar, rekor konsistensi, lencana reputasi, dan sertifikat resmi."
        badge="Penghargaan"
      />

      {/* Top Streak summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
          <StreakCard streak={streak} />
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-border/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#17181C]">Reputasi Akademik</h3>
            <p className="text-xs text-[#676A78]">
              {earnedAchievements.length} dari {achievements.length} Lencana Terbuka &bull; {certificates.length} Sertifikat Terbit
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60">
              <span className="text-amber-800 text-[11px] block">Lencana Diraih</span>
              <strong className="text-base font-extrabold text-amber-900 block mt-0.5">{earnedAchievements.length}</strong>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200/60">
              <span className="text-purple-800 text-[11px] block">Sertifikat Resmi</span>
              <strong className="text-base font-extrabold text-purple-900 block mt-0.5">{certificates.length}</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#F4F5FB] border border-border col-span-2 sm:col-span-1">
              <span className="text-[#8A8D9A] text-[11px] block">Status Belajar</span>
              <strong className="text-base font-extrabold text-[#17181C] block mt-0.5">Aktif</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <button
          type="button"
          onClick={() => setTab('achievements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'achievements'
              ? 'bg-[#6C5CE7] text-white shadow-xs'
              : 'text-[#676A78] hover:text-[#17181C] hover:bg-[#EEF0F8]'
          }`}
        >
          Lencana & Prestasi ({achievements.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('certificates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'certificates'
              ? 'bg-[#6C5CE7] text-white shadow-xs'
              : 'text-[#676A78] hover:text-[#17181C] hover:bg-[#EEF0F8]'
          }`}
        >
          Sertifikat Kelulusan ({certificates.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
          <p className="text-xs text-[#8A8D9A]">Memuat daftar pencapaian...</p>
        </div>
      ) : tab === 'achievements' ? (
        /* Achievements Grid */
        achievements.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-12 text-center text-xs text-[#8A8D9A]">
            Belum ada data lencana yang dikonfigurasi.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between space-y-3 ${
                  ach.isEarned
                    ? 'bg-white border-[#6C5CE7]/30 shadow-xs'
                    : 'bg-[#F9FAFD] border-border/70 opacity-75'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    ach.isEarned
                      ? 'bg-gradient-to-tr from-[#6C5CE7] to-[#8F7FF7] text-white shadow-md shadow-[#6C5CE7]/20 ring-2 ring-white'
                      : 'bg-[#EEF0F8] text-[#8A8D9A]'
                  }`}
                >
                  {ach.isEarned ? <Award className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#17181C]">{ach.name}</h4>
                  <p className="text-xs text-[#676A78] leading-relaxed">{ach.description}</p>
                </div>

                <div className="pt-2 w-full border-t border-border/60">
                  {ach.isEarned ? (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Diraih
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#8A8D9A] bg-[#EEF0F8] px-2.5 py-1 rounded-full block">
                      Terkunci
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Certificates List */
        certificates.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-[#17181C]">Belum Ada Sertifikat Kelulusan</h4>
            <p className="text-xs text-[#676A78] max-w-sm mx-auto">
              Selesaikan 100% materi pelajaran dan lulus seluruh kuis kursus untuk mendapatkan sertifikat resmi.
            </p>
            <Link to="/student/courses">
              <Button variant="default" size="sm" className="rounded-xl text-xs bg-[#6C5CE7] text-white">
                Mulai Belajar Kursus
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-3xl border border-border/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80">
                    Sertifikat Sah
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-semibold text-[#6C5CE7]">
                    {cert.certificateNumber}
                  </span>
                  <h4 className="font-bold text-base text-[#17181C]">
                    {cert.course?.title || 'Sertifikat Kelulusan Kursus'}
                  </h4>
                  <p className="text-xs text-[#676A78]">
                    Diberikan kepada: <strong>{cert.student?.fullName || 'Siswa'}</strong>
                  </p>
                  <p className="text-[11px] text-[#8A8D9A]">
                    Diterbitkan: {new Date(cert.issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyVerification(cert.certificateNumber)}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Tautan</span>
                  </Button>

                  <Link to={`/certificate/${cert.certificateNumber}`} target="_blank">
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold gap-1.5"
                    >
                      <span>Verifikasi Publik</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </AppShell>
  )
}
