import {
  Calendar,
  Clock,
  DollarSign,
  Video,
  X,
  Check,
  CreditCard,
  MessageSquare,
} from 'lucide-react'
import type { Booking } from '@/types/booking'
import { BookingStatusBadge } from './BookingStatusBadge'
import { formatCurrency, formatDateTime } from '@/utils/format'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface BookingCardProps {
  booking: Booking
  perspective: 'student' | 'tutor'
  onCancel?: (booking: Booking) => void
  onAccept?: (booking: Booking) => void
  onReject?: (booking: Booking) => void
  onComplete?: (booking: Booking) => void
  onPay?: (booking: Booking) => void
  onReview?: (booking: Booking) => void
  isActionLoading?: boolean
}

export function BookingCard({
  booking,
  perspective,
  onCancel,
  onAccept,
  onReject,
  onComplete,
  onPay,
  onReview,
  isActionLoading = false,
}: BookingCardProps) {
  // Compute session duration in minutes
  const startMs = new Date(booking.scheduledStart).getTime()
  const endMs = new Date(booking.scheduledEnd).getTime()
  const durationMinutes = Math.round((endMs - startMs) / (1000 * 60))

  // Compute calculated fee (hourly rate * (minutes / 60))
  const calculatedFee = Math.round((booking.tutorHourlyRate * durationMinutes) / 60)

  // Person to display: tutor when viewed by student, student when viewed by tutor
  const counterpartyName = perspective === 'student' ? booking.tutorName : booking.studentName
  const counterpartyAvatar =
    perspective === 'student' ? booking.tutorAvatarUrl : booking.studentAvatarUrl
  const counterpartyRole = perspective === 'student' ? 'Tutor' : 'Siswa'

  return (
    <Card className="border border-border/80 bg-white shadow-xs hover:border-border transition-all overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          {/* Counterparty info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 border border-border">
              {counterpartyAvatar && (
                <AvatarImage src={counterpartyAvatar} alt={counterpartyName} />
              )}
              <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold text-sm">
                {counterpartyName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-ink-primary text-sm sm:text-base">
                  {counterpartyName}
                </h4>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-surface text-ink-muted">
                  {counterpartyRole}
                </Badge>
              </div>
              <p className="text-xs text-ink-muted">
                {booking.subjectName} ({booking.subjectCategory === 'religious' ? 'Pendidikan Islam' : 'Umum'})
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="self-start sm:self-center">
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        {/* Schedule & Pricing Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs">
          <div className="flex items-start gap-2 text-ink-secondary">
            <Calendar className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-ink-muted block">Waktu Sesi:</span>
              <span className="font-semibold text-ink-primary">
                {formatDateTime(booking.scheduledStart)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-ink-secondary">
            <Clock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-ink-muted block">Durasi Sesi:</span>
              <span className="font-semibold text-ink-primary">
                {durationMinutes} Menit ({booking.timezone})
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-ink-secondary">
            <DollarSign className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-ink-muted block">Estimasi Biaya:</span>
              <span className="font-bold text-brand-primary">
                {formatCurrency(calculatedFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes (if any) */}
        {booking.studentNote && (
          <div className="mt-1 p-3 bg-surface rounded-xl border border-border text-xs">
            <span className="font-semibold text-ink-primary block mb-0.5">
              Catatan Siswa:
            </span>
            <p className="text-ink-secondary">{booking.studentNote}</p>
          </div>
        )}

        {/* Cancellation Reason (if cancelled or rejected) */}
        {(booking.status === 'cancelled' || booking.status === 'rejected') &&
          booking.cancellationReason && (
            <div className="mt-2 p-3 bg-danger/5 rounded-xl border border-danger/20 text-xs">
              <span className="font-semibold text-danger block mb-0.5">
                Alasan {booking.status === 'rejected' ? 'Penolakan' : 'Pembatalan'}:
              </span>
              <p className="text-ink-secondary">{booking.cancellationReason}</p>
            </div>
          )}

        {/* Meeting Link / Virtual Room placeholder info */}
        {booking.status === 'confirmed' && (
          <div className="mt-3 p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-ink-primary">
              <Video className="w-4 h-4 text-brand-primary shrink-0" />
              <span>Ruang Belajar Virtual</span>
            </div>
            {booking.meetingUrl ? (
              <a
                href={booking.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-primary font-semibold hover:underline"
              >
                Buka Tautan Pertemuan
              </a>
            ) : (
              <span className="text-[11px] text-ink-muted">
                Tautan sesi akan dibagikan sebelum jadwal dimulai
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 mt-3 border-t border-border">
          {/* Tutor actions for pending booking */}
          {perspective === 'tutor' && booking.status === 'pending' && (
            <>
              {onReject && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isActionLoading}
                  onClick={() => onReject(booking)}
                  className="min-h-[44px] text-danger border-danger/30 hover:bg-danger/10 hover:text-danger gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Tolak
                </Button>
              )}
              {onAccept && (
                <Button
                  type="button"
                  size="sm"
                  disabled={isActionLoading}
                  onClick={() => onAccept(booking)}
                  className="min-h-[44px] bg-brand-primary text-white hover:bg-brand-primary/90 gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Konfirmasi Sesi
                </Button>
              )}
            </>
          )}

          {/* Tutor action for confirmed booking -> mark completed */}
          {perspective === 'tutor' && booking.status === 'confirmed' && onComplete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isActionLoading}
              onClick={() => onComplete(booking)}
              className="min-h-[44px] text-emerald-800 border-emerald-300 hover:bg-emerald-50 gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              Tandai Selesai
            </Button>
          )}

          {/* Student action for pending booking -> pay now */}
          {perspective === 'student' && booking.status === 'pending' && onPay && (
            <Button
              type="button"
              size="sm"
              disabled={isActionLoading}
              onClick={() => onPay(booking)}
              className="min-h-[44px] bg-brand-primary text-white hover:bg-brand-primary/90 gap-1.5 font-semibold text-xs"
            >
              <CreditCard className="w-4 h-4" />
              Bayar Sekarang
            </Button>
          )}

          {/* Student action for completed booking -> review tutor */}
          {perspective === 'student' && booking.status === 'completed' && onReview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isActionLoading}
              onClick={() => onReview(booking)}
              className="min-h-[44px] text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10 gap-1.5 font-semibold text-xs"
            >
              <MessageSquare className="w-4 h-4" />
              Beri Ulasan
            </Button>
          )}

          {/* Cancellation button for student or tutor on active bookings */}
          {(booking.status === 'pending' || booking.status === 'confirmed') && onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isActionLoading}
              onClick={() => onCancel(booking)}
              className="min-h-[44px] text-ink-muted hover:text-danger hover:border-danger/40 text-xs"
            >
              Batalkan Sesi
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
