import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { LearningProgressCard } from '@/components/progress/LearningProgressCard'
import { LearningPathProgressCard } from '@/components/progress/LearningPathProgressCard'
import { SessionCard } from '@/components/session/SessionCard'
import { ReviewFormModal } from '@/components/review/ReviewFormModal'
import { learningProgressService } from '@/services/learningProgressService'
import { learningSessionService } from '@/services/learningSessionService'
import type { StudentLearningPath, OverallStudentProgress, LearningSession } from '@/types/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Compass, ArrowRight, AlertCircle } from 'lucide-react'

export function StudentProgressPage() {
  const [paths, setPaths] = useState<StudentLearningPath[]>([])
  const [overall, setOverall] = useState<OverallStudentProgress | null>(null)
  const [recentSessions, setRecentSessions] = useState<LearningSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeReviewSession, setActiveReviewSession] = useState<LearningSession | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [pathsData, overallData, sessionsData] = await Promise.all([
        learningProgressService.getEnrolledLearningPaths(),
        learningProgressService.getOverallStudentProgress(),
        learningSessionService.getStudentSessions(undefined, 1, 3),
      ])
      setPaths(pathsData)
      setOverall(overallData)
      setRecentSessions(sessionsData.sessions)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat perkembangan belajar.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    Promise.all([
      learningProgressService.getEnrolledLearningPaths(),
      learningProgressService.getOverallStudentProgress(),
      learningSessionService.getStudentSessions(undefined, 1, 3),
    ])
      .then(([pathsData, overallData, sessionsData]) => {
        if (!isMounted) return
        setPaths(pathsData)
        setOverall(overallData)
        setRecentSessions(sessionsData.sessions)
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        const msg = err instanceof Error ? err.message : 'Gagal memuat perkembangan belajar.'
        setError(msg)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Perkembangan Belajar Saya"
          subtitle="Pantau pencapaian alur belajar, ketuntasan mata pelajaran, dan riwayat sesi bimbingan Anda."
        />

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* 1. Overall Progress */}
            {overall && <LearningProgressCard progress={overall} />}

            {/* 2. Enrolled Learning Paths */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Alur Belajar Terdaftar
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Kurikulum terstruktur yang sedang Anda tempuh
                  </p>
                </div>
                <Link to="/student/learning">
                  <Button variant="ghost" size="sm" className="min-h-[44px] gap-1.5 text-xs text-primary font-semibold">
                    <span>Eksplorasi Rekomendasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {paths.length === 0 ? (
                <div className="surface-card p-10 bg-white border border-border rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Compass className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      Belum Ada Alur Belajar yang Dimulai
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      Pilih alur belajar yang direkomendasikan berdasarkan hasil tes kepribadian Anda untuk mulai mencatat progres belajar.
                    </p>
                  </div>
                  <Link to="/student/learning">
                    <Button className="min-h-[44px] gap-2 font-semibold text-xs">
                      <BookOpen className="w-4 h-4" />
                      <span>Lihat Rekomendasi Alur Belajar</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {paths.map((p) => (
                    <LearningPathProgressCard
                      key={p.id}
                      path={p}
                      onProgressUpdated={loadData}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 3. Recent Tutoring Sessions */}
            {recentSessions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Sesi Bimbingan Terbaru
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Riwayat pembelajaran interaktif bersama tutor Anda
                    </p>
                  </div>
                  <Link to="/student/sessions">
                    <Button variant="ghost" size="sm" className="min-h-[44px] gap-1.5 text-xs text-primary font-semibold">
                      <span>Semua Sesi</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      role="student"
                      onReviewClick={(s) => setActiveReviewSession(s)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Review Submission Modal */}
        {activeReviewSession && (
          <ReviewFormModal
            bookingId={activeReviewSession.bookingId}
            tutorName={activeReviewSession.tutorName || 'Tutor'}
            subjectName={activeReviewSession.subjectName}
            isOpen={!!activeReviewSession}
            onClose={() => setActiveReviewSession(null)}
            onSuccess={loadData}
          />
        )}
      </div>
    </AppShell>
  )
}
