import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import {
  ArrowLeft,
  Star,
  Clock,
  ArrowUpRight,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorState } from '@/components/ui/ErrorState'
import { TutorProfileSkeleton } from '@/components/tutor/TutorSkeletons'
import { ReviewSummaryCard } from '@/components/review/ReviewSummaryCard'
import { ReviewCard } from '@/components/review/ReviewCard'
import { tutorService } from '@/services/tutorService'
import { reviewService } from '@/services/reviewService'
import type { TutorSummary } from '@/types/tutor'
import type { Review, TutorRatingSummary } from '@/types/review'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials } from '@/utils/format'

export function TutorProfilePage() {
  const { tutorId } = useParams<{ tutorId: string }>()
  return <TutorProfile key={tutorId} tutorId={tutorId} />
}

function TutorProfile({ tutorId }: { tutorId?: string }) {
  const [loading, setLoading] = useState(Boolean(tutorId))
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [tutor, setTutor] = useState<TutorSummary | null>(null)

  // Review states
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingSummary, setRatingSummary] = useState<TutorRatingSummary | null>(null)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [reviewError, setReviewError] = useState(false)

  const reloadTutor = () => {
    if (!tutorId) return
    setLoading(true)
    setErrorMsg(null)
    tutorService
      .getTutorById(tutorId)
      .then((data) => {
        if (!data) {
          setErrorMsg('Profil tutor tidak ditemukan atau telah dinonaktifkan.')
        } else {
          setTutor(data)
        }
      })
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat profil tutor.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!tutorId) return
    let isMounted = true

    tutorService
      .getTutorById(tutorId)
      .then((data) => {
        if (!isMounted) return
        if (!data) {
          setErrorMsg('Profil tutor tidak ditemukan atau telah dinonaktifkan.')
        } else {
          setTutor(data)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setErrorMsg(
          err instanceof Error ? err.message : 'Gagal memuat profil tutor.'
        )
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    Promise.allSettled([
      reviewService.getTutorReviews(tutorId, 1, 10),
      reviewService.getTutorRatingSummary(tutorId),
    ]).then(([reviewList, summary]) => {
      if (!isMounted) return
      if (reviewList.status === 'fulfilled') setReviews(reviewList.value.reviews)
      else setReviewError(true)
      if (summary.status === 'fulfilled') setRatingSummary(summary.value)
      setLoadingReviews(false)
    })

    return () => {
      isMounted = false
    }
  }, [tutorId])

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <Link to="/student/tutors"
          className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-ink-muted hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Kembali ke Katalog Tutor
        </Link>

        {loading ? (
          <TutorProfileSkeleton />
        ) : errorMsg || !tutor ? (
          <ErrorState title="Profil Tutor Tidak Tersedia"
            message={errorMsg || 'Data tutor tidak dapat diakses saat ini.'} onRetry={reloadTutor} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <header className="flex flex-wrap items-start gap-4 border-b border-border bg-[#F4F6FA] px-5 py-6 sm:gap-6 sm:px-8 sm:py-8">
              <Avatar className="size-16 shrink-0 rounded-xl border border-brand-primary/10 sm:size-24">
                {tutor.avatarUrl && <AvatarImage src={tutor.avatarUrl} alt="" />}
                <AvatarFallback className="rounded-xl bg-[#E8ECF6] text-xl font-bold text-brand-primary sm:text-3xl">
                  {getInitials(tutor.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 basis-48">
                <h1 className="wrap-break-word text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
                  {tutor.fullName}
                </h1>
                <p className="mt-1.5 wrap-break-word text-sm text-ink-secondary sm:text-base">
                  {tutor.headline || tutor.educationBackground || 'Tutor Privat'}
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                  {tutor.isVerified && (
                    <li className="inline-flex items-center gap-1.5 text-emerald-700">
                      <ShieldCheck aria-hidden="true" className="size-4" /> Terverifikasi
                    </li>
                  )}
                  <li className="inline-flex items-center gap-1.5">
                    <Star aria-hidden="true" className="size-4 text-amber-700" />
                    {tutor.totalReviews > 0 ? `${tutor.rating.toFixed(1)} (${tutor.totalReviews} ulasan)` : 'Belum ada ulasan'}
                  </li>
                  {tutor.experienceYears > 0 && (
                    <li className="inline-flex items-center gap-1.5">
                      <Clock aria-hidden="true" className="size-4" /> {tutor.experienceYears} tahun pengalaman
                    </li>
                  )}
                </ul>
              </div>
            </header>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,19rem)]">
              <div className="min-w-0 divide-y divide-border">
                <section className="px-5 py-6 sm:px-8" aria-labelledby="tutor-subjects">
                  <h2 id="tutor-subjects" className="text-lg font-bold text-ink-primary">Mata Pelajaran</h2>
                  {tutor.subjects.length > 0 ? (
                    <ul className="mt-2 divide-y divide-border">
                      {tutor.subjects.map((subject) => (
                        <li key={subject.id} className="py-3 first:pt-2 last:pb-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <h3 className="min-w-0 wrap-break-word text-sm font-semibold text-ink-primary">{subject.name}</h3>
                            <span className="text-xs text-ink-muted">{subject.category === 'religious' ? 'Pendidikan Islam' : 'Umum'}</span>
                          </div>
                          {subject.description && <p className="mt-1 wrap-break-word text-sm leading-relaxed text-ink-muted">{subject.description}</p>}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-2 text-sm text-ink-muted">Mata pelajaran belum dicantumkan.</p>}
                </section>

                {(tutor.bio || tutor.teachingStyle || tutor.educationBackground || tutor.experience) && (
                  <section className="space-y-4 px-5 py-6 sm:px-8" aria-labelledby="tutor-about">
                    <h2 id="tutor-about" className="text-lg font-bold text-ink-primary">Tentang Tutor</h2>
                    {tutor.bio && <p className="wrap-break-word whitespace-pre-line text-sm leading-relaxed text-ink-secondary">{tutor.bio}</p>}
                    <dl className="space-y-3">
                      {([
                        ['Gaya mengajar', tutor.teachingStyle],
                        ['Pendidikan', tutor.educationBackground],
                        ['Pengalaman', tutor.experience],
                      ] as const).map(([label, value]) => value && (
                        <div key={label} className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
                          <dt className="text-sm font-semibold text-ink-primary">{label}</dt>
                          <dd className="wrap-break-word whitespace-pre-line text-sm leading-relaxed text-ink-secondary">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}
              </div>

              <aside className="self-start border-y border-border bg-[#F4F6FA] p-5 sm:p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full lg:border-y-0 lg:border-l" aria-labelledby="tutor-program">
                <div className="space-y-4">
                  <h2 id="tutor-program" className="text-lg font-bold text-ink-primary">Program Les Privat</h2>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    Tim ZEINBOX menetapkan tutor. Anda bisa mengusulkan nama tutor saat membuat tagihan.
                  </p>
                  <div className="grid gap-2">
                    <Button asChild className="min-h-11 w-full rounded-lg">
                      <Link to="/student/payments">Pilih Jumlah Sesi <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
                    </Button>
                    <Button asChild variant="outline" className="min-h-11 w-full rounded-lg">
                      <Link to={`/student/messages?tutorId=${encodeURIComponent(tutor.userId || tutor.id)}`}>
                        <MessageCircle aria-hidden="true" className="size-4" /> Kirim Pesan ke Tutor
                      </Link>
                    </Button>
                  </div>
                </div>
              </aside>

              <section className="min-w-0 space-y-4 px-5 py-6 sm:px-8 lg:col-start-1 lg:border-t lg:border-border" aria-labelledby="tutor-reviews">
                <h2 id="tutor-reviews" className="text-lg font-bold text-ink-primary">Ulasan Siswa</h2>
                {loadingReviews ? (
                  <Skeleton className="h-20 w-full rounded-xl" />
                ) : reviewError ? (
                  <p role="status" className="text-sm text-ink-muted">Ulasan belum bisa dimuat.</p>
                ) : (
                  <>
                    {ratingSummary && ratingSummary.totalReviews > 0 && <ReviewSummaryCard summary={ratingSummary} />}
                    {reviews.length > 0 ? (
                      <div className="space-y-3">
                        {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
                      </div>
                    ) : <p className="text-sm text-ink-muted">Belum ada ulasan untuk tutor ini.</p>}
                  </>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
