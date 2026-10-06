import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { SessionCard } from '@/components/session/SessionCard'
import { ReviewFormModal } from '@/components/review/ReviewFormModal'
import { learningSessionService } from '@/services/learningSessionService'
import type { LearningSession } from '@/types/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, ArrowRight, AlertCircle } from 'lucide-react'

export function StudentSessionsPage() {
  const [sessions, setSessions] = useState<LearningSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeReviewSession, setActiveReviewSession] = useState<LearningSession | null>(null)

  const loadSessions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await learningSessionService.getStudentSessions()
      setSessions(data.sessions)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat riwayat sesi.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    learningSessionService
      .getStudentSessions()
      .then((data) => {
        if (isMounted) setSessions(data.sessions)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Gagal memuat riwayat sesi.'
          setError(msg)
        }
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
      <div className="space-y-6">
        <PageHeader
          title="Riwayat Sesi Bimbingan"
          subtitle="Daftar seluruh sesi bimbingan yang telah dijadwalkan, sedang berlangsung, dan selesai dilaksanakan."
        />

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card p-5 bg-white border border-border rounded-2xl space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="surface-card p-12 bg-white border border-border rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Belum Ada Riwayat Sesi Bimbingan
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Setelah pembayaran terkonfirmasi, sesi bimbingan Anda akan otomatis tercatat di halaman ini.
              </p>
            </div>
            <Link to="/student/tutors">
              <Button className="min-h-[44px] gap-2 font-semibold text-xs">
                <span>Pesan Sesi Bimbingan</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                role="student"
                onReviewClick={(s) => setActiveReviewSession(s)}
              />
            ))}
          </div>
        )}

        {/* Review Modal */}
        {activeReviewSession && (
          <ReviewFormModal
            bookingId={activeReviewSession.bookingId}
            tutorName={activeReviewSession.tutorName || 'Tutor'}
            subjectName={activeReviewSession.subjectName}
            isOpen={!!activeReviewSession}
            onClose={() => setActiveReviewSession(null)}
            onSuccess={loadSessions}
          />
        )}
      </div>
    </AppShell>
  )
}
