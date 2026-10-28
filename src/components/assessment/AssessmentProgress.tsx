import { Check, Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'

interface AssessmentProgressProps {
  currentIndex: number
  totalQuestions: number
  isSaving?: boolean
  lastSavedAt?: string | null
  answersCount?: number
  onJumpToIndex?: (index: number) => void
  moduleLabel?: string
}

export function AssessmentProgress({
  currentIndex,
  totalQuestions,
  isSaving = false,
  lastSavedAt,
  answersCount,
  onJumpToIndex,
  moduleLabel = 'Paket 1: Persona Modality',
}: AssessmentProgressProps) {
  const navigate = useNavigate()
  const percentage = Math.round(((currentIndex + 1) / Math.max(totalQuestions, 1)) * 100)
  const answeredTotal = answersCount ?? (currentIndex + 1)

  const handleExit = () => {
    const ok = window.confirm(
      'Jawaban yang telah Anda pilih sudah tersimpan otomatis. Anda dapat melanjutkan asesmen ini kapan saja. Ingin kembali ke katalog asesmen?'
    )
    if (ok) {
      navigate('/student/assessment')
    }
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 space-y-2.5">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExit}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100 font-medium"
              title="Keluar sementara (progres tersimpan)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
            <span className="h-4 w-px bg-slate-200 hidden sm:inline-block" />
            <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">
              {moduleLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-[#183058] font-medium text-[11px] animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Menyimpan...</span>
              </span>
            ) : lastSavedAt ? (
              <span className="flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="hidden sm:inline">Tersimpan</span>
              </span>
            ) : null}

            <div className="flex items-baseline gap-1 font-mono text-xs">
              <span className="font-bold text-slate-900">
                {currentIndex + 1}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500">{totalQuestions}</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#183058] bg-slate-100 px-2 py-0.5 rounded">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Linear Progress Bar with Smooth Motion */}
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Kemajuan asesmen: ${percentage}%`}
          className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden"
        >
          <div
            className="h-full bg-[#183058] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Interactive Question Pill Matrix (Allows direct jumping, breaks monotony) */}
        {totalQuestions <= 35 && onJumpToIndex && (
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto pt-0.5 pb-0.5">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const isCurrent = i === currentIndex
              const isAnswered = i < answeredTotal

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onJumpToIndex(i)}
                  className={`h-1.5 flex-1 min-w-[12px] rounded-full transition-all ${
                    isCurrent
                      ? 'bg-[#183058] ring-2 ring-[#183058]/30 scale-y-125'
                      : isAnswered
                      ? 'bg-slate-400 hover:bg-slate-600'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Lompat ke Soal ${i + 1}`}
                />
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
