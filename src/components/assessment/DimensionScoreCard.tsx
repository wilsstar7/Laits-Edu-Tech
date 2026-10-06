import type { DimensionResult } from '@/types/assessment'

interface DimensionScoreCardProps {
  dimensions: DimensionResult[]
}

export function DimensionScoreCard({ dimensions }: DimensionScoreCardProps) {
  return (
    <div className="surface-card bg-white p-6 sm:p-8 border border-border/80 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-[#17181C]">
          Rincian Skor Tiap Dimensi Belajar
        </h3>
        <p className="text-xs text-[#676A78] mt-1">
          Skor dinormalisasi dalam skala 0 sampai 100 berdasarkan pembobotan butir pertanyaan.
        </p>
      </div>

      <div className="space-y-4">
        {dimensions.map((dim) => {
          const score = Math.round(dim.normalized_score)
          const name = dim.dimension?.name || 'Dimensi'
          const description = dim.dimension?.description || ''

          return (
            <div key={dim.id} className="p-4 rounded-xl bg-[#F9FAFD] border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-[#17181C]">{name}</span>
                <span className="font-mono font-extrabold text-[#6C5CE7] bg-[#6C5CE7]/10 px-2.5 py-0.5 rounded">
                  {score}%
                </span>
              </div>

              {description && (
                <p className="text-xs text-[#676A78] leading-relaxed">
                  {description}
                </p>
              )}

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#EAEBF0] overflow-hidden">
                <div
                  className="h-full bg-[#6C5CE7] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
