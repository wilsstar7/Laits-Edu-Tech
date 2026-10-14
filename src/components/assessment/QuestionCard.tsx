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
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  disabled = false,
}: QuestionCardProps) {
  const moduleLabel =
    question.module_code === 'PM-VAK-01'
      ? 'Modul 1: Sensory Modality (VAK)'
      : question.module_code === 'PM-HEM-02'
      ? 'Modul 2: Dominasi Hemisfer Otak'
      : question.module_code === 'PM-SKB-03'
      ? 'Modul 3: Kebiasaan & Lingkungan Belajar'
      : question.module_code === 'PP-MBTI-02'
      ? 'Modul 4: Tipologi Kepribadian (MBTI)'
      : question.module_code === 'PP-MI-03'
      ? 'Modul 5: Kecerdasan Majemuk (Multiple Intelligences)'
      : 'Asesmen Persona'

  const hintText =
    question.module_code === 'PP-MBTI-02'
      ? "Pilihlah satu jawaban yang terasa 'paling aku banget'. Kedua pilihan di bawah ini sama-sama bagus dan wajar."
      : question.module_code === 'PP-MI-03'
      ? 'Berilah nilai (1, 2, 3, atau 4) seberapa sesuai pernyataan ini dengan kebiasaan atau sifat aslimu.'
      : 'Pilihlah satu opsi yang paling menggambarkan kebiasaan atau preferensimu secara jujur.'

  return (
    <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 shadow-sm max-w-3xl mx-auto rounded-3xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <span className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider">
          {moduleLabel}
        </span>
        <span className="px-3 py-1 rounded-full bg-[#F4F5FB] text-[#676A78] text-xs font-mono font-semibold">
          Soal {questionNumber} dari {totalQuestions}
        </span>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl font-bold text-[#17181C] leading-relaxed">
          {question.question_text}
        </h2>
        <p className="text-xs text-[#676A78]">
          {hintText}
        </p>
      </div>

      {/* Options */}
      <LikertScale
        options={question.assessment_options ?? []}
        selectedOptionId={selectedOptionId}
        onSelect={onSelectOption}
        disabled={disabled}
      />
    </div>
  )
}
