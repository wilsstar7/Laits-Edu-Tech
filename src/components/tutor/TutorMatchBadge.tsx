import { Sparkles, Check } from 'lucide-react'

interface TutorMatchBadgeProps {
  score?: number
  reasons?: string[]
}

export function TutorMatchBadge({ score, reasons }: TutorMatchBadgeProps) {
  if (!score || score < 50) return null

  const titleText = reasons && reasons.length > 0 ? reasons.join(' • ') : undefined

  return (
    <div
      title={titleText}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFEDFD] text-[#6C5CE7] border border-[#6C5CE7]/20 text-xs font-bold"
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>Kesesuaian {score}%</span>
    </div>
  )
}

interface TutorMatchReasonsProps {
  reasons?: string[]
}

export function TutorMatchReasons({ reasons = [] }: TutorMatchReasonsProps) {
  if (reasons.length === 0) return null

  return (
    <div className="p-3.5 rounded-xl bg-[#F9FAFD] border border-border/80 space-y-1.5">
      <div className="text-[11px] font-bold text-[#6C5CE7] uppercase tracking-wider">
        Kesesuaian dengan Preferensi Belajar Anda
      </div>
      <ul className="space-y-1 text-xs text-[#333542]">
        {reasons.map((r, idx) => (
          <li key={idx} className="flex items-start gap-1.5 leading-snug">
            <Check className="w-3.5 h-3.5 text-[#45B97C] shrink-0 mt-0.5" />
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
