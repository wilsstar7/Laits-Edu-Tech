import { useState } from 'react'
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Award,
} from 'lucide-react'
import type { Quiz, QuizSubmissionAnswer, QuizSubmissionResult } from '@/types/quiz'
import { quizService } from '@/services/quizService'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface QuizPlayerModalProps {
  quiz: Quiz
  onClose: () => void
  onSuccess?: () => void
}

export function QuizPlayerModal({ quiz, onClose, onSuccess }: QuizPlayerModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizSubmissionResult | null>(null)

  const questions = quiz.questions || []
  const answeredCount = Object.keys(selectedAnswers).length
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length

  const handleSelect = (questionId: string, optionId: string) => {
    if (result) return // Locked after evaluation
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleSubmit = async () => {
    if (!isAllAnswered) {
      toast.error('Harap jawab semua pertanyaan sebelum mengumpulkan kuis.')
      return
    }

    setSubmitting(true)
    try {
      const payload: QuizSubmissionAnswer[] = Object.entries(selectedAnswers).map(
        ([qId, optId]) => ({
          question_id: qId,
          selected_option_id: optId,
        })
      )

      const evalResult = await quizService.submitQuiz(quiz.id, payload)
      setResult(evalResult)

      if (evalResult.passed) {
        toast.success(`Selamat! Anda lulus kuis dengan skor ${evalResult.score}.`)
        if (onSuccess) onSuccess()
      } else {
        toast.error(`Skor Anda ${evalResult.score}. Batas kelulusan adalah ${evalResult.passing_score}.`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim evaluasi kuis.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-[#F4F5FB]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#17181C]">{quiz.title}</h3>
              <p className="text-xs text-[#676A78]">
                Batas Kelulusan: {quiz.passingScore}% &bull; Maks: {quiz.maxAttempts} Percobaan
              </p>
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {result ? (
            /* Result Scorecard */
            <div className="text-center py-6 space-y-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                  result.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                }`}
              >
                {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#8A8D9A]">
                  Hasil Evaluasi
                </span>
                <h4 className="text-2xl font-extrabold text-[#17181C] mt-1">
                  Skor Anda: {result.score} / 100
                </h4>
                <p className="text-xs text-[#676A78] mt-1">
                  {result.passed
                    ? 'Luar biasa! Anda telah memenuhi kriteria kelulusan dan menyelesaikan materi ini.'
                    : `Belum lulus. Nilai minimal untuk lulus adalah ${result.passing_score}. Tersisa ${result.remaining_attempts} kesempatan.`}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                {!result.passed && result.remaining_attempts > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResult(null)
                      setSelectedAnswers({})
                    }}
                    className="rounded-xl text-xs gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Coba Lagi</span>
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={onClose}
                  className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white"
                >
                  Selesai
                </Button>
              </div>
            </div>
          ) : (
            /* Questions List */
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={q.id} className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#6C5CE7]">
                      Pertanyaan {qIndex + 1} dari {questions.length}
                    </span>
                    <span className="text-[11px] text-[#8A8D9A] font-semibold">
                      {q.points} Poin
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#17181C] leading-snug">
                    {q.question}
                  </p>

                  <div className="space-y-2 pt-1">
                    {(q.options || []).map((opt) => {
                      const isSelected = selectedAnswers[q.id] === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelect(q.id, opt.id)}
                          className={`w-full p-3 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#EFEDFD] border-[#6C5CE7] text-[#6C5CE7] shadow-xs'
                              : 'bg-white border-border/80 text-[#17181C] hover:bg-white/80'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                              isSelected ? 'border-[#6C5CE7] bg-[#6C5CE7]' : 'border-border'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="p-4 sm:p-5 border-t border-border bg-[#F4F5FB]/40 flex items-center justify-between">
            <span className="text-xs text-[#676A78]">
              Dijawab: {answeredCount} dari {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
                Batal
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !isAllAnswered}
                className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold gap-1.5"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Kumpulkan Kuis</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
