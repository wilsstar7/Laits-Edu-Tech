import type { TutorRatingSummary } from '@/types/review'
import { RatingStars } from './RatingStars'
import { Star } from 'lucide-react'

interface ReviewSummaryCardProps {
  summary: TutorRatingSummary
}

export function ReviewSummaryCard({ summary }: ReviewSummaryCardProps) {
  const hasReviews = summary.totalReviews > 0

  return (
    <div className="surface-card p-6 bg-white border border-border rounded-2xl shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="text-center sm:text-left">
            <div className="text-4xl font-black text-foreground tracking-tight">
              {hasReviews ? summary.averageRating.toFixed(1) : '-'}
            </div>
            <div className="flex items-center gap-1.5 mt-1 justify-center sm:justify-start">
              <RatingStars value={Math.round(summary.averageRating)} readOnly size="sm" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {hasReviews
                ? `Berdasarkan ${summary.totalReviews} ulasan siswa`
                : 'Belum ada ulasan'}
            </div>
          </div>
        </div>

        {hasReviews && (
          <div className="flex-1 max-w-xs space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = summary.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0
              const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-4 font-semibold text-muted-foreground text-right">
                    {stars}
                  </span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-muted-foreground text-right">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
