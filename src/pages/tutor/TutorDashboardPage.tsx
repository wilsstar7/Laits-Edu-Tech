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
} from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function TutorDashboardPage() {
  const { profile } = useAuth()
  const tutorName = profile?.full_name ? getFirstName(profile.full_name) : 'Tutor'
  const todayStr = formatLongDate(new Date())

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({
    activeStudentsCount: 0,
    upcomingSessionsCount: 0,
    completedSessionsCount: 0,
    pendingRequestsCount: 0,
  })

  // Rejection / Cancel modal state
  const [actionBooking, setActionBooking] = useState<{
    booking: Booking
    mode: 'cancel' | 'reject'
  } | null>(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const [statsData, bookingsData] = await Promise.all([
          bookingService.getTutorDashboardStats(),
          bookingService.getTutorBookings(),
        ])

        if (isMounted) {
          setStats({
            activeStudentsCount: statsData.activeStudentsCount,
            upcomingSessionsCount: statsData.upcomingSessionsCount,
            completedSessionsCount: statsData.completedSessionsCount,
            pendingRequestsCount: statsData.pendingRequestsCount,
          })
          setAllBookings(bookingsData)
        }
      } catch (err: unknown) {
        console.error('Failed to load tutor dashboard:', err)
        if (isMounted) {
          setErrorMsg(
            err instanceof Error ? err.message : 'Gagal memuat dashboard bimbingan tutor.'
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()
    return () => {
      isMounted = false
    }
  }, [])

  const reloadData = () => {
    setLoading(true)
    setErrorMsg(null)
    Promise.all([
      bookingService.getTutorDashboardStats(),
      bookingService.getTutorBookings(),
    ])
      .then(([statsData, bookingsData]) => {
        setStats({
          activeStudentsCount: statsData.activeStudentsCount,
          upcomingSessionsCount: statsData.upcomingSessionsCount,
          completedSessionsCount: statsData.completedSessionsCount,
          pendingRequestsCount: statsData.pendingRequestsCount,
        })
        setAllBookings(bookingsData)
      })
      .catch((err) => {
        setErrorMsg(
          err instanceof Error ? err.message : 'Gagal memuat dashboard bimbingan tutor.'
        )
      })
      .finally(() => setLoading(false))
  }

  // Split into pending requests and confirmed/upcoming sessions
  const { pendingRequests, upcomingSessions } = useMemo(() => {
    const now = new Date()
    const pending = allBookings.filter((b) => b.status === 'pending')
    const upcoming = allBookings.filter(
      (b) => b.status === 'confirmed' && new Date(b.scheduledEnd) >= now
    )

    return {
      pendingRequests: pending.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
      upcomingSessions: upcoming.sort(
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
          <div className="flex items-center gap-2">
            <Link
              to="/tutor/sessions"
              className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl bg-surface border border-border text-ink-primary text-xs font-bold shadow-sm hover:bg-neutral-50 transition-colors gap-2 min-h-[44px]"
            >
              <Clock className="w-4 h-4 text-brand-primary" />
              <span>Riwayat Sesi Belajar</span>
            </Link>
            <Link
              to="/tutor/availability"
              className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-sm hover:bg-brand-primary/90 transition-colors gap-2 min-h-[44px]"
            >
              <Sliders className="w-4 h-4" />
              <span>Atur Jam Ketersediaan</span>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : errorMsg ? (
        <ErrorState
          title="Kendala Memuat Dashboard"
          message={errorMsg}
          onRetry={reloadData}
        />
      ) : (
        <div className="space-y-8">
          {/* 4 Authentic Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              label="Murid Aktif"
              value={stats.activeStudentsCount.toString()}
              description={
                stats.activeStudentsCount > 0
                  ? 'Murid terhubung dalam bimbingan aktif'
                  : 'Belum ada murid bimbingan'
              }
              icon={Users}
              iconBg="bg-brand-primary/10"
              iconColor="text-brand-primary"
            />

            <StatCard
              label="Sesi Mendatang"
              value={stats.upcomingSessionsCount.toString()}
              description={
                stats.upcomingSessionsCount > 0
                  ? 'Sesi terjadwal siap dilaksanakan'
                  : 'Tidak ada sesi terjadwal'
              }
              icon={CalendarCheck}
              iconBg="bg-brand-primary/10"
              iconColor="text-brand-primary"
            />

            <StatCard
              label="Permintaan Menunggu"
              value={stats.pendingRequestsCount.toString()}
              description={
                stats.pendingRequestsCount > 0
                  ? 'Menunggu verifikasi pembayaran Super Admin'
                  : 'Semua permintaan telah diproses'
              }
              icon={Clock}
              iconBg="bg-warning/10"
              iconColor="text-warning"
            />

            <StatCard
              label="Sesi Selesai"
              value={stats.completedSessionsCount.toString()}
              description="Total sesi bimbingan tuntas"
              icon={CheckCircle}
              iconBg="bg-success/10"
              iconColor="text-success"
            />
          </div>

          {/* Section: Pending Booking Requests (Actionable) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  Permintaan Sesi Belajar Masuk
                </h3>
                <p className="text-xs text-ink-muted">
                  Daftar sesi belajar dari murid. Sesi akan otomatis terkonfirmasi setelah pembayaran diverifikasi oleh Super Admin.
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-dashed border-border text-center">
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

          {/* Section: Upcoming Confirmed Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-brand-primary" />
                  Jadwal Mengajar Terkonfirmasi
                </h3>
                <p className="text-xs text-ink-muted">
                  Sesi privat yang siap dilaksanakan sesuai jadwal waktu yang disepakati.
                </p>
              </div>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-dashed border-border text-center space-y-2">
                <p className="text-xs font-semibold text-ink-primary">
                  Belum ada jadwal mengajar terkonfirmasi mendatang
                </p>
                <p className="text-xs text-ink-muted max-w-sm mx-auto">
                  Pastikan jam ketersediaan mingguan Anda telah aktif agar murid dapat menemukan dan memesan sesi belajar.
                </p>
                <Link
                  to="/tutor/availability"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-surface border border-border text-brand-primary hover:bg-brand-primary/5 text-xs font-bold inline-flex items-center gap-1.5 mt-2"
                >
                  <span>Atur Jam Ketersediaan</span>
                  <ArrowRight className="w-4 h-4" />
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
      )}

      {/* Rejection / Cancellation Modal */}
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
