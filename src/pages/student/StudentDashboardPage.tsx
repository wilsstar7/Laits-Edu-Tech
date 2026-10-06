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
import type { StudentStreak } from '@/types/engagement'
import { formatLongDate, getFirstName } from '@/utils/format'

export function StudentDashboardPage() {
  const { profile, profileError, refreshAccount } = useAuth()
  const [streak, setStreak] = useState<StudentStreak | null>(null)

  useEffect(() => {
    let mounted = true
    getStreak().then((res) => {
      if (mounted && res) setStreak(res)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const studentName = profile?.full_name ? getFirstName(profile.full_name) : 'Siswa'
  const todayStr = formatLongDate(new Date())

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
          <Link
            to="/student/assessment"
            className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-sm hover:bg-[#5243D6] transition-colors"
          >
            Mulai Asesmen Karakter
          </Link>
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
          value="Belum ada"
          description="Kuesioner gaya belajar"
          icon={Brain}
          iconBg="bg-[#EFEDFD]"
          iconColor="text-[#6C5CE7]"
          action={
            <Link
              to="/student/assessment"
              className="text-[#6C5CE7] font-bold hover:underline"
            >
              Mulai Tes
            </Link>
          }
        />

        <StatCard
          label="Tipe Kepribadian"
          value="Belum ada"
          description="Selesaikan asesmen"
          icon={Compass}
          iconBg="bg-[#FDF4E2]"
          iconColor="text-[#B87A14]"
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
          iconBg="bg-[#EFEDFD]"
          iconColor="text-[#6C5CE7]"
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

          <div className="surface-card p-5 border-l-4 border-l-[#6C5CE7] flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#17181C]">Modul & Kursus Mandiri</h4>
              <p className="text-xs text-[#8A8D9A] mt-0.5">Jelajahi materi, kuis, dan raih sertifikat kelulusan.</p>
            </div>
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold hover:bg-[#5243D6] transition-colors shrink-0 shadow-sm"
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
