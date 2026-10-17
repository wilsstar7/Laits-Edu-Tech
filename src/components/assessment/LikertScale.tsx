import type { AssessmentOption } from '@/types/assessment'

interface OptionListProps {
  options: AssessmentOption[]
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
  disabled?: boolean
}

export function LikertScale({
  options,
  selectedOptionId,
  onSelect,
  disabled = false,
}: OptionListProps) {
  const letters = ['A', 'B', 'C', 'D', 'E']

  return (
    <div
      role="radiogroup"
      aria-label="Pilihan jawaban asesmen"
      className="space-y-3 w-full"
    >
      {options.map((opt, idx) => {
        const isSelected = selectedOptionId === opt.id || selectedOptionId === opt.indicator
        const letter = letters[idx] || `${idx + 1}`

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(opt.id)}
            className={`w-full text-left p-3.5 sm:p-5 rounded-2xl border transition-all flex items-start gap-3 sm:gap-3.5 min-h-[56px] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#183058] focus-visible:ring-offset-2 ${
              isSelected
                ? 'border-[#183058] bg-[#183058]/8 text-[#17181C] shadow-sm ring-1 ring-[#183058]'
                : 'border-border/80 bg-white hover:border-[#183058]/40 hover:bg-[#F9FAFD] active:bg-[#F4F6FA] text-[#333542]'
            }`}
          >
            {/* Letter Badge (A, B, C) */}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-colors mt-0.5 ${
                isSelected
                  ? 'bg-[#183058] text-white'
                  : 'bg-[#F4F6FA] text-[#676A78] group-hover:bg-[#E8ECF6] group-hover:text-[#183058]'
              }`}
            >
              {letter}
            </div>

            {/* Label Text */}
            <div className="flex-1 min-w-0 break-words">
              <span
                className={`text-sm sm:text-base leading-relaxed ${
                  isSelected ? 'font-bold text-[#17181C]' : 'font-medium text-[#1D1D24]'
                }`}
              >
                {opt.label}
              </span>
            </div>

            {/* Radio indicator */}
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                isSelected
                  ? 'border-[#183058] bg-[#183058]'
                  : 'border-[#BDC1D0] bg-white group-hover:border-[#183058]'
              }`}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
