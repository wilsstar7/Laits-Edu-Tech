import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  BookOpen,
  ArrowRight,
  FileText,
  Clock,
  Calendar,
  TrendingUp,
  Library,
  Award,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { StudentCourses } from '@/components/learning/StudentCourses'
import { StudentAchievements } from '@/components/learning/StudentAchievements'
import { LearningProfileCard } from '@/components/learning/LearningProfileCard'
import { StudyMethodsSection } from '@/components/learning/StudyMethodCard'
import { RecommendedSubjectCard } from '@/components/learning/RecommendedSubjectCard'
import { LearningPathCard } from '@/components/learning/LearningPathCard'
import { StudentProgress } from '@/components/progress/StudentProgress'
import { StudentSchedule } from '@/components/booking/StudentSchedule'
import { StudentSessionHistory } from '@/components/session/StudentSessionHistory'
import { ReportHistory } from '@/components/report/ReportHistory'
import {
  LearningProfileSkeleton,
  LearningGridSkeleton,
} from '@/components/learning/LearningSkeletons'
import { personalizedLearningService } from '@/services/personalizedLearningService'
import { learningPathService } from '@/services/learningPathService'
import { learningProgressService } from '@/services/learningProgressService'
import type {
  LearningProfileOverview,
  RecommendedSubject,
  LearningPath,
} from '@/types/learning'
import type { StudentLearningPath } from '@/types/progress'
import { Button } from '@/components/ui/button'

