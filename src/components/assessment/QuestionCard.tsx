import type { AssessmentQuestion } from '@/types/assessment'
import { LikertScale } from './LikertScale'
import { Sparkles, Command } from 'lucide-react'

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
  const moduleBadge =
    question.module_code === 'PM-VAK-01'
      ? 'Modalitas Sensori (VAK)'
      : question.module_code === 'PM-HEM-02'
      ? 'Dominasi Belahan Otak'
      : question.module_code === 'PM-SKB-03'
      ? 'Kebiasaan & Lingkungan Belajar'
      : question.module_code === 'PP-MBTI-02'
      ? 'Tipologi Kepribadian (MBTI)'
      : question.module_code === 'PP-MI-03'
      ? '8 Kecerdasan Majemuk'
      : 'Asesmen Persona'

  const hintText =
    question.module_code === 'PP-MBTI-02'
      ? "Pilihlah respons yang paling terasa alami bagi dirimu. Tidak ada jawaban yang lebih baik atau lebih buruk."
      : question.module_code === 'PP-MI-03'
      ? 'Pilihlah seberapa sesuai pernyataan ini dengan kebiasaan atau minat aslimu sehari-hari.'
      : 'Pilihlah satu situasi yang paling menggambarkan kebiasaan atau kenyamanan belajarmu.'

  return (
    <div className="bg-white border border-border/80 rounded-3xl p-6 sm:p-10 shadow-xs max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-fade-in transition-all">
      {/* Question Header & Context Tag */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#183058]" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {moduleBadge}
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          Butir {questionNumber} dari {totalQuestions}
        </span>
      </div>

      {/* Question Narrative (High Readability & Empathy) */}
      <div className="space-y-2.5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug sm:leading-relaxed tracking-tight">
          {question.question_text}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
          {hintText}
        </p>
      </div>

      {/* Answer Options */}
      <LikertScale
        options={question.assessment_options ?? []}
        selectedOptionId={selectedOptionId}
        onSelect={onSelectOption}
        disabled={disabled}
      />

      {/* Keyboard Shortcuts Helper Note (Delightful UX) */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <Command className="w-3 h-3 text-slate-400" />
          <span>Navigasi cepat: tekan tombol <strong className="font-mono text-slate-700 font-semibold">A</strong>, <strong className="font-mono text-slate-700 font-semibold">B</strong>, atau <strong className="font-mono text-slate-700 font-semibold">C</strong> lalu <strong className="font-mono text-slate-700 font-semibold">Enter ↵</strong></span>
        </span>
        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] ml-auto">
          <Sparkles className="w-3 h-3 text-[#183058]" />
          <span>Jawaban otomatis tersimpan</span>
        </span>
      </div>
    </div>
  )
}
