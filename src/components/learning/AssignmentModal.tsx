import { useState } from 'react'
import { FileText, CheckCircle2, Clock, Loader2, Award } from 'lucide-react'
import type { Assignment } from '@/types/assignment'
import { assignmentService } from '@/services/assignmentService'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AssignmentModalProps {
  assignment: Assignment
  onClose: () => void
  onSuccess?: () => void
}

export function AssignmentModal({ assignment, onClose, onSuccess }: AssignmentModalProps) {
  const [content, setContent] = useState(assignment.submission?.content || '')
  const [submitting, setSubmitting] = useState(false)

  const isGraded = assignment.submission?.status === 'graded'
  const isSubmitted = assignment.submission?.status === 'submitted' || isGraded

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Jawaban tugas tidak boleh kosong.')
      return
    }

    setSubmitting(true)
    try {
      await assignmentService.submitAssignment(assignment.id, content)
      toast.success('Tugas berhasil dikumpulkan.')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengumpulkan tugas.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-[#F4F5FB]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17181C]">{assignment.title}</h3>
              <p className="text-xs text-[#676A78]">Maksimum Skor: {assignment.maxScore}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8A8D9A] hover:text-[#17181C] text-sm font-bold p-2"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Instructions */}
          <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7]">
              Instruksi Pengerjaan
            </span>
            <p className="text-xs text-[#17181C] leading-relaxed whitespace-pre-wrap">
              {assignment.description || 'Selesaikan tugas ini dengan menjelaskan konsep yang telah dipelajari.'}
            </p>
            {assignment.dueAt && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#8A8D9A] pt-2 border-t border-border/60">
                <Clock className="w-3.5 h-3.5" />
                <span>Batas Pengumpulan: {new Date(assignment.dueAt).toLocaleDateString('id-ID')}</span>
              </div>
            )}
          </div>

          {/* Graded Feedback if any */}
          {isGraded && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Nilai: {assignment.submission?.score} / {assignment.maxScore}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Dinilai
                </span>
              </div>
              {assignment.submission?.feedback && (
                <p className="text-xs text-emerald-900 mt-1">
                  <strong>Umpan Balik Tutor:</strong> {assignment.submission.feedback}
                </p>
              )}
            </div>
          )}

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="assignment-answer" className="block text-xs font-bold text-[#17181C] mb-1.5">
                {isSubmitted ? 'Jawaban Anda' : 'Tulis Jawaban Anda'}
              </label>
              <textarea
                id="assignment-answer"
                rows={5}
                disabled={isGraded}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan jawaban atau rangkuman penyelesaian tugas di sini..."
                className="w-full p-3.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden resize-none bg-white"
              />
            </div>

            {!isGraded && (
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
                  Tutup
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={submitting || !content.trim()}
                  className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isSubmitted ? 'Perbarui Jawaban' : 'Kumpulkan Tugas'}</span>
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
