import type { AssessmentQuestion } from '@/types/assessment'
import { LikertScale } from './LikertScale'

interface QuestionCardProps {
  question: AssessmentQuestion
  questionNumber: number
  totalQuestions: number
  selectedOptionId: string | null
  onSelectOption: (optionId: string) => void
  disabled?: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  selectedOptionId,
  onSelectOption,
  disabled = false,
}: QuestionCardProps) {
  return (
    <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 shadow-sm max-w-3xl mx-auto">
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold uppercase tracking-wider">
            Nomor {questionNumber}
          </span>
          {question.required && (
            <span className="text-[11px] text-[#676A78]">Wajib dijawab</span>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-[#17181C] leading-relaxed">
          {question.question_text}
        </h2>
      </div>

      <LikertScale
        options={question.assessment_options ?? []}
        selectedOptionId={selectedOptionId}
        onSelect={onSelectOption}
        disabled={disabled}
      />
    </div>
  )
}
