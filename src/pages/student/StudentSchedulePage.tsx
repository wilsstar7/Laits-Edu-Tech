import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Calendar,
  Plus,
  ArrowRight,
  CalendarCheck,
  History,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { BookingCard } from '@/components/booking/BookingCard'
import { BookingCancelDialog } from '@/components/booking/BookingCancelDialog'
import { ReviewFormModal } from '@/components/review/ReviewFormModal'
import { bookingService } from '@/services/bookingService'
import { paymentService } from '@/services/paymentService'
import type { Booking } from '@/types/booking'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function StudentSchedulePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming')

  // Dialog states
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  useEffect(() => {
    let isMounted = true

    bookingService
      .getStudentBookings()
      .then((data) => {
        if (isMounted) setBookings(data)
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat jadwal belajar Anda.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const reloadBookings = () => {
    setLoading(true)
    setErrorMsg(null)
    bookingService
      .getStudentBookings()
      .then((data) => {
        setBookings(data)
      })
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat jadwal belajar Anda.')
      })
      .finally(() => setLoading(false))
  }

  // Filter bookings by tab
  const { upcomingBookings, historyBookings } = useMemo(() => {
    const now = new Date()
    const upcoming: Booking[] = []
    const history: Booking[] = []

    for (const b of bookings) {
      const isPast = new Date(b.scheduledEnd) < now
      const isTerminal = b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected'

      if (!isPast && !isTerminal) {
        upcoming.push(b)
      } else {
        history.push(b)
      }
    }

    return {
      upcomingBookings: upcoming.sort(
        (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
      ),
      historyBookings: history.sort(
        (a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime()
      ),
    }
  }, [bookings])

  const displayedBookings = tab === 'upcoming' ? upcomingBookings : historyBookings

  const handleConfirmCancel = async (bookingId: string, reason: string) => {
    try {
      await bookingService.cancelBooking(bookingId, reason)
      toast.success('Sesi belajar berhasil dibatalkan.')
      reloadBookings()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membatalkan sesi belajar.'
      toast.error(msg)
      throw err
    }
  }

  const handlePayBooking = async (booking: Booking) => {
    setIsProcessingPayment(true)
    try {
      const paymentId = await paymentService.createPayment({
        bookingId: booking.id,
        paymentMethod: 'manual_transfer',
      })
      navigate(`/student/payments/${paymentId}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat tagihan pembayaran.'
      toast.error(msg)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Jadwal Belajar Saya"
        subtitle="Kelola seluruh sesi bimbingan belajar privat, ruang temu daring, dan status konfirmasi tutor."
        badge="Jadwal & Sesi"
        action={
          <Link
            to="/student/tutors"
            className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-sm hover:bg-brand-primary/90 transition-colors gap-2 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Pesan Sesi Baru</span>
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <Skeleton className="w-64 h-11 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="w-full h-36 rounded-2xl" />
            <Skeleton className="w-full h-36 rounded-2xl" />
          </div>
        </div>
      ) : errorMsg ? (
        <ErrorState
          title="Kendala Memuat Jadwal"
          message={errorMsg}
          onRetry={reloadBookings}
        />
      ) : (
        <div className="space-y-6">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-surface rounded-xl border border-border w-fit">
            <button
              type="button"
              onClick={() => setTab('upcoming')}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                tab === 'upcoming'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Sesi Mendatang ({upcomingBookings.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('history')}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                tab === 'history'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Selesai ({historyBookings.length})</span>
            </button>
          </div>

          {/* Bookings List */}
          {displayedBookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink-primary">
                  {tab === 'upcoming'
                    ? 'Belum ada sesi belajar mendatang'
                    : 'Belum ada riwayat sesi belajar'}
                </h3>
                <p className="text-xs text-ink-muted max-w-sm mx-auto">
                  {tab === 'upcoming'
                    ? 'Pilih tutor favorit Anda untuk menjadwalkan bimbingan belajar personal pertama Anda.'
                    : 'Semua sesi yang telah selesai atau dibatalkan akan tercatat di halaman riwayat ini.'}
                </p>
              </div>
              {tab === 'upcoming' && (
                <Link
                  to="/student/tutors"
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 shadow-xs inline-flex items-center gap-2 transition-colors"
                >
                  <span>Cari Tutor Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedBookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  perspective="student"
                  onCancel={(booking) => setCancellingBooking(booking)}
                  onPay={handlePayBooking}
                  onReview={(booking) => setReviewingBooking(booking)}
                  isActionLoading={isProcessingPayment}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <BookingCancelDialog
          booking={cancellingBooking}
          mode="cancel"
          isOpen={true}
          onClose={() => setCancellingBooking(null)}
          onConfirm={handleConfirmCancel}
        />
      )}

      {/* Review Submission Modal */}
      {reviewingBooking && (
        <ReviewFormModal
          bookingId={reviewingBooking.id}
          tutorName={reviewingBooking.tutorName}
          subjectName={reviewingBooking.subjectName}
          isOpen={true}
          onClose={() => setReviewingBooking(null)}
          onSuccess={reloadBookings}
        />
      )}
    </AppShell>
  )
}
