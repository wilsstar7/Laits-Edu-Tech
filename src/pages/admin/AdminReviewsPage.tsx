import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { RatingStars } from '@/components/review/RatingStars'
import { reviewService } from '@/services/reviewService'
import type { Review } from '@/types/review'
import { formatReportDate } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, EyeOff, AlertCircle } from 'lucide-react'

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getFlaggedReviews()
      setReviews(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat ulasan.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    reviewService
      .getFlaggedReviews()
      .then((data) => {
        if (isMounted) setReviews(data)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Gagal memuat ulasan.'
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

  const handleModerate = async (reviewId: string, status: 'published' | 'hidden') => {
    setIsProcessing(true)
    try {
      await reviewService.moderateReview(reviewId, status)
      await fetchReviews()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status ulasan.'
      setError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Moderasi Ulasan Siswa"
          subtitle="Pantau ulasan yang disembunyikan atau terindikasi pelanggaran pedoman komunitas."
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
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-72" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="surface-card p-12 bg-white border border-border rounded-2xl text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Tidak Ada Ulasan yang Ditandai
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Semua ulasan siswa saat ini dalam keadaan bersih dan dipublikasikan secara normal.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="surface-card p-5 bg-white border border-border rounded-2xl shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <RatingStars value={rev.rating} readOnly size="sm" />
                    <span className="text-xs text-muted-foreground">
                      Oleh: <strong className="text-foreground">{rev.studentName}</strong> • Tutor: <strong className="text-foreground">{rev.tutorName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {rev.status === 'hidden' ? 'Disembunyikan' : 'Ditandai'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatReportDate(rev.createdAt)}
                    </span>
                  </div>
                </div>

                {rev.reviewText && (
                  <p className="text-sm text-foreground/90 bg-muted/20 p-3 rounded-xl border border-border/40">
                    "{rev.reviewText}"
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  {rev.status === 'hidden' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isProcessing}
                      onClick={() => handleModerate(rev.id, 'published')}
                      className="min-h-[44px] gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pulihkan / Publikasikan</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isProcessing}
                      onClick={() => handleModerate(rev.id, 'hidden')}
                      className="min-h-[44px] gap-1.5 text-xs text-rose-600 border-rose-300 hover:bg-rose-50"
                    >
                      <EyeOff className="w-4 h-4" />
                      <span>Sembunyikan Ulasan</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