export function PersonalizedLearningPage() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  const currentTab = tab === 'reports' || tab === 'sessions' || tab === 'schedule' || tab === 'progress' || tab === 'courses' || tab === 'achievements' ? tab : 'learning'

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<LearningProfileOverview | null>(null)
  const [recommendedSubjects, setRecommendedSubjects] = useState<RecommendedSubject[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [enrolledPaths, setEnrolledPaths] = useState<StudentLearningPath[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'general' | 'religious'>('all')

  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    if (currentTab !== 'learning') return
    let isMounted = true

    async function loadPlan() {
      try {
        const profileData = await personalizedLearningService.getLearningProfile()
        const personalityId = profileData?.hasResult && profileData.personalityTypeId !== 'undefined'
          ? profileData.personalityTypeId || undefined
          : undefined
        const [subjects, paths, enrolled] = await Promise.all([
          personalizedLearningService.getRecommendedSubjects(personalityId),
          learningPathService.listLearningPaths(personalityId),
          learningProgressService.getEnrolledLearningPaths(),
        ])

        if (!isMounted) return
        setProfile(profileData)
        setRecommendedSubjects(subjects)
        setLearningPaths(paths)
        setEnrolledPaths(enrolled)
        setErrorMsg(null)
      } catch (error) {
        if (isMounted) {
          setErrorMsg(error instanceof Error ? error.message : 'Gagal memuat rencana belajar personal.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadPlan()
    return () => { isMounted = false }
  }, [currentTab, loadAttempt])

  const activePath = enrolledPaths.find((path) => path.status === 'in_progress') ??
    enrolledPaths.find((path) => path.status === 'not_started' || path.status === 'paused')
  const progress = Math.min(100, Math.max(0, activePath?.progressPercentage ?? 0))

  // Filter recommended subjects
  const filteredSubjects = recommendedSubjects.filter((sub) => {
    if (subjectFilter === 'all') return true
    return sub.category === subjectFilter
  })

  return (
    <AppShell>
      <PageHeader
        title="Belajar Saya"
        subtitle="Rencana belajar personal, dokumen laporan, jadwal, dan riwayat sesi bimbingan."
      />

      <nav aria-label="Bagian Belajar Saya" className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {([
          ['learning', 'Rencana Belajar Personal', BookOpen],
          ['courses', 'Kursus Belajar', Library],
          ['progress', 'Perkembangan', TrendingUp],
          ['achievements', 'Pencapaian', Award],
          ['reports', 'Laporan Belajar', FileText],
          ['schedule', 'Jadwal Belajar', Calendar],
          ['sessions', 'Riwayat Sesi', Clock],
        ] as const).map(([id, label, Icon]) => (
          <Link key={id} to={{ search: `?tab=${id}` }} aria-current={currentTab === id ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition-colors ${
              currentTab === id
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-border/70 bg-white text-ink-muted hover:bg-surface hover:text-ink-primary'
            }`}>
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      {currentTab === 'courses' ? (
        <StudentCourses />
      ) : currentTab === 'achievements' ? (
        <StudentAchievements />
      ) : currentTab === 'progress' ? (
        <StudentProgress />
      ) : currentTab === 'schedule' ? (
        <StudentSchedule />
      ) : currentTab === 'sessions' ? (
        <StudentSessionHistory />
      ) : currentTab === 'reports' ? (
        <div className="animate-in fade-in-50 duration-200">
          <ReportHistory />
        </div>
      ) : (
        /* Tab Konten 1: Rencana Belajar Personal */
        <div className="animate-in fade-in-50 duration-200">
          {loading ? (
            <div className="space-y-6">
              <LearningProfileSkeleton />
              <LearningGridSkeleton count={3} />
            </div>
          ) : errorMsg ? (
            <ErrorState
              title="Kendala Memuat Rencana Belajar"
              message={errorMsg}
              onRetry={() => {
                setLoading(true)
                setErrorMsg(null)
                setLoadAttempt((attempt) => attempt + 1)
              }}
            />
          ) : (
            <div className="space-y-8">
              {activePath && (
                <section aria-labelledby="active-learning-path"
                  className="grid min-w-0 gap-5 rounded-2xl bg-ink-primary p-5 text-white sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)] lg:items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/75">Jalur belajar aktif</p>
                    <h2 id="active-learning-path" className="mt-1 wrap-break-word text-xl font-bold tracking-tight sm:text-2xl">
                      {activePath.learningPathTitle}
                    </h2>
                    {activePath.learningPathDescription && (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">{activePath.learningPathDescription}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between gap-2 text-sm">
                      <span>Progres jalur</span>
                      <span className="font-semibold tabular-nums">{progress}%</span>
                    </div>
                    <div role="progressbar" aria-label="Progres jalur belajar" aria-valuenow={progress}
                      className="h-2 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full rounded-full bg-[#B0B4E0]" style={{ width: `${progress}%` }} />
                    </div>
                    <Button asChild className="min-h-11 w-full rounded-lg bg-white text-ink-primary hover:bg-[#E8ECF6]">
                      <Link to={activePath.learningPathSlug
                        ? `/student/learning-paths/${activePath.learningPathSlug}`
                        : '/student/learning?tab=progress'}>
                        {activePath.learningPathSlug
                          ? activePath.status === 'not_started' ? 'Buka Jalur Belajar' : 'Lanjutkan Belajar'
                          : 'Lihat Perkembangan'}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </section>
              )}

              <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <LearningProfileCard profile={profile} />
                {profile?.hasResult && (
                  <StudyMethodsSection methods={profile.recommendedStudyMethods} strengths={profile.strengths} />
                )}
              </div>

              <section aria-labelledby="recommended-subjects" className="space-y-4 border-t border-border pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="recommended-subjects" className="text-xl font-bold tracking-tight text-ink-primary">Rekomendasi Mata Pelajaran</h2>
                  <div role="group" aria-label="Kategori mata pelajaran" className="flex flex-wrap gap-1.5">
                    {([
                      ['all', 'Semua'],
                      ['general', 'Umum'],
                      ['religious', 'Pendidikan Islam'],
                    ] as const).map(([id, label]) => (
                      <Button key={id} type="button" variant={subjectFilter === id ? 'default' : 'outline'}
                        aria-pressed={subjectFilter === id} onClick={() => setSubjectFilter(id)}
                        className="min-h-11 rounded-lg px-3 text-xs">{label}</Button>
                    ))}
                  </div>
                </div>
                {filteredSubjects.length === 0 ? (
                  <p className="rounded-xl border border-border bg-white p-5 text-sm text-ink-muted">
                    {subjectFilter === 'all' ? 'Belum ada rekomendasi mata pelajaran.' : 'Belum ada mata pelajaran pada kategori ini.'}
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredSubjects.map((subject) => <RecommendedSubjectCard key={subject.subjectId} subject={subject} />)}
                  </div>
                )}
              </section>

              <section aria-labelledby="learning-paths" className="space-y-4 border-t border-border pt-5">
                <h2 id="learning-paths" className="text-xl font-bold tracking-tight text-ink-primary">Jalur Belajar</h2>
                {learningPaths.length === 0 ? (
                  <p className="rounded-xl border border-border bg-white p-5 text-sm text-ink-muted">Belum ada jalur belajar aktif.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {learningPaths.map((path) => <LearningPathCard key={path.id} path={path} />)}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
