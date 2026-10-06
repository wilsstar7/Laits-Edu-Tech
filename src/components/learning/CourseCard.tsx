import { Link } from 'react-router'
import { BookOpen, Clock, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Course } from '@/types/course'
import { Button } from '@/components/ui/button'

interface CourseCardProps {
  course: Course
  className?: string
}

export function CourseCard({ course, className = '' }: CourseCardProps) {
  const isEnrolled = Boolean(course.enrollment)
  const isCompleted = course.enrollment?.status === 'completed'
  const progress = course.progressPercentage ?? (isCompleted ? 100 : 0)

  const levelBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Pemula</span>
      case 'intermediate':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">Menengah</span>
      case 'advanced':
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px]">Lanjutan</span>
      default:
        return null
    }
  }

  return (
    <div className={`bg-white rounded-2xl border border-border/80 overflow-hidden shadow-xs hover:shadow-md hover:border-[#6C5CE7]/30 transition-all flex flex-col justify-between ${className}`}>
      {/* Top Banner / Thumbnail */}
      <div className="relative h-40 bg-gradient-to-tr from-[#17181C] to-[#343542] flex items-center justify-center p-4 overflow-hidden">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-xs ring-1 ring-white/20">
            <BookOpen className="w-6 h-6 text-[#8F7FF7]" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur-xs font-semibold text-[11px]">
            {course.subjectName || 'Umum'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {levelBadge(course.level)}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link to={`/student/courses/${course.id}`}>
            <h3 className="font-bold text-[#17181C] text-base hover:text-[#6C5CE7] transition-colors line-clamp-2">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-[#676A78] line-clamp-2 leading-relaxed">
            {course.description || 'Pelajari materi ini langkah demi langkah dengan modul terstruktur dan kuis evaluasi.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Metadata chips */}
          <div className="flex items-center gap-4 text-xs text-[#8A8D9A]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.estimatedDurationMinutes} Menit</span>
            </div>
            {course.totalLessons !== undefined && (
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{course.totalLessons} Pelajaran</span>
              </div>
            )}
          </div>

          {/* Progress bar if enrolled */}
          {isEnrolled && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#676A78] font-medium flex items-center gap-1">
                  {isCompleted ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai</>
                  ) : (
                    'Progres Belajar'
                  )}
                </span>
                <span className="font-bold text-[#6C5CE7]">{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#EEF0F8] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-[#6C5CE7]'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            <Link to={`/student/courses/${course.id}`} className="w-full block">
              <Button
                variant={isEnrolled ? 'default' : 'outline'}
                className={`w-full text-xs font-bold rounded-xl justify-center gap-1.5 ${
                  isEnrolled ? 'bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white' : ''
                }`}
              >
                <span>{isEnrolled ? (isCompleted ? 'Tinjau Materi' : 'Lanjutkan Belajar') : 'Lihat Silabus'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
