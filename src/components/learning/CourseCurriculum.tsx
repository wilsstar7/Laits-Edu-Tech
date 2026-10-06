import { Link } from 'react-router'
import {
  FileText,
  Video,
  FileDown,
  CheckCircle2,
  Lock,
  PlayCircle,
} from 'lucide-react'
import type { CourseSection } from '@/types/course'

interface CourseCurriculumProps {
  courseId: string
  sections: CourseSection[]
  isEnrolled: boolean
  currentLessonId?: string
}

export function CourseCurriculum({
  courseId,
  sections,
  isEnrolled,
  currentLessonId,
}: CourseCurriculumProps) {
  const getLessonIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
    }

    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-[#6C5CE7] shrink-0" />
      case 'pdf':
        return <FileDown className="w-4 h-4 text-rose-500 shrink-0" />
      default:
        return <FileText className="w-4 h-4 text-[#8A8D9A] shrink-0" />
    }
  }

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center text-xs text-[#8A8D9A]">
        Silabus materi sedang dipersiapkan oleh tim akademik.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((section, secIdx) => {
        const lessons = section.lessons || []
        const completedCount = lessons.filter((l) => l.progress?.status === 'completed').length

        return (
          <div key={section.id} className="bg-white rounded-2xl border border-border/80 overflow-hidden shadow-xs">
            {/* Section Header */}
            <div className="p-4 bg-[#F4F5FB]/70 border-b border-border/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C5CE7]">
                  Bagian {secIdx + 1}
                </span>
                <h4 className="text-sm font-bold text-[#17181C] mt-0.5">{section.title}</h4>
                {section.description && (
                  <p className="text-xs text-[#676A78] mt-0.5">{section.description}</p>
                )}
              </div>
              <div className="text-right text-xs text-[#8A8D9A] shrink-0 ml-4">
                <span>{completedCount} / {lessons.length} Selesai</span>
              </div>
            </div>

            {/* Lessons List */}
            <div className="divide-y divide-border/60">
              {lessons.map((lesson) => {
                const isCompleted = lesson.progress?.status === 'completed'
                const isCurrent = lesson.id === currentLessonId

                const content = (
                  <div
                    className={`p-3.5 sm:px-5 flex items-center justify-between transition-colors ${
                      isCurrent
                        ? 'bg-[#EFEDFD] text-[#6C5CE7] font-semibold'
                        : isEnrolled
                        ? 'hover:bg-[#F9FAFD] cursor-pointer'
                        : 'opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      {getLessonIcon(lesson.lessonType, isCompleted)}
                      <div className="min-w-0">
                        <span className={`text-xs block truncate ${isCurrent ? 'font-bold text-[#6C5CE7]' : 'text-[#17181C]'}`}>
                          {lesson.title}
                        </span>
                        <span className="text-[11px] text-[#8A8D9A] block mt-0.5">
                          {lesson.estimatedDurationMinutes} Menit &bull; {lesson.lessonType.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isEnrolled ? (
                        isCompleted ? (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Selesai
                          </span>
                        ) : (
                          <PlayCircle className="w-4 h-4 text-[#6C5CE7]" />
                        )
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#8A8D9A]" />
                      )}
                    </div>
                  </div>
                )

                if (isEnrolled) {
                  return (
                    <Link key={lesson.id} to={`/student/courses/${courseId}/lessons/${lesson.id}`} className="block">
                      {content}
                    </Link>
                  )
                }

                return <div key={lesson.id}>{content}</div>
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
