import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import type { RecommendedSubject } from '@/types/learning'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface RecommendedSubjectCardProps {
  subject: RecommendedSubject
}

export function RecommendedSubjectCard({ subject }: RecommendedSubjectCardProps) {
  const isReligious = subject.category === 'religious'

  return (
    <div className="surface-card p-5 bg-white border border-border rounded-2xl flex flex-col justify-between gap-4 hover:border-[#6C5CE7]/30 transition-all">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant={isReligious ? 'secondary' : 'outline'}
            className="text-[11px] font-semibold"
          >
            {isReligious ? 'Pendidikan Agama' : 'Mata Pelajaran Umum'}
          </Badge>
          <span className="text-[11px] font-bold text-[#6C5CE7]">
            Prioritas #{subject.priority}
          </span>
        </div>

        <div>
          <h4 className="text-base font-extrabold text-[#17181C]">
            {subject.name}
          </h4>
          <p className="text-xs text-[#676A78] mt-1 leading-relaxed line-clamp-2">
            {subject.reason}
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-border/50">
        <Button asChild variant="outline" size="sm" className="w-full justify-between font-semibold text-xs min-h-[40px]">
          <Link to={`/student/tutors?subjectId=${subject.subjectId}`}>
            <span>Cari Tutor {subject.name}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6C5CE7]" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
