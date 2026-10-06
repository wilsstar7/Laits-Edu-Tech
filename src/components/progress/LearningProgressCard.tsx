import type { OverallStudentProgress } from '@/types/progress'
import { BookOpen, CheckCircle2, Clock, Award } from 'lucide-react'

interface LearningProgressCardProps {
  progress: OverallStudentProgress
}

export function LearningProgressCard({ progress }: LearningProgressCardProps) {
  const hours = Math.floor(progress.totalLearningMinutes / 60)
  const minutes = progress.totalLearningMinutes % 60
  const durationText = hours > 0 ? `${hours}j ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`

  return (
    <div className="surface-card p-6 bg-white border border-border rounded-2xl shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ringkasan Perkembangan Belajar
          </span>
          <h2 className="text-xl font-bold text-foreground">
            Performa Belajar Siswa
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Rata-rata Progres</div>
            <div className="text-xl font-black text-primary">
              {progress.averageProgress}%
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Pencapaian Keseluruhan Alur Belajar</span>
          <span>{progress.averageProgress}%</span>
        </div>
        <div className="w-full h-3 bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.averageProgress}%` }}
          />
        </div>
      </div>

      {/* 4 Stat Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Alur Aktif</div>
            <div className="text-lg font-bold text-foreground">
              {progress.enrolledPathsCount}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Selesai</div>
            <div className="text-lg font-bold text-foreground">
              {progress.completedPathsCount}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Sesi Selesai</div>
            <div className="text-lg font-bold text-foreground">
              {progress.completedSessionsCount}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Durasi</div>
            <div className="text-lg font-bold text-foreground">
              {progress.totalLearningMinutes > 0 ? durationText : '0m'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
