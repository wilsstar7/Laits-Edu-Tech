import type { AssessmentOption } from '@/types/assessment'

interface LikertScaleProps {
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
}: LikertScaleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Pilihan skala jawaban"
      className="space-y-2.5 w-full"
    >
      {options.map((opt) => {
        const isSelected = selectedOptionId === opt.id

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(opt.id)}
            className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between min-h-[52px] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 ${
              isSelected
                ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-sm text-[#17181C]'
                : 'border-border/80 bg-white hover:border-[#6C5CE7]/40 hover:bg-[#F9FAFD] text-[#333542]'
            }`}
          >
            <div className="flex items-center gap-3.5">
              {/* Radio circle */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'border-[#6C5CE7] bg-[#6C5CE7]'
                    : 'border-[#BDC1D0] bg-white group-hover:border-[#6C5CE7]'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>

              {/* Label */}
              <span className={`text-sm ${isSelected ? 'font-bold text-[#17181C]' : 'font-medium'}`}>
                {opt.label}
              </span>
            </div>

            {/* Score point indicator badge */}
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                isSelected
                  ? 'bg-[#6C5CE7]/15 text-[#6C5CE7]'
                  : 'bg-black/5 text-[#888B98] group-hover:text-[#676A78]'
              }`}
            >
              {opt.value}
            </span>
          </button>
        )
      })}
    </div>
  )
}
