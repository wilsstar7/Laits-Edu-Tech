import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Bell, CheckCheck, Loader2, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Info, AlertTriangle, BookOpen } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { notificationService } from '@/services/notificationService'
import type { AppNotification } from '@/types/notification'
import { formatReportDate } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const limit = 10

  const handlePageChange = (newPage: number) => {
    setLoading(true)
    setPage(newPage)
  }

  const handleRefresh = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await notificationService.getNotifications(page, limit)
      setNotifications(res.notifications)
      setTotal(res.total)
    } catch {
      setErrorMsg('Gagal memuat daftar pemberitahuan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    notificationService
      .getNotifications(page, limit)
      .then((res) => {
        if (isMounted) {
          setNotifications(res.notifications)
          setTotal(res.total)
          setErrorMsg(null)
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMsg('Gagal memuat daftar pemberitahuan. Silakan coba lagi.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [page, limit])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch {
      toast.error('Gagal memperbarui notifikasi.')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success('Semua notifikasi telah ditandai dibaca.')
    } catch {
      toast.error('Gagal menandai notifikasi.')
    }
  }

  const filteredNotifs = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications

  const totalPages = Math.ceil(total / limit) || 1

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <BookOpen className="w-4 h-4 text-[#6C5CE7]" />
      case 'payment':
        return <CheckCircle2 className="w-4 h-4 text-[#22864C]" />
      case 'report':
        return <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
      default:
        return <Info className="w-4 h-4 text-[#6C5CE7]" />
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Pemberitahuan & Notifikasi"
        subtitle="Arsip pengumuman penting, jadwal bimbingan belajar, dan konfirmasi transaksi Anda."
        badge="Pemberitahuan"
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-border text-foreground text-xs font-semibold hover:bg-[#EEF0F8] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="rounded-xl text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#22864C]" />
              <span>Tandai Semua Dibaca</span>
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-[#6C5CE7] text-white shadow-xs'
              : 'bg-white border border-border text-[#676A78] hover:bg-[#EEF0F8]'
          }`}
        >
          Semua ({total})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'unread'
              ? 'bg-[#6C5CE7] text-white shadow-xs'
              : 'bg-white border border-border text-[#676A78] hover:bg-[#EEF0F8]'
          }`}
        >
          Belum Dibaca ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* List Container */}
      <div className="mt-4">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-border">
            <Loader2 className="w-6 h-6 animate-spin text-[#6C5CE7]" />
            <p className="text-xs text-[#676A78]">Memuat riwayat notifikasi...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-border space-y-3">
            <AlertTriangle className="w-8 h-8 text-[#EF4444] mx-auto" />
            <p className="text-sm font-semibold text-foreground">{errorMsg}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="rounded-xl text-xs">
              Coba Lagi
            </Button>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-border space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-foreground">Tidak ada pemberitahuan</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {filter === 'unread'
                ? 'Semua pemberitahuan telah dibaca.'
                : 'Belum ada notifikasi atau pembaruan baru dari sistem.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all ${
                  notif.isRead
                    ? 'bg-white border-border/80'
                    : 'bg-[#F9F8FE] border-[#6C5CE7]/30 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h3 className={`text-sm ${notif.isRead ? 'font-semibold text-foreground' : 'font-extrabold text-[#17181C]'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatReportDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#676A78] mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.linkUrl && (
                      <div className="mt-2.5">
                        <Link
                          to={notif.linkUrl}
                          className="inline-flex items-center text-xs font-bold text-[#6C5CE7] hover:underline"
                        >
                          Buka tautan &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white p-3 rounded-2xl border border-border">
            <span className="text-xs text-[#676A78]">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="rounded-xl text-xs h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="sr-only">Sebelumnya</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="rounded-xl text-xs h-8 px-2"
              >
                <ChevronRight className="w-4 h-4" />
                <span className="sr-only">Berikutnya</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
