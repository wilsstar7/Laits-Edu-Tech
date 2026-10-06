import { useState } from 'react'
import {
  X,
  Info,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import type { TutorSummary, AvailableTimeSlot } from '@/types/tutor'
import type { Booking, BookingDurationMinutes } from '@/types/booking'
import { TutorAvailabilityCalendar } from '@/components/tutor/TutorAvailabilityCalendar'
import { bookingService } from '@/services/bookingService'
import { formatCurrency, formatDateTime } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface BookingDialogProps {
  tutor: TutorSummary
  initialSubjectId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (booking: Booking) => void
}

export function BookingDialog({
  tutor,
  initialSubjectId,
  isOpen,
  onClose,
  onSuccess,
}: BookingDialogProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (tutor.subjects[0]?.id ?? '')
  )
  const [duration, setDuration] = useState<BookingDurationMinutes>(60)
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null)
  const [studentNote, setStudentNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedSubject = tutor.subjects.find((s) => s.id === selectedSubjectId)
  const calculatedFee = Math.round((tutor.hourlyRate * duration) / 60)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSubjectId) {
      setErrorMsg('Pilih mata pelajaran terlebih dahulu.')
      return
    }

    if (!selectedSlot) {
      setErrorMsg('Pilih tanggal dan slot waktu belajar terlebih dahulu.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const newBooking = await bookingService.createBooking({
        tutorId: tutor.id,
        subjectId: selectedSubjectId,
        scheduledStart: selectedSlot.scheduledStart,
        scheduledEnd: selectedSlot.scheduledEnd,
        studentNote: studentNote.trim() || undefined,
        timezone: selectedSlot.timezone || 'Asia/Jakarta',
      })

      onSuccess(newBooking)
      onClose()
    } catch (err: unknown) {
      console.error('Booking submission error:', err)
      const message =
        err instanceof Error
          ? err.message
          : 'Gagal membuat pemesanan sesi belajar. Silakan coba lagi.'
      setErrorMsg(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border">
              {tutor.avatarUrl && <AvatarImage src={tutor.avatarUrl} alt={tutor.fullName} />}
              <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold">
                {tutor.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 id="booking-modal-title" className="text-base font-bold text-ink-primary">
                Pesan Sesi Belajar
              </h2>
              <p className="text-xs text-ink-muted">
                dengan {tutor.fullName} {tutor.isVerified && '✓'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface focus:outline-none"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Step 1: Subject Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="booking-subject-select"
              className="block text-xs font-semibold text-ink-primary"
            >
              1. Pilih Mata Pelajaran
            </label>
            <NativeSelect
              id="booking-subject-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full min-h-[44px]"
            >
              {tutor.subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.category === 'religious' ? 'Pendidikan Islam' : 'Umum'})
                </option>
              ))}
            </NativeSelect>
          </div>

          {/* Step 2: Date & Slot Selection via Calendar */}
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="block text-xs font-semibold text-ink-primary">
              2. Pilih Waktu dan Durasi Belajar
            </span>
            <TutorAvailabilityCalendar
              tutorId={tutor.id}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => {
                setSelectedSlot(slot)
                setErrorMsg(null)
              }}
              selectedDuration={duration}
              onDurationChange={(d) => {
                setDuration(d)
                setSelectedSlot(null) // reset slot when duration changes
              }}
            />
          </div>

          {/* Step 3: Student Note */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <label
              htmlFor="student-note-input"
              className="block text-xs font-semibold text-ink-primary"
            >
              3. Catatan atau Topik Diskusi (Opsional)
            </label>
            <textarea
              id="student-note-input"
              rows={2}
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder="Contoh: Ingin fokus pada materi turunan fungsi dan latihan soal SBMPTN..."
              className="w-full text-xs p-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* Step 4: Summary & Price breakdown */}
          <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-primary">
              <span>Ringkasan Pemesanan</span>
              <Badge variant="outline" className="bg-white text-ink-secondary text-[11px]">
                {duration} Menit
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs text-ink-secondary">
              <div className="flex justify-between">
                <span>Mata Pelajaran:</span>
                <span className="font-semibold text-ink-primary">
                  {selectedSubject?.name || 'Belum dipilih'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Waktu Sesi:</span>
                <span className="font-semibold text-ink-primary">
                  {selectedSlot
                    ? `${formatDateTime(selectedSlot.scheduledStart)} (${selectedSlot.durationMinutes} mnt)`
                    : 'Belum memilih slot'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-sm">
                <span className="font-bold text-ink-primary">Total Biaya Sesi:</span>
                <span className="font-bold text-brand-primary">
                  {formatCurrency(calculatedFee)}
                </span>
              </div>
            </div>

            {/* Transparent Notice */}
            <div className="flex items-start gap-2 p-2.5 bg-brand-primary/5 rounded-lg border border-brand-primary/15 text-[11px] text-ink-secondary">
              <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <p>
                Konfirmasi pemesanan dikirimkan langsung ke tutor. Integrasi pembayaran otomatis
                akan dirilis pada pembaruan berikutnya tanpa biaya transaksi saat ini.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-danger/5 rounded-xl border border-danger/20 flex items-center gap-2 text-xs text-danger">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onClose}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="min-h-[44px] bg-brand-primary text-white hover:bg-brand-primary/90 gap-2 font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses Reservasi...
                </>
              ) : (
                <>
                  Konfirmasi Pemesanan
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
