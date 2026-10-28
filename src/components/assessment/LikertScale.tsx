import type { AssessmentOption } from '@/types/assessment'
import { Check } from 'lucide-react'

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
      className="space-y-3.5 w-full"
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
            className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 min-h-[64px] group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#183058] focus-visible:ring-offset-2 relative ${
              isSelected
                ? 'border-[#183058] bg-slate-50/80 shadow-xs ring-1 ring-[#183058]'
                : 'border-border/80 bg-white hover:border-slate-400 hover:bg-slate-50/40 text-slate-700'
            }`}
          >
            {/* Keyboard Key Shortcut & Letter Badge */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-xs transition-colors mt-0.5 border ${
                isSelected
                  ? 'bg-[#183058] text-white border-[#183058]'
                  : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-200 group-hover:text-slate-900'
              }`}
            >
              {letter}
            </div>

            {/* Answer Option Label (Editorial Clarity) */}
            <div className="flex-1 min-w-0 pr-2">
              <span
                className={`text-sm sm:text-[15px] leading-relaxed block ${
                  isSelected ? 'font-semibold text-slate-900' : 'font-normal text-slate-800'
                }`}
              >
                {opt.label}
              </span>
            </div>

            {/* Checked Indicator Icon */}
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                isSelected
                  ? 'border-[#183058] bg-[#183058] text-white shadow-2xs'
                  : 'border-slate-300 bg-white text-transparent group-hover:border-slate-400'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
