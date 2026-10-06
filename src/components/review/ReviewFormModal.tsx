import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RatingStars } from './RatingStars'
import { reviewService } from '@/services/reviewService'
import { Loader2, MessageSquare } from 'lucide-react'

interface ReviewFormModalProps {
  bookingId: string
  tutorName: string
  subjectName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReviewFormModal({
  bookingId,
  tutorName,
  subjectName,
  isOpen,
  onClose,
  onSuccess,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState<number>(5)
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1 || rating > 5) {
      setErrorMessage('Harap berikan rating antara 1 sampai 5 bintang.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await reviewService.submitReview({
        bookingId,
        rating,
        reviewText: reviewText.trim() || undefined,
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirimkan ulasan.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Beri Ulasan Bimbingan</span>
          </DialogTitle>
          <DialogDescription>
            Bagikan pengalaman belajar Anda bersama{' '}
            <span className="font-semibold text-foreground">{tutorName}</span> pada mata pelajaran{' '}
            <span className="font-semibold text-foreground">{subjectName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-2 text-center py-2 bg-muted/20 border border-border/60 rounded-xl">
            <label className="text-xs font-semibold text-muted-foreground block">
              Berapa bintang penilaian Anda?
            </label>
            <div className="flex justify-center">
              <RatingStars value={rating} onChange={setRating} size="lg" />
            </div>
            <span className="text-xs font-bold text-primary block">
              {rating === 5 && 'Sangat Memuaskan (5/5)'}
              {rating === 4 && 'Bagus & Bermanfaat (4/5)'}
              {rating === 3 && 'Cukup Baik (3/5)'}
              {rating === 2 && 'Kurang Memuaskan (2/5)'}
              {rating === 1 && 'Perlu Peningkatan (1/5)'}
            </span>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="review-text-input"
              className="text-xs font-semibold text-foreground"
            >
              Ulasan Pengalaman Belajar (Opsional)
            </label>
            <textarea
              id="review-text-input"
              rows={4}
              maxLength={1000}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Ceritakan bagaimana tutor menyampaikan materi, kejelasan penjelasan, atau suasana sesi belajar..."
              className="w-full text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
            <div className="text-[11px] text-muted-foreground text-right">
              {reviewText.length}/1000 karakter
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] gap-2 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan...</span>
                </>
              ) : (
                <span>Kirim Ulasan</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
