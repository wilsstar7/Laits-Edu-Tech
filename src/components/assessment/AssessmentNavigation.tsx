import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-white/95 backdrop-blur-md px-4 py-3 sm:py-4">
      <div className="max-w-2xl mx-auto space-y-2">
        {validationError && (
          <div
            role="alert"
            className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center font-medium animate-fade-in flex items-center justify-center gap-1.5"
          >
            <span>{validationError}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!canGoPrevious || isSubmitting}
            className="text-xs font-semibold text-slate-700 border-border/80 hover:bg-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Kembali</span>
          </Button>

          <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
            Butir {currentIndex + 1} dari {totalQuestions}
          </span>

          {isLastQuestion ? (
            <Button
              type="button"
              size="sm"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-5 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Menganalisis Jawaban...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Selesaikan &amp; Lihat Hasil</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onNext}
              disabled={isSubmitting}
              className="bg-[#183058] hover:bg-[#102342] text-white text-xs font-semibold px-5 shadow-xs"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </footer>
  )
}
