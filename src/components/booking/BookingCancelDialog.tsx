import { useState } from 'react'
import { AlertCircle, X, Loader2 } from 'lucide-react'
import type { Booking } from '@/types/booking'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utils/format'

interface BookingCancelDialogProps {
  booking: Booking | null
  mode: 'cancel' | 'reject'
  isOpen: boolean
  onClose: () => void
  onConfirm: (bookingId: string, reason: string) => Promise<void>
}

const CANCEL_REASONS = [
  'Ada keperluan mendadak',
  'Jadwal bentrok dengan kegiatan lain',
  'Ingin mengganti jadwal ke waktu lain',
  'Kendala teknis atau koneksi internet',
  'Lainnya',
]

const REJECT_REASONS = [
  'Jadwal berhalangan atau ada agenda mendadak',
  'Mata pelajaran di luar spesialisasi mendalam',
  'Slot waktu sudah tidak tersedia',
  'Lainnya',
]

export function BookingCancelDialog({
  booking,
  mode,
  isOpen,
  onClose,
  onConfirm,
}: BookingCancelDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen || !booking) return null

  const title = mode === 'reject' ? 'Tolak Permintaan Sesi' : 'Batalkan Sesi Belajar'
  const isReject = mode === 'reject'
  const reasonPresets = isReject ? REJECT_REASONS : CANCEL_REASONS

  const finalReason =
    selectedPreset === 'Lainnya' ? customReason.trim() : (selectedPreset || customReason.trim())

  const handleConfirm = async () => {
    if (!finalReason) {
      setErrorMsg('Mohon isi atau pilih alasan terlebih dahulu.')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    try {
      await onConfirm(booking.id, finalReason)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses pembatalan.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-border p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-danger">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h3 id="cancel-dialog-title" className="font-bold text-ink-primary text-base">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface focus:outline-none"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info detail */}
        <div className="p-3 bg-surface rounded-xl border border-border text-xs space-y-1">
          <p className="font-semibold text-ink-primary">
            {booking.subjectName} ({booking.tutorName})
          </p>
          <p className="text-ink-muted">
            Jadwal: {formatDateTime(booking.scheduledStart)}
          </p>
        </div>

        {/* Form Alasan */}
        <div className="space-y-3">
          <label
            htmlFor="preset-reason"
            className="block text-xs font-semibold text-ink-primary"
          >
            Pilih Alasan:
          </label>
          <div className="space-y-2">
            {reasonPresets.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedPreset === r
                    ? 'border-brand-primary bg-brand-primary/5 text-ink-primary font-medium'
                    : 'border-border bg-white text-ink-secondary hover:bg-surface'
                }`}
              >
                <input
                  type="radio"
                  name="cancellation-reason"
                  value={r}
                  checked={selectedPreset === r}
                  onChange={() => {
                    setSelectedPreset(r)
                    setErrorMsg(null)
                  }}
                  className="w-4 h-4 text-brand-primary"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          {selectedPreset === 'Lainnya' && (
            <div className="pt-1">
              <label htmlFor="custom-reason" className="block text-xs font-semibold text-ink-primary mb-1">
                Jelaskan Alasan:
              </label>
              <textarea
                id="custom-reason"
                rows={3}
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value)
                  setErrorMsg(null)
                }}
                placeholder="Tuliskan alasan spesifik..."
                className="w-full text-xs p-3 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="text-xs text-danger font-medium p-2 bg-danger/5 rounded-lg border border-danger/20">
            {errorMsg}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="min-h-[44px]"
          >
            Kembali
          </Button>
          <Button
            type="button"
            disabled={loading || !finalReason}
            onClick={handleConfirm}
            className="min-h-[44px] bg-danger text-white hover:bg-danger/90 gap-1.5"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isReject ? 'Tolak Sesi' : 'Ya, Batalkan'}
          </Button>
        </div>
      </div>
    </div>
  )
}
