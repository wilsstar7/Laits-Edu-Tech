import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { LearningProfileCard } from '@/components/learning/LearningProfileCard'
import { StudyMethodsSection } from '@/components/learning/StudyMethodCard'
import { RecommendedSubjectCard } from '@/components/learning/RecommendedSubjectCard'
import { LearningPathCard } from '@/components/learning/LearningPathCard'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function PersonalizedLearningPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<LearningProfileOverview | null>(null)
  const [recommendedSubjects, setRecommendedSubjects] = useState<RecommendedSubject[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [enrolledPaths, setEnrolledPaths] = useState<StudentLearningPath[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'general' | 'religious'>('all')

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const profileData = await personalizedLearningService.getLearningProfile()
        const [subjectsData, pathsData, enrolledData] = await Promise.all([
          personalizedLearningService.getRecommendedSubjects(profileData.personalityTypeId),
          learningPathService.listLearningPaths(profileData.personalityTypeId),
          learningProgressService.getEnrolledLearningPaths(),
        ])

        if (isMounted) {
          setProfile(profileData)
          setRecommendedSubjects(subjectsData)
          setLearningPaths(pathsData)
          setEnrolledPaths(enrolledData)
        }
      } catch (err: unknown) {
        console.error('Failed to load personalized learning data:', err)
        if (isMounted) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : 'Gagal memuat rencana belajar personal. Silakan coba kembali.'
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()
    return () => {
      isMounted = false
    }
  }, [])

  const handleRetry = () => {
    setLoading(true)
    setErrorMsg(null)
    personalizedLearningService
      .getLearningProfile()
      .then(async (profileData) => {
        const [subjectsData, pathsData] = await Promise.all([
          personalizedLearningService.getRecommendedSubjects(profileData.personalityTypeId),
          learningPathService.listLearningPaths(profileData.personalityTypeId),
        ])
        setProfile(profileData)
        setRecommendedSubjects(subjectsData)
        setLearningPaths(pathsData)
      })
      .catch((err: unknown) => {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'Gagal memuat rencana belajar personal. Silakan coba kembali.'
        )
      })
      .finally(() => setLoading(false))
  }

  // Filter recommended subjects
  const filteredSubjects = recommendedSubjects.filter((sub) => {
    if (subjectFilter === 'all') return true
    return sub.category === subjectFilter
  })

  return (
    <AppShell>
      <PageHeader
        title="Pembelajaran Personal"
        subtitle="Rencana belajar, metode adaptif, dan rekomendasi mata pelajaran yang disesuaikan dengan profil kepribadian Anda."
        badge="Personalized Learning"
        action={
          profile?.hasResult ? (
            <Link
              to="/student/tutors"
              className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-sm hover:bg-brand-primary/90 transition-colors gap-2 min-h-[44px]"
            >
              <span>Cari Tutor Sesuai Profil</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/student/assessment"
              className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-sm hover:bg-brand-primary/90 transition-colors gap-2 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ambil Asesmen Kepribadian</span>
            </Link>
          )
        }
      />

      {loading ? (
        <div className="space-y-6">
          <LearningProfileSkeleton />
          <LearningGridSkeleton count={3} />
        </div>
      ) : errorMsg ? (
        <ErrorState
          title="Kendala Memuat Rencana Belajar"
          message={errorMsg}
          onRetry={handleRetry}
        />
      ) : (
        <div className="space-y-8">
          {/* No Assessment Banner if student hasn't taken test */}
          {!profile?.hasResult && (
            <div className="surface-card p-6 bg-linear-to-r from-brand-primary/10 via-brand-primary/5 to-surface border border-brand-primary/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Optimalkan Potensi Belajar</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-ink-primary">
                  Kustomisasi Rekomendasi dengan Asesmen Kepribadian
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  Anda belum menyelesaikan tes asesmen karakter. Ikuti asesmen selama 5 menit
                  untuk mendapatkan pemetaan metode belajar, rekomendasi mata pelajaran, dan
                  pencocokan tutor yang akurat berdasarkan arketipe Anda.
                </p>
              </div>
              <Link
                to="/student/assessment"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 shadow-sm inline-flex items-center gap-2 shrink-0 transition-colors"
              >
                Mulai Tes Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Lanjutkan Belajar Widget */}
          {enrolledPaths[0] && (
            <div className="surface-card p-6 bg-linear-to-r from-brand-primary/10 via-brand-primary/5 to-surface border border-brand-primary/20 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                    Lanjutkan Belajar
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-white text-ink-muted">
                    Progres {enrolledPaths[0].progressPercentage}%
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-ink-primary">
                  {enrolledPaths[0].learningPathTitle}
                </h3>
                <p className="text-xs text-ink-muted line-clamp-1">
                  {enrolledPaths[0].learningPathDescription}
                </p>
              </div>
              <Link to="/student/progress">
                <Button className="min-h-[44px] gap-2 font-semibold text-xs shrink-0 bg-brand-primary text-white hover:bg-brand-primary/90">
                  <span>Ke Dasbor Progres</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Section 1: Learning Profile Overview Card */}
          {profile && <LearningProfileCard profile={profile} />}

          {/* Section 2: Recommended Study Methods */}
          {profile?.hasResult && profile.recommendedStudyMethods.length > 0 && (
            <StudyMethodsSection
              methods={profile.recommendedStudyMethods}
              strengths={profile.strengths}
            />
          )}

          {/* Section 3: Recommended Subjects */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-primary" />
                  Mata Pelajaran yang Direkomendasikan
                </h3>
                <p className="text-xs text-ink-muted">
                  Kurikulum dan materi yang cocok dengan kekuatan kognitif serta minat kepribadian Anda.
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setSubjectFilter('all')}
                  className={`min-h-[36px] px-3 text-xs font-semibold rounded-lg transition-colors ${
                    subjectFilter === 'all'
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Semua ({recommendedSubjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilter('general')}
                  className={`min-h-[36px] px-3 text-xs font-semibold rounded-lg transition-colors ${
                    subjectFilter === 'general'
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Umum
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFilter('religious')}
                  className={`min-h-[36px] px-3 text-xs font-semibold rounded-lg transition-colors ${
                    subjectFilter === 'religious'
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  Pendidikan Islam
                </button>
              </div>
            </div>

            {filteredSubjects.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-2xl border border-dashed border-border">
                <p className="text-xs text-ink-muted">
                  Tidak ada mata pelajaran pada kategori yang dipilih.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((sub) => (
                  <RecommendedSubjectCard key={sub.subjectId} subject={sub} />
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Curated Learning Paths */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand-primary" />
                  Alur Pembelajaran Terstruktur (Learning Paths)
                </h3>
                <p className="text-xs text-ink-muted">
                  Jalur belajar komprehensif dari dasar hingga mahir dengan kurikulum terpadu.
                </p>
              </div>
            </div>

            {learningPaths.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-2xl border border-dashed border-border">
                <p className="text-xs text-ink-muted">
                  Belum ada alur pembelajaran aktif saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {learningPaths.map((path) => (
                  <LearningPathCard key={path.id} path={path} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
