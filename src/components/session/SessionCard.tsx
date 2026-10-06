import type { LearningSession } from '@/types/progress'
import { formatReportDate, formatTimeRange } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Star,
  MessageSquare,
} from 'lucide-react'

interface SessionCardProps {
  session: LearningSession
  role?: 'student' | 'tutor'
  onReviewClick?: (session: LearningSession) => void
  onCompleteClick?: (session: LearningSession) => void
}

export function SessionCard({
  session,
  role = 'student',
  onReviewClick,
  onCompleteClick,
}: SessionCardProps) {
  const statusBadges = {
    scheduled: (
      <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-medium">
        <Clock className="w-3.5 h-3.5" /> Terjadwal
      </Badge>
    ),
    in_progress: (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 font-medium">
        <Clock className="w-3.5 h-3.5" /> Berlangsung
      </Badge>
    ),
    completed: (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
      </Badge>
    ),
    cancelled: (
      <Badge className="bg-gray-100 text-gray-600 border-gray-200 gap-1 font-medium">
        <AlertCircle className="w-3.5 h-3.5" /> Dibatalkan
      </Badge>
    ),
    no_show: (
      <Badge className="bg-rose-50 text-rose-700 border-rose-200 gap-1 font-medium">
        <AlertCircle className="w-3.5 h-3.5" /> Tidak Hadir
      </Badge>
    ),
  }

  const counterpartName =
    role === 'student' ? session.tutorName || 'Tutor' : session.studentName || 'Siswa'

  return (
    <div className="surface-card p-5 bg-white border border-border rounded-2xl shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/50 pb-3.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <h4 className="font-bold text-foreground text-sm">
            {session.subjectName}
          </h4>
          <Badge variant="outline" className="text-[10px] py-0">
            {session.subjectCategory === 'religious' ? 'Agama' : 'Umum'}
          </Badge>
        </div>
        <div>{statusBadges[session.status]}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="w-4 h-4 text-primary shrink-0" />
          <span>
            {role === 'student' ? 'Tutor: ' : 'Siswa: '}
            <strong className="text-foreground">{counterpartName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span>
            {formatReportDate(session.startedAt)} • {formatTimeRange(session.startedAt, session.endedAt)} ({session.durationMinutes} menit)
          </span>
        </div>
      </div>

      {session.tutorNotes && (
        <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-foreground space-y-1">
          <span className="font-bold text-primary block">Catatan dari Tutor:</span>
          <p className="text-muted-foreground leading-relaxed">{session.tutorNotes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
        <div className="text-xs text-muted-foreground">
          {session.hasReview && session.rating && (
            <div className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Diulas: {session.rating}/5 Bintang</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {role === 'student' && session.status === 'completed' && !session.hasReview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onReviewClick?.(session)}
              className="gap-1.5 min-h-[40px] text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Beri Ulasan</span>
            </Button>
          )}

          {role === 'tutor' && session.status === 'scheduled' && (
            <Button
              type="button"
              size="sm"
              onClick={() => onCompleteClick?.(session)}
              className="gap-1.5 min-h-[40px] text-xs font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tandai Selesai</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
