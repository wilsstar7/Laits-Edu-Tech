import { Loader2 } from 'lucide-react'

interface AssessmentNavigationProps {
  currentIndex: number
  totalQuestions: number
  canGoPrevious: boolean
  isLastQuestion: boolean
  isSubmitting?: boolean
  validationError?: string | null
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export function AssessmentNavigation({
  currentIndex,
  totalQuestions,
  canGoPrevious,
  isLastQuestion,
  isSubmitting = false,
  validationError,
  onPrevious,
  onNext,
  onSubmit,
}: AssessmentNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border/80 p-4 sm:px-8 z-20">
      <div className="max-w-3xl mx-auto space-y-2">
        {validationError && (
          <p
            role="alert"
            className="text-xs text-rose-600 font-medium text-center animate-fade-in"
          >
            {validationError}
          </p>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoPrevious || isSubmitting}
            className="px-5 py-3 rounded-xl border border-border text-sm font-bold text-[#333542] hover:bg-[#F4F5FB] disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[46px]"
          >
            Kembali
          </button>

          <span className="text-xs text-[#676A78] hidden sm:inline-block">
            {currentIndex + 1} dari {totalQuestions} soal
          </span>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-sm font-bold shadow-md shadow-[#6C5CE7]/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[46px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis Jawaban...</span>
                </>
              ) : (
                <span>Selesaikan Asesmen</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-sm font-bold shadow-md shadow-[#6C5CE7]/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all min-h-[46px]"
            >
              Lanjut
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
