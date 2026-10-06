import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  GraduationCap,
  Users,
  ArrowRight,
  CheckCircle2,
  Compass,
  Loader2,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorState } from '@/components/ui/ErrorState'
import { learningPathService } from '@/services/learningPathService'
import { learningProgressService } from '@/services/learningProgressService'
import type { LearningPathDetail } from '@/types/learning'
import type { StudentLearningPath } from '@/types/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function LearningPathDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [loading, setLoading] = useState(true)
  const [pathDetail, setPathDetail] = useState<LearningPathDetail | null>(null)
  const [enrollment, setEnrollment] = useState<StudentLearningPath | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadData = async () => {
    if (!slug) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const data = await learningPathService.getLearningPathBySlug(slug)
      if (!data) {
        setErrorMsg('Alur pembelajaran tidak ditemukan.')
        return
      }
      setPathDetail(data)
      const enrolled = await learningProgressService.getLearningPathEnrollment(data.id)
      setEnrollment(enrolled)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat detail alur pembelajaran.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!slug) return
    let isMounted = true

    learningPathService
      .getLearningPathBySlug(slug)
      .then(async (data) => {
        if (!isMounted) return
        if (!data) {
          setErrorMsg('Alur pembelajaran tidak ditemukan.')
          return
        }
        setPathDetail(data)

        try {
          const enrolled = await learningProgressService.getLearningPathEnrollment(data.id)
          if (isMounted) setEnrollment(enrolled)
        } catch (e) {
          console.warn('Could not check enrollment', e)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setErrorMsg(
          err instanceof Error ? err.message : 'Gagal memuat detail alur pembelajaran.'
        )
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  const handleEnroll = async () => {
    if (!pathDetail) return
    setIsEnrolling(true)
    try {
      await learningProgressService.enrollLearningPath(pathDetail.id)
      toast.success('Pendaftaran Berhasil!', {
        description: `Anda telah memulai alur belajar "${pathDetail.title}".`,
      })
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftar ke alur belajar.'
      toast.error(msg)
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleRetry = () => {
    loadData()
  }

  return (
    <AppShell>
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/student/learning"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-brand-primary min-h-[44px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pembelajaran Personal</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <Card className="p-6 border-border bg-white">
            <Skeleton className="w-48 h-7 rounded mb-2" />
            <Skeleton className="w-96 h-4 rounded mb-4" />
            <div className="flex gap-4">
              <Skeleton className="w-24 h-5 rounded" />
              <Skeleton className="w-28 h-5 rounded" />
            </div>
          </Card>
          <div className="space-y-3">
            <Skeleton className="w-40 h-6 rounded" />
            <Skeleton className="w-full h-24 rounded-xl" />
            <Skeleton className="w-full h-24 rounded-xl" />
          </div>
        </div>
      ) : errorMsg || !pathDetail ? (
        <ErrorState
          title="Alur Tidak Ditemukan"
          message={errorMsg || 'Data alur pembelajaran tidak dapat dimuat.'}
          onRetry={handleRetry}
        />
      ) : (
        <div className="space-y-8">
          {/* Header Card */}
          <Card className="border border-border/80 bg-white shadow-xs overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 text-xs font-semibold">
                      Alur Terstruktur
                    </Badge>
                    <Badge variant="secondary" className="bg-surface text-ink-secondary text-xs">
                      {pathDetail.difficulty === 'beginner'
                        ? 'Tingkat Pemula'
                        : pathDetail.difficulty === 'intermediate'
                        ? 'Tingkat Menengah'
                        : 'Tingkat Lanjut'}
                    </Badge>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-ink-primary">
                    {pathDetail.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                    {pathDetail.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-ink-muted">
                    <div className="flex items-center gap-1.5 font-medium text-ink-secondary">
                      <BookOpen className="w-4 h-4 text-brand-primary" />
                      <span>{pathDetail.subjects.length} Mata Pelajaran</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-ink-secondary">
                      <Clock className="w-4 h-4 text-brand-primary" />
                      <span>Estimasi {pathDetail.estimatedDuration}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Enrollment & Tutors */}
                <div className="w-full md:w-auto shrink-0 flex flex-col gap-2 min-w-[220px]">
                  {!enrollment ? (
                    <Button
                      type="button"
                      disabled={isEnrolling}
                      onClick={handleEnroll}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mendaftarkan...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-4 h-4" />
                          <span>Mulai Alur Belajar</span>
                        </>
                      )}
                    </Button>
                  ) : enrollment.status === 'completed' ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                      <Badge className="bg-emerald-600 text-white font-bold gap-1 py-1 mx-auto">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tuntas (100%)
                      </Badge>
                      <Link to="/student/progress" className="block">
                        <Button variant="outline" size="sm" className="w-full min-h-[40px] text-xs font-semibold">
                          Tinjau Alur Belajar
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                        <span>Progres Anda:</span>
                        <span className="text-brand-primary">{enrollment.progressPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-primary rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progressPercentage}%` }}
                        />
                      </div>
                      <Link to="/student/progress" className="block pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full min-h-[40px] gap-1.5 font-semibold text-xs text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10"
                        >
                          <span>Lanjutkan Belajar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  <Link
                    to={`/student/tutors?subjectId=${pathDetail.subjects[0]?.id || ''}`}
                    className="min-h-[40px] px-4 py-2 rounded-xl border border-border text-ink-secondary hover:text-brand-primary hover:bg-surface text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Cari Tutor Pendamping</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Curriculum / Sequence of Subjects */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-ink-primary flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-primary" />
                Urutan Kurikulum Mata Pelajaran
              </h2>
              <p className="text-xs text-ink-muted">
                Rangkaian materi yang disusun bertahap untuk memastikan pemahaman mendalam.
              </p>
            </div>

            <div className="space-y-3">
              {pathDetail.subjects.map((item, idx) => (
                <Card
                  key={item.id}
                  className="border border-border/80 bg-white hover:border-brand-primary/30 transition-all shadow-xs"
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Step index */}
                      <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center shrink-0 text-sm">
                        {idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-ink-primary text-sm sm:text-base">
                            {item.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-surface text-ink-muted"
                          >
                            {item.category === 'religious' ? 'Pendidikan Islam' : 'Mata Pelajaran Umum'}
                          </Badge>
                        </div>
                        <p className="text-xs text-ink-secondary leading-relaxed">
                          {item.description || 'Fokus penguasaan konsep dasar dan pemecahan masalah secara mandiri.'}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/student/tutors?subjectId=${item.id}`}
                      className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/5 rounded-lg border border-brand-primary/20 flex items-center gap-1.5 shrink-0 transition-colors self-end sm:self-center"
                    >
                      <span>Lihat Tutor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
