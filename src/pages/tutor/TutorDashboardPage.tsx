import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import {
  Users,
  CheckCircle,
  Clock,
  CalendarCheck,
  CalendarClock,
  ArrowRight,
  Sliders,
  MessageSquare,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { ErrorState } from '@/components/ui/ErrorState'
import { BookingCard } from '@/components/booking/BookingCard'
import { BookingCancelDialog } from '@/components/booking/BookingCancelDialog'
import { bookingService } from '@/services/bookingService'
import { useAuth } from '@/hooks/useAuth'
import { formatLongDate, getFirstName } from '@/utils/format'
import type { Booking } from '@/types/booking'

function useAnimatedCount(target: number, durationMs = 450): number {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let frameId = 0
    const startTime = performance.now()

    const step = (now: number) => {
      if (prefersReducedMotion || target === 0) {
        setDisplayValue(target)
        return
      }
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(target * eased))

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [target, durationMs])

  return displayValue
}

export function TutorDashboardPage() {
  const { profile, user } = useAuth()
  const userId = user?.id
  const tutorName = profile?.full_name ? getFirstName(profile.full_name) : 'Tutor'
  const todayStr = formatLongDate(new Date())

  const [refreshing, setRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [actionBooking, setActionBooking] = useState<{
    booking: Booking
    mode: 'cancel' | 'reject'
  } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    async function init(tutorUserId: string) {
      try {
        const bookingsData = await bookingService.getTutorBookings(tutorUserId)
        if (isMounted) {
          setAllBookings(bookingsData)
          setErrorMsg(null)
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMsg(
            err instanceof Error ? err.message : 'Gagal memuat dashboard bimbingan tutor.'
          )
        }
      } finally {
        if (isMounted) {
          setRefreshing(false)
        }
      }
    }

    init(userId)
    return () => {
      isMounted = false
    }
  }, [userId, reloadKey])

  const reloadData = () => {
    setRefreshing(true)
    setErrorMsg(null)
    setReloadKey((k) => k + 1)
  }

  const stats = useMemo(
    () => bookingService.computeTutorDashboardStats(allBookings),
    [allBookings]
  )

  const activeStudentsDisplay = useAnimatedCount(stats.activeStudentsCount)
  const upcomingSessionsDisplay = useAnimatedCount(stats.upcomingSessionsCount)
  const pendingRequestsDisplay = useAnimatedCount(stats.pendingRequestsCount)
  const completedSessionsDisplay = useAnimatedCount(stats.completedSessionsCount)

  const { pendingRequests, upcomingSessions } = useMemo(() => {
    const pending = allBookings.filter((b) => b.status === 'pending')
    const upcoming = allBookings.filter((b) => b.status === 'confirmed')

    return {
      pendingRequests: [...pending].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
      upcomingSessions: [...upcoming].sort(
        (a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
      ),
    }
  }, [allBookings])

  const handleComplete = async (booking: Booking) => {
    try {
      await bookingService.updateBookingStatus(booking.id, 'completed')
      toast.success('Sesi bimbingan ditandai selesai.')
      reloadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status sesi.'
      toast.error(msg)
    }
  }

  const handleConfirmRejectionOrCancel = async (bookingId: string, reason: string) => {
    if (!actionBooking) return
    const targetStatus = actionBooking.mode === 'reject' ? 'rejected' : 'cancelled'

    try {
      await bookingService.updateBookingStatus(bookingId, targetStatus, { reason })
      toast.success(
        actionBooking.mode === 'reject'
          ? 'Permintaan sesi berhasil ditolak.'
          : 'Sesi berhasil dibatalkan.'
      )
      reloadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses perubahan sesi.'
      toast.error(msg)
      throw err
    }
  }

  return (
    <AppShell>
      <PageHeader
        title={`Dashboard Tutor: ${tutorName}`}
        subtitle={`Hari ini adalah ${todayStr}. Pantau permintaan masuk, jadwal mengajar, dan murid bimbingan Anda.`}
        badge="Tutor Portal"
        action={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link
              to="/tutor/availability"
              className="inline-flex items-center justify-center flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 active:scale-[0.98] transition-colors gap-2 min-h-[44px]"
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Atur Jam Ketersediaan</span>
            </Link>
            <button
              type="button"
              onClick={reloadData}
              disabled={refreshing}
              className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-white border border-border text-ink-primary text-xs font-bold hover:bg-surface transition-colors gap-2 min-h-[44px] cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-brand-primary shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        }
      />

      {errorMsg ? (
        <ErrorState
          title="Kendala Memuat Dashboard"
          message={errorMsg}
          onRetry={reloadData}
        />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-5">
            <StatCard
              label="Murid Aktif"
              value={activeStudentsDisplay}
              description={
                stats.activeStudentsCount > 0
                  ? 'Murid terhubung dalam bimbingan aktif'
                  : 'Belum ada murid bimbingan'
              }
              icon={Users}
              iconBg="bg-brand-primary/10"
              iconColor="text-brand-primary"
              action={
                <Link
                  to="/tutor/messages"
                  className="min-h-[44px] inline-flex items-center gap-1 text-brand-primary font-bold hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Pesan</span>
                </Link>
              }
            />

            <StatCard
              label="Sesi Mendatang"
              value={upcomingSessionsDisplay}
              description={
                stats.upcomingSessionsCount > 0
                  ? 'Sesi terjadwal siap dilaksanakan'
                  : 'Tidak ada sesi terjadwal'
              }
              icon={CalendarCheck}
              iconBg="bg-brand-primary/10"
              iconColor="text-brand-primary"
              action={
                <Link
                  to="/tutor/sessions"
                  className="min-h-[44px] inline-flex items-center text-brand-primary font-bold hover:underline"
                >
                  Lihat Sesi
                </Link>
              }
            />

            <StatCard
              label="Permintaan Menunggu"
              value={pendingRequestsDisplay}
              description={
                stats.pendingRequestsCount > 0
                  ? 'Menunggu verifikasi pembayaran Super Admin'
                  : 'Semua permintaan telah diproses'
              }
              icon={Clock}
              iconBg="bg-warning/10"
              iconColor="text-warning"
              action={
                <Link
                  to="/tutor/availability"
                  className="min-h-[44px] inline-flex items-center text-ink-primary font-bold hover:underline"
                >
                  Jadwal
                </Link>
              }
            />

            <StatCard
              label="Sesi Selesai"
              value={completedSessionsDisplay}
              description="Total sesi bimbingan tuntas"
              icon={CheckCircle}
              iconBg="bg-success/10"
              iconColor="text-success"
              action={
                <Link
                  to="/tutor/sessions"
                  className="min-h-[44px] inline-flex items-center text-success font-bold hover:underline"
                >
                  Riwayat
                </Link>
              }
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ink-primary flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning shrink-0" />
                  <span>Permintaan Sesi Belajar Masuk ({pendingRequestsDisplay})</span>
                </h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Daftar sesi belajar dari murid. Sesi akan otomatis terkonfirmasi setelah pembayaran diverifikasi oleh Super Admin.
                </p>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-5 sm:p-6 bg-white rounded-2xl border border-dashed border-border text-center">
                  <p className="text-xs text-ink-muted">
                    Tidak ada permintaan sesi yang menunggu konfirmasi saat ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      perspective="tutor"
                      onReject={(booking) =>
                        setActionBooking({ booking, mode: 'reject' })
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ink-primary flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-brand-primary shrink-0" />
                  <span>Jadwal Mengajar Terkonfirmasi ({upcomingSessionsDisplay})</span>
                </h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Sesi privat yang siap dilaksanakan sesuai jadwal waktu yang disepakati.
                </p>
              </div>

              {upcomingSessions.length === 0 ? (
                <div className="p-6 sm:p-8 bg-white rounded-2xl border border-dashed border-border text-center space-y-2.5">
                  <p className="text-xs font-semibold text-ink-primary">
                    Belum ada jadwal mengajar terkonfirmasi mendatang
                  </p>
                  <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                    Pastikan jam ketersediaan mingguan Anda telah aktif agar murid dapat menemukan dan memesan sesi belajar.
                  </p>
                  <Link
                    to="/tutor/availability"
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface border border-border text-brand-primary hover:bg-brand-primary/5 text-xs font-bold inline-flex items-center justify-center gap-1.5 mt-1 w-full sm:w-auto"
                  >
                    <span>Atur Jam Ketersediaan</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((b) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      perspective="tutor"
                      onComplete={handleComplete}
                      onCancel={(booking) =>
                        setActionBooking({ booking, mode: 'cancel' })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {actionBooking && (
        <BookingCancelDialog
          booking={actionBooking.booking}
          mode={actionBooking.mode}
          isOpen={true}
          onClose={() => setActionBooking(null)}
          onConfirm={handleConfirmRejectionOrCancel}
        />
      )}
    </AppShell>
  )
}
