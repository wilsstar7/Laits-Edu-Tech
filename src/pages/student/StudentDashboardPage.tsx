import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Brain,
  Compass,
  BookOpen,
  TrendingUp,
  ShieldAlert,
  Library,
  ArrowRight,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard'
import { UpcomingLessonCard } from '@/components/dashboard/UpcomingLessonCard'
import { PersonalityCard } from '@/components/dashboard/PersonalityCard'
import { MonthlyReportCard } from '@/components/dashboard/MonthlyReportCard'
import { ProgressCard } from '@/components/dashboard/ProgressCard'
import { AnnouncementBanner } from '@/components/learning/AnnouncementBanner'
import { StreakCard } from '@/components/learning/StreakCard'
import { useAuth } from '@/hooks/useAuth'
import { getStreak } from '@/services/engagementService'
import { personalityService } from '@/services/personalityService'
import { assessmentSessionService } from '@/services/assessmentSessionService'
import { PRIMARY_ASSESSMENT_ID } from '@/services/assessmentService'
import type { StudentStreak } from '@/types/engagement'
import type { AssessmentResult, AssessmentSession } from '@/types/assessment'
import { formatLongDate, getFirstName } from '@/utils/format'

function getPersonalityCardMetric(result: AssessmentResult | null): {
  value: string
  description: string
  badge?: string
} {
  if (!result) {
    return {
      value: 'Belum ada',
      description: 'Selesaikan asesmen',
    }
  }

  const isPotential =
    result.package_code === 'PAKET_2_PERSONA_POTENTIAL' || Boolean(result.potential_result)

  if (isPotential && result.potential_result) {
    const mbti = result.potential_result.paket_2_modules.PP_MBTI_02
    return {
      value: mbti.personality_code,
      description: mbti.nickname || mbti.title,
      badge: 'Paket 2',
    }
  }

  if (result.modality_result) {
    const vak = result.modality_result.modules.PM_VAK_01
    const modalityLabelMap: Record<string, string> = {
      VISUAL: 'Visual',
      AUDITORY: 'Auditori',
      KINESTHETIC: 'Kinestetik',
      MULTIMODAL: 'Multimodal',
    }
    return {
      value: modalityLabelMap[vak.primary_modality] || vak.title,
      description: vak.title,
      badge: 'Paket 1',
    }
  }

  if (result.personality_type) {
    return {
      value: result.personality_type.code || result.personality_type.name,
      description: result.personality_type.name,
    }
  }

  return {
    value: 'Terverifikasi',
    description: 'Profil pembelajar siap',
  }
}

