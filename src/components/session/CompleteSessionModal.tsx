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
import { learningSessionService } from '@/services/learningSessionService'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface CompleteSessionModalProps {
  bookingId: string
  studentName: string
  subjectName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CompleteSessionModal({
  bookingId,
  studentName,
  subjectName,
  isOpen,
  onClose,
  onSuccess,
}: CompleteSessionModalProps) {
  const [tutorNotes, setTutorNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await learningSessionService.completeSession(
        bookingId,
        tutorNotes.trim() || undefined
      )
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyelesaikan sesi.'
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Konfirmasi Selesai Sesi Bimbingan</span>
          </DialogTitle>
          <DialogDescription>
            Sesi bimbingan <span className="font-semibold text-foreground">{subjectName}</span> bersama siswa{' '}
            <span className="font-semibold text-foreground">{studentName}</span> telah dilaksanakan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label
              htmlFor="tutor-notes-input"
              className="text-xs font-semibold text-foreground"
            >
              Catatan Bimbingan untuk Siswa (Opsional)
            </label>
            <textarea
              id="tutor-notes-input"
              rows={4}
              maxLength={1000}
              value={tutorNotes}
              onChange={(e) => setTutorNotes(e.target.value)}
              placeholder="Berikan ringkasan materi yang telah dipelajari, pencapaian siswa, atau rekomendasi latihan berikutnya..."
              className="w-full text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
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
              className="min-h-[44px] gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tandai Sesi Selesai</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
