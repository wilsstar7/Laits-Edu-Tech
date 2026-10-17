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
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border/80 bg-white/95 backdrop-blur-sm px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-8 sm:pt-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="max-w-3xl mx-auto space-y-2">
        {validationError && (
          <p
            role="alert"
            className="text-xs text-rose-600 font-medium text-center animate-fade-in"
          >
            {validationError}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoPrevious || isSubmitting}
            className="shrink-0 px-4 sm:px-5 py-3 rounded-xl border border-border text-sm font-bold text-[#333542] hover:bg-[#F4F6FA] active:bg-[#EAEBF0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[46px]"
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
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#183058] hover:bg-[#102342] active:bg-[#4636C4] text-white text-sm font-bold shadow-md shadow-[#183058]/25 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[46px]"
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
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#183058] hover:bg-[#102342] active:bg-[#4636C4] text-white text-sm font-bold shadow-md shadow-[#183058]/25 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[46px]"
            >
              Lanjut
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
