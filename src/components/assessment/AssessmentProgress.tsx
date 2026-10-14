import { Check, Loader2 } from 'lucide-react'

interface AssessmentProgressProps {
  currentIndex: number
  totalQuestions: number
  isSaving?: boolean
  lastSavedAt?: string | null
}

export function AssessmentProgress({
  currentIndex,
  totalQuestions,
  isSaving = false,
  lastSavedAt,
}: AssessmentProgressProps) {
  const percentage = Math.round(((currentIndex + 1) / Math.max(totalQuestions, 1)) * 100)

  return (
    <div className="sticky top-0 z-20 w-full border-b border-border/80 bg-white/95 backdrop-blur-sm px-4 sm:px-8 pt-[calc(0.625rem+env(safe-area-inset-top))] pb-2.5 sm:py-3.5">
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#17181C]">
              Pertanyaan {currentIndex + 1}
            </span>
            <span className="text-[#676A78]">dari {totalQuestions}</span>
          </div>

          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-[#6C5CE7] font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </span>
            ) : lastSavedAt ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Tersimpan</span>
              </span>
            ) : null}
            <span className="font-extrabold text-[#6C5CE7] ml-2">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Progress bar container */}
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Kemajuan asesmen: ${percentage}%`}
          className="w-full h-2 rounded-full bg-[#EAEBF0] overflow-hidden"
        >
          <div
            className="h-full bg-[#6C5CE7] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
