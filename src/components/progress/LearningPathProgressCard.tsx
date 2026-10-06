import { useState } from 'react'
import { Link } from 'react-router'
import type { StudentLearningPath } from '@/types/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { learningProgressService } from '@/services/learningProgressService'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react'

interface LearningPathProgressCardProps {
  path: StudentLearningPath
  onProgressUpdated?: () => void
}

export function LearningPathProgressCard({
  path,
  onProgressUpdated,
}: LearningPathProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [updatingSubjectId, setUpdatingSubjectId] = useState<string | null>(null)

  const handleUpdateSubject = async (subjectId: string, newPercentage: number) => {
    setUpdatingSubjectId(subjectId)
    try {
      await learningProgressService.updateSubjectProgress(
        path.id,
        subjectId,
        newPercentage
      )
      onProgressUpdated?.()
    } catch (err) {
      console.error('Failed to update progress:', err)
    } finally {
      setUpdatingSubjectId(null)
    }
  }

  const difficultyLabels = {
    beginner: 'Pemula',
    intermediate: 'Menengah',
    advanced: 'Lanjutan',
  }

  return (
    <div className="surface-card p-6 bg-white border border-border rounded-2xl shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-semibold py-0.5">
              {difficultyLabels[path.difficulty]}
            </Badge>
            <span className="text-xs text-muted-foreground">• {path.estimatedDuration}</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {path.learningPathTitle}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Progres</span>
            <span className="text-xl font-black text-primary">
              {path.progressPercentage}%
            </span>
          </div>
          <Link to={`/student/learning-paths/${path.learningPathSlug}`}>
            <Button variant="outline" size="sm" className="min-h-[44px] gap-1.5 font-semibold">
              <span>Silabus</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${path.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Toggle Subject List */}
      <div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-xs font-bold text-muted-foreground uppercase tracking-wider py-1 hover:text-foreground transition-colors cursor-pointer"
        >
          <span>Mata Pelajaran Dalam Alur ({path.subjects?.length || 0})</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isExpanded && path.subjects && path.subjects.length > 0 && (
          <div className="mt-3 space-y-2.5 pt-2 border-t border-border/40">
            {path.subjects.map((subj) => {
              const isUpdating = updatingSubjectId === subj.subjectId

              return (
                <div
                  key={subj.id}
                  className="p-3 rounded-xl bg-muted/20 border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {subj.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : subj.status === 'in_progress' ? (
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className="font-semibold text-foreground truncate">
                      {subj.subjectName}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 shrink-0">
                      {subj.subjectCategory === 'religious' ? 'Agama' : 'Umum'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="font-bold text-foreground">
                      {subj.progressPercentage}%
                    </span>

                    <div className="flex items-center gap-1">
                      {subj.progressPercentage < 100 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() =>
                            handleUpdateSubject(
                              subj.subjectId,
                              Math.min(100, subj.progressPercentage + 25)
                            )
                          }
                          className="h-8 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10"
                        >
                          +25%
                        </Button>
                      )}

                      {subj.progressPercentage < 100 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateSubject(subj.subjectId, 100)}
                          className="h-8 px-2 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                        >
                          Selesai
                        </Button>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Tuntas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {isExpanded && (!path.subjects || path.subjects.length === 0) && (
          <div className="text-xs text-muted-foreground py-3 text-center">
            <BookOpen className="w-4 h-4 mx-auto mb-1 opacity-50" />
            Belum ada mata pelajaran yang didaftarkan pada alur belajar ini.
          </div>
        )}
      </div>
    </div>
  )
}
