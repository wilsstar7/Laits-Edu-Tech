import { Link } from 'react-router'
import { Clock, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import type { LearningPath } from '@/types/learning'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface LearningPathCardProps {
  path: LearningPath
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  const difficultyLabel =
    path.difficulty === 'beginner'
      ? 'Tingkat Pemula'
      : path.difficulty === 'intermediate'
      ? 'Tingkat Menengah'
      : 'Tingkat Lanjut'

  return (
    <div className="surface-card p-6 bg-white border border-border rounded-2xl flex flex-col justify-between gap-5 hover:border-[#6C5CE7]/30 transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-[11px] font-semibold text-[#6C5CE7] bg-[#EFEDFD]/60 border-[#6C5CE7]/20">
            {difficultyLabel}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-[#676A78]">
            <Clock className="w-3.5 h-3.5" />
            <span>{path.estimatedDuration}</span>
          </div>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-extrabold text-[#17181C]">
            {path.title}
          </h4>
          <p className="text-xs text-[#676A78] mt-1.5 leading-relaxed line-clamp-3">
            {path.description}
          </p>
        </div>

        {path.matchReason && (
          <div className="p-3 rounded-xl bg-[#EFEDFD]/60 border border-[#6C5CE7]/15 flex items-start gap-2 text-xs text-[#4A3BC9]">
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="leading-snug">{path.matchReason}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-[#676A78]">
          <BookOpen className="w-3.5 h-3.5 text-[#6C5CE7]" />
          <span>{path.subjectsCount || 0} Mata Pelajaran Terpadu</span>
        </div>
      </div>

      <div className="pt-2 border-t border-border/50">
        <Button asChild variant="default" size="sm" className="w-full justify-between font-bold text-xs min-h-[42px]">
          <Link to={`/student/learning-paths/${path.slug}`}>
            <span>Buka Kurikulum Jalur Belajar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
