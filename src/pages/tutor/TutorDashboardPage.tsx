import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Users,
  CheckCircle,
  Clock,
  CalendarCheck,
  Sliders,
  MessageSquare,
  RefreshCw,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { ErrorState } from '@/components/ui/ErrorState'
import { bookingService } from '@/services/bookingService'
import { useAuth } from '@/hooks/useAuth'
import { formatLongDate, getFirstName } from '@/utils/format'

interface DashboardCounts {
  activeStudentsCount: number
  upcomingSessionsCount: number
  pendingRequestsCount: number
  completedSessionsCount: number
}

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
  const [counts, setCounts] = useState<DashboardCounts>({
    activeStudentsCount: 0,
    upcomingSessionsCount: 0,
    pendingRequestsCount: 0,
    completedSessionsCount: 0,
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    async function loadCounts(tutorUserId: string) {
      try {
        const result = await bookingService.getTutorDashboardCounts(tutorUserId)
        if (isMounted) {
          setCounts(result)
          setErrorMsg(null)
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMsg(
            err instanceof Error ? err.message : 'Gagal memuat ringkasan statistik tutor.'
          )
        }
      } finally {
        if (isMounted) {
          setRefreshing(false)
        }
      }
    }

    loadCounts(userId)
    return () => {
      isMounted = false
    }
  }, [userId, reloadKey])

  const handleRefresh = () => {
    setRefreshing(true)
    setErrorMsg(null)
    setReloadKey((k) => k + 1)
  }

  const activeStudentsDisplay = useAnimatedCount(counts.activeStudentsCount)
  const upcomingSessionsDisplay = useAnimatedCount(counts.upcomingSessionsCount)
  const pendingRequestsDisplay = useAnimatedCount(counts.pendingRequestsCount)
  const completedSessionsDisplay = useAnimatedCount(counts.completedSessionsCount)

  return (
    <AppShell>
      <PageHeader
        title={`Dashboard Tutor: ${tutorName}`}
        subtitle={`Hari ini adalah ${todayStr}. Pantau jumlah murid aktif, sesi mendatang, permintaan menunggu, dan sesi selesai.`}
        badge="Tutor Portal"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-white border border-border text-ink-primary text-xs font-bold shadow-2xs hover:bg-surface transition-colors gap-2 min-h-[44px] cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-brand-primary ${refreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
            <Link
              to="/tutor/sessions"
              className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl bg-surface border border-border text-ink-primary text-xs font-bold shadow-2xs hover:bg-neutral-50 transition-colors gap-2 min-h-[44px]"
            >
              <Clock className="w-4 h-4 text-brand-primary" />
              <span>Riwayat Sesi Belajar</span>
            </Link>
            <Link
              to="/tutor/availability"
              className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-2xs hover:bg-brand-primary/90 transition-colors gap-2 min-h-[44px]"
            >
              <Sliders className="w-4 h-4" />
              <span>Atur Jam Ketersediaan</span>
            </Link>
          </div>
        }
      />

      {errorMsg ? (
        <ErrorState
          title="Kendala Memuat Statistik Tutor"
          message={errorMsg}
          onRetry={handleRefresh}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            label="Murid Aktif"
            value={activeStudentsDisplay}
            description={
              counts.activeStudentsCount > 0
                ? 'Murid terhubung dalam bimbingan'
                : 'Belum ada murid bimbingan'
            }
            icon={Users}
            iconBg="bg-brand-primary/10"
            iconColor="text-brand-primary"
            action={
              <Link
                to="/tutor/messages"
                className="inline-flex items-center gap-1 text-brand-primary font-bold hover:underline"
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
              counts.upcomingSessionsCount > 0
                ? 'Sesi terkonfirmasi siap berjalan'
                : 'Tidak ada sesi terjadwal'
            }
            icon={CalendarCheck}
            iconBg="bg-brand-primary/10"
            iconColor="text-brand-primary"
            action={
              <Link
                to="/tutor/sessions"
                className="text-brand-primary font-bold hover:underline"
              >
                Lihat Sesi
              </Link>
            }
          />

          <StatCard
            label="Permintaan Menunggu"
            value={pendingRequestsDisplay}
            description={
              counts.pendingRequestsCount > 0
                ? 'Menunggu verifikasi Super Admin'
                : 'Semua permintaan telah diproses'
            }
            icon={Clock}
            iconBg="bg-warning/10"
            iconColor="text-warning"
            action={
              <Link
                to="/tutor/availability"
                className="text-ink-primary font-bold hover:underline"
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
                className="text-success font-bold hover:underline"
              >
                Riwayat
              </Link>
            }
          />
        </div>
      )}
    </AppShell>
  )
}
