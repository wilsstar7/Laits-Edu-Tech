import type { Review } from '@/types/review'
import { RatingStars } from './RatingStars'
import { formatReportDate, getInitials } from '@/utils/format'
import { Badge } from '@/components/ui/badge'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  // Privacy-friendly display name (e.g. "Ahmad F.")
  const displayName = (() => {
    const parts = (review.studentName || 'Siswa').trim().split(/\s+/)
    if (parts.length === 1) return parts[0]
    return `${parts[0]} ${parts[parts.length - 1]?.[0] || ''}.`
  })()

  return (
    <div className="surface-card p-5 bg-white border border-border rounded-2xl shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
            {getInitials(review.studentName)}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">{displayName}</div>
            <div className="text-xs text-muted-foreground">
              {formatReportDate(review.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <RatingStars value={review.rating} readOnly size="sm" />
          {review.subjectName && (
            <Badge variant="outline" className="text-[11px] font-normal py-0">
              {review.subjectName}
            </Badge>
          )}
        </div>
      </div>

      {review.reviewText && (
        <p className="text-sm text-foreground/90 leading-relaxed pl-1 pt-1 border-t border-border/40">
          "{review.reviewText}"
        </p>
      )}
    </div>
  )
}
