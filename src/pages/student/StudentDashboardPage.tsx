import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Brain,
  Compass,
  BookOpen,
  TrendingUp,
  ShieldAlert,
  Library,
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
      {/* Profile Error Banner if any */}
      {profileError && (
        <div className="surface-card p-4 bg-[#FDECEC] border-[#E96A6A]/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[#C64848]">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
          <button
            type="button"
            onClick={refreshAccount}
            className="text-xs font-bold text-[#E96A6A] hover:underline shrink-0"
          >
            Coba Muat Ulang
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={`Selamat datang, ${studentName}!`}
        subtitle={`Hari ini adalah ${todayStr}. Pantau perkembangan belajar dan jadwal les privat Anda di sini.`}
        badge="Siswa"
        action={
          activeSession ? (
            <Link
              to={`/student/assessment/${activeSession.id}`}
              className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold shadow-sm hover:bg-[#102342] transition-colors"
            >
              Lanjutkan Asesmen
            </Link>
          ) : latestResult ? (
            <Link
              to="/student/personality"
              className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold shadow-sm hover:bg-[#102342] transition-colors"
            >
              Lihat Hasil Asesmen
            </Link>
          ) : (
            <Link
              to="/student/assessment"
              className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold shadow-sm hover:bg-[#102342] transition-colors"
            >
              Mulai Asesmen Karakter
            </Link>
          )
        }
      />

      {/* Announcement Banner (Audience: Students) */}
      <AnnouncementBanner audience="students" />

      {/* Profile Completion Indicator */}
      <ProfileCompletionCard />

      {/* 4 Honest Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                className="text-[#183058] font-bold hover:underline"
              >
                Lanjutkan
              </Link>
            ) : latestResult ? (
              <Link
                to="/student/personality"
                className="text-[#45B97C] font-bold hover:underline"
              >
                Lihat Hasil
              </Link>
            ) : (
              <Link
                to="/student/assessment"
                className="text-[#183058] font-bold hover:underline"
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
                className="text-[#B87A14] font-bold hover:underline"
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
              className="text-[#45B97C] font-bold hover:underline"
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

      {/* Main Grid: Upcoming Lessons & Learning Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Upcoming Lessons & Monthly Report */}
        <div className="lg:col-span-7 space-y-6">
          <UpcomingLessonCard />
          <MonthlyReportCard />
        </div>

        {/* Right column: Streak, Personality Insight & Progress Card */}
        <div className="lg:col-span-5 space-y-6">
          {streak && <StreakCard streak={streak} />}

          <div className="surface-card p-5 border border-border flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#17181C]">Modul & Kursus Mandiri</h4>
              <p className="text-xs text-[#8A8D9A] mt-0.5">Jelajahi materi, kuis, dan raih sertifikat kelulusan.</p>
            </div>
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] transition-colors shrink-0 shadow-sm min-h-[40px]"
            >
              <Library className="w-3.5 h-3.5" />
              Buka Kursus
            </Link>
          </div>

          <PersonalityCard />
          <ProgressCard />
        </div>
      </div>
    </AppShell>
  )
}
