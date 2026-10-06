import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Power,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { tutorAvailabilityService } from '@/services/tutorAvailabilityService'
import { formatDayName } from '@/utils/format'
import type { TutorAvailabilityRule } from '@/types/tutor'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0] // Senin through Minggu

const TIME_OPTIONS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00',
]

export function TutorAvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<TutorAvailabilityRule[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // New slot form state
  const [newDay, setNewDay] = useState(1) // Senin
  const [newStartTime, setNewStartTime] = useState('16:00')
  const [newEndTime, setNewEndTime] = useState('18:00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Deleting slot ID state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    tutorAvailabilityService
      .getMyAvailability()
      .then((data) => {
        if (isMounted) setRules(data)
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat jadwal ketersediaan Anda.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const reloadRules = () => {
    setLoading(true)
    setErrorMsg(null)
    tutorAvailabilityService
      .getMyAvailability()
      .then((data) => {
        setRules(data)
      })
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat jadwal ketersediaan Anda.')
      })
      .finally(() => setLoading(false))
  }

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate times
    if (newEndTime <= newStartTime) {
      setFormError('Jam selesai harus lebih akhir dari jam mulai.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      await tutorAvailabilityService.addAvailabilityRule({
        dayOfWeek: newDay,
        startTime: `${newStartTime}:00`,
        endTime: `${newEndTime}:00`,
        timezone: 'Asia/Jakarta',
      })

      toast.success('Slot jadwal baru berhasil ditambahkan!')
      reloadRules()
    } catch (err: unknown) {
      console.error('Failed to add slot:', err)
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal menambahkan slot jadwal. Periksa kemungkinan tumpang tindih waktu.'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (rule: TutorAvailabilityRule) => {
    const nextState = !rule.isActive
    try {
      await tutorAvailabilityService.toggleAvailabilityActive(rule.id, nextState)
      toast.success(
        nextState ? 'Slot jadwal diaktifkan kembali.' : 'Slot jadwal dinonaktifkan sementara.'
      )
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, isActive: nextState } : r))
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status slot.'
      toast.error(msg)
    }
  }

  const handleDelete = async (ruleId: string) => {
    setDeletingId(ruleId)
    try {
      await tutorAvailabilityService.deleteAvailabilityRule(ruleId)
      toast.success('Slot jadwal berhasil dihapus.')
      setRules((prev) => prev.filter((r) => r.id !== ruleId))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus slot.'
      toast.error(msg)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppShell>
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/tutor/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-brand-primary min-h-[44px] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Tutor</span>
        </Link>
      </div>

      <PageHeader
        title="Pengaturan Jam Ketersediaan"
        subtitle="Atur pola ketersediaan jam mengajar mingguan Anda. Murid hanya dapat memesan sesi pada rentang waktu yang aktif."
        badge="Manajemen Jadwal"
      />

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <Card className="h-44 bg-white border-border" />
          <Card className="h-64 bg-white border-border" />
        </div>
      ) : errorMsg ? (
        <ErrorState
          title="Kendala Memuat Ketersediaan"
          message={errorMsg}
          onRetry={reloadRules}
        />
      ) : (
        <div className="space-y-8">
          {/* Form: Tambah Slot Baru */}
          <Card className="border border-border/80 bg-white shadow-xs">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-primary" />
                  Tambah Rentang Jam Mengajar Baru
                </h3>
                <p className="text-xs text-ink-muted">
                  Pilih hari dan tentukan rentang jam buka sesi (WIB).
                </p>
              </div>

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Hari */}
                  <div>
                    <label
                      htmlFor="slot-day-select"
                      className="block text-xs font-semibold text-ink-primary mb-1.5"
                    >
                      Hari
                    </label>
                    <NativeSelect
                      id="slot-day-select"
                      value={newDay.toString()}
                      onChange={(e) => setNewDay(parseInt(e.target.value, 10))}
                      className="w-full min-h-[44px]"
                    >
                      {DAYS_ORDER.map((d) => (
                        <option key={d} value={d}>
                          {formatDayName(d)}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>

                  {/* Jam Mulai */}
                  <div>
                    <label
                      htmlFor="slot-start-select"
                      className="block text-xs font-semibold text-ink-primary mb-1.5"
                    >
                      Jam Mulai (WIB)
                    </label>
                    <NativeSelect
                      id="slot-start-select"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full min-h-[44px]"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t} WIB
                        </option>
                      ))}
                    </NativeSelect>
                  </div>

                  {/* Jam Selesai */}
                  <div>
                    <label
                      htmlFor="slot-end-select"
                      className="block text-xs font-semibold text-ink-primary mb-1.5"
                    >
                      Jam Selesai (WIB)
                    </label>
                    <NativeSelect
                      id="slot-end-select"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full min-h-[44px]"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t} WIB
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-danger/5 rounded-xl border border-danger/20 flex items-center gap-2 text-xs text-danger">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-[44px] bg-brand-primary text-white hover:bg-brand-primary/90 font-bold text-xs gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menambahkan Slot...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Simpan Slot Jadwal
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Weekly Schedule Overview */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-primary" />
                Daftar Ketersediaan Mingguan
              </h3>
              <p className="text-xs text-ink-muted">
                Slot yang berstatus nonaktif tidak akan muncul sebagai pilihan booking calon murid.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS_ORDER.map((dayNum) => {
                const dayRules = rules.filter((r) => r.dayOfWeek === dayNum)
                const dayTitle = formatDayName(dayNum)

                return (
                  <Card
                    key={dayNum}
                    className="border border-border/80 bg-white shadow-xs flex flex-col justify-between"
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <span className="font-bold text-sm text-ink-primary">
                          {dayTitle}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            dayRules.length > 0
                              ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                              : 'bg-surface text-ink-muted'
                          }`}
                        >
                          {dayRules.length} Slot
                        </Badge>
                      </div>

                      {dayRules.length === 0 ? (
                        <div className="py-4 text-center">
                          <p className="text-xs text-ink-muted">Tidak ada jadwal aktif</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {dayRules.map((rule) => {
                            const isDeleting = deletingId === rule.id

                            return (
                              <div
                                key={rule.id}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                  rule.isActive
                                    ? 'bg-surface border-border'
                                    : 'bg-muted/30 border-border/60 opacity-60'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink-primary">
                                    <Clock className="w-3.5 h-3.5 text-brand-primary" />
                                    <span>
                                      {rule.startTime} - {rule.endTime} WIB
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-ink-muted block">
                                    {rule.isActive ? 'Bisa Dipesan' : 'Dinonaktifkan'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {/* Toggle Active */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(rule)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs transition-colors ${
                                      rule.isActive
                                        ? 'text-emerald-700 hover:bg-emerald-50'
                                        : 'text-ink-muted hover:bg-surface'
                                    }`}
                                    title={rule.isActive ? 'Nonaktifkan slot' : 'Aktifkan slot'}
                                    aria-label="Toggle aktif slot"
                                  >
                                    <Power className="w-4 h-4" />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => handleDelete(rule.id)}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-danger hover:bg-danger/10 transition-colors"
                                    title="Hapus slot"
                                    aria-label="Hapus slot"
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