export function StudentDashboardPage() {
  const { user, profile, profileError, refreshAccount } = useAuth()
  const [streak, setStreak] = useState<StudentStreak | null>(null)
  const [latestResult, setLatestResult] = useState<AssessmentResult | null>(null)
  const [activeSession, setActiveSession] = useState<AssessmentSession | null>(null)

  useEffect(() => {
    let mounted = true
    if (!user) return
    getStreak(user.id).then((res) => {
      if (mounted && res) setStreak(res)
    }).catch(() => {})
    return () => { mounted = false }
  }, [user])

  useEffect(() => {
    let mounted = true
    async function loadAssessmentState() {
      if (!user) return
      try {
        const [session, result] = await Promise.all([
          assessmentSessionService.getActiveSession(user.id, PRIMARY_ASSESSMENT_ID),
          personalityService.getLatestResult(user.id),
        ])
        if (mounted) {
          setActiveSession(session)
          setLatestResult(result)
        }
      } catch (err) {
        console.error('Failed to load assessment status for dashboard:', err)
      }
    }
    loadAssessmentState()
    return () => { mounted = false }
  }, [user])

  const studentName = profile?.full_name ? getFirstName(profile.full_name) : 'Siswa'
  const todayStr = formatLongDate(new Date())

  const statusValue = activeSession
    ? 'Berjalan'
    : latestResult
    ? 'Selesai'
    : 'Belum ada'

  const statusDescription = activeSession
    ? `Jenjang ${activeSession.student_level || 'SMA'} belum selesai`
    : latestResult
    ? `${
        latestResult.package_code === 'PAKET_2_PERSONA_POTENTIAL'
          ? 'Paket 2: Persona Potential'
          : 'Paket 1: Persona Modality'
      } (${latestResult.student_level || 'SMA'})`
    : 'Kuesioner gaya belajar'

  const personalityMetric = getPersonalityCardMetric(latestResult)

  return (
    <AppShell>
      {profileError && (
        <div className="surface-card p-4 bg-[#FDECEC] border-[#E96A6A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 text-xs text-[#C64848]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
            <span>{profileError}</span>
          </div>
          <button
            type="button"
            onClick={refreshAccount}
            className="min-h-[44px] px-3 rounded-xl bg-white/80 text-xs font-bold text-[#C64848] hover:underline shrink-0 self-start sm:self-center cursor-pointer"
          >
            Coba Muat Ulang
          </button>
        </div>
      )}

      <PageHeader
        title={`Selamat datang, ${studentName}`}
        subtitle={`Hari ini adalah ${todayStr}. Pantau perkembangan belajar dan jadwal les privat Anda di sini.`}
        badge="Siswa"
        action={
          activeSession ? (
            <Link
              to={`/student/assessment/${activeSession.id}`}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] active:scale-[0.98] transition-colors"
            >
              <span>Lanjutkan Asesmen</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : latestResult ? (
            <Link
              to="/student/personality"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] active:scale-[0.98] transition-colors"
            >
              <span>Lihat Hasil Asesmen</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : (
            <Link
              to="/student/assessment"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] active:scale-[0.98] transition-colors"
            >
              <span>Mulai Asesmen Karakter</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          )
        }
      />

      <AnnouncementBanner audience="students" />

      <ProfileCompletionCard />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-5">
        <StatCard
          label="Status Asesmen"
          value={statusValue}
          description={statusDescription}
          icon={Brain}
          iconBg={latestResult && !activeSession ? 'bg-[#E6F6EE]' : 'bg-[#E8ECF6]'}
          iconColor={latestResult && !activeSession ? 'text-[#45B97C]' : 'text-[#183058]'}
          action={
            activeSession ? (
              <Link
                to={`/student/assessment/${activeSession.id}`}
                className="min-h-[44px] inline-flex items-center text-[#183058] font-bold hover:underline"
              >
                Lanjutkan
              </Link>
            ) : latestResult ? (
              <Link
                to="/student/personality"
                className="min-h-[44px] inline-flex items-center text-[#45B97C] font-bold hover:underline"
              >
                Lihat Hasil
              </Link>
            ) : (
              <Link
                to="/student/assessment"
                className="min-h-[44px] inline-flex items-center text-[#183058] font-bold hover:underline"
              >
                Mulai Tes
              </Link>
            )
          }
        />

        <StatCard
          label="Tipe Kepribadian"
          value={personalityMetric.value}
          badge={personalityMetric.badge}
          description={personalityMetric.description}
          icon={Compass}
          iconBg="bg-[#FDF4E2]"
          iconColor="text-[#B87A14]"
          action={
            latestResult ? (
              <Link
                to="/student/personality"
                className="min-h-[44px] inline-flex items-center text-[#B87A14] font-bold hover:underline"
              >
                Detail Profil
              </Link>
            ) : undefined
          }
        />

        <StatCard
          label="Sesi Belajar Aktif"
          value="0"
          description="Belum ada bimbingan aktif"
          icon={BookOpen}
          iconBg="bg-[#E6F6EE]"
          iconColor="text-[#45B97C]"
          action={
            <Link
              to="/student/tutors"
              className="min-h-[44px] inline-flex items-center text-[#45B97C] font-bold hover:underline"
            >
              Cari Tutor
            </Link>
          }
        />

        <StatCard
          label="Progres Belajar"
          value="0%"
          description="Target mingguan"
          icon={TrendingUp}
          iconBg="bg-[#E8ECF6]"
          iconColor="text-[#183058]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="order-2 lg:order-1 lg:col-span-7 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] lg:grid-cols-1 gap-5 sm:gap-6">
          <UpcomingLessonCard />
          <MonthlyReportCard />
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5 space-y-5 sm:space-y-6">
          {streak && <StreakCard streak={streak} />}

          <PersonalityCard />

          <div className="surface-card p-4 sm:p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <h4 className="text-sm font-bold text-[#17181C]">Modul &amp; Kursus Mandiri</h4>
              <p className="text-xs text-[#676A78] leading-relaxed">
                Jelajahi materi terstruktur, latihan kuis, dan raih sertifikat kelulusan.
              </p>
            </div>
            <Link
              to="/student/courses"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] active:scale-[0.98] transition-colors shrink-0 min-h-[44px] w-full sm:w-auto"
            >
              <Library className="w-4 h-4 shrink-0" />
              <span>Buka Kursus</span>
            </Link>
          </div>

          <ProgressCard />
        </div>
      </div>
    </AppShell>
  )
}
