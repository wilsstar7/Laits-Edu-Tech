import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { CourseCurriculum } from '@/components/learning/CourseCurriculum'
import { courseService } from '@/services/courseService'
import type { Course } from '@/types/course'
import {
  Clock,
  BarChart3,
  CheckCircle2,
  Award,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  const loadCourse = async (id: string) => {
    try {
      const data = await courseService.getCourseById(id)
      setCourse(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    if (courseId) {
      courseService
        .getCourseById(courseId)
        .then((data) => {
          if (isMounted) setCourse(data)
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    }

    return () => {
      isMounted = false
    }
  }, [courseId])

  const handleEnroll = async () => {
    if (!course) return
    setEnrolling(true)
    try {
      await courseService.enrollCourse(course.id)
      toast.success('Pendaftaran kursus berhasil! Silakan mulai materi pertama.')
      await loadCourse(course.id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftar kursus.'
      toast.error(msg)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
          <p className="text-xs text-[#8A8D9A]">Memuat detail silabus kursus...</p>
        </div>
      </AppShell>
    )
  }

  if (!course) {
    return (
      <AppShell>
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-4">
          <h3 className="font-bold text-base text-[#17181C]">Kursus Tidak Ditemukan</h3>
          <p className="text-xs text-[#676A78]">
            Materi kursus yang Anda cari mungkin telah diarsipkan atau belum dipublikasikan.
          </p>
          <Link to="/student/courses">
            <Button variant="default" size="sm" className="rounded-xl text-xs bg-[#6C5CE7] text-white">
              Kembali ke Katalog
            </Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const isEnrolled = Boolean(course.enrollment)
  const isCompleted = course.enrollment?.status === 'completed'
  const firstLesson = course.sections?.[0]?.lessons?.[0]

  return (
    <AppShell>
      {/* Back button */}
      <div>
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A8D9A] hover:text-[#17181C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Katalog Kursus</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-[#17181C] via-[#20212B] to-[#2D2845] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs font-bold text-xs text-[#8F7FF7] border border-white/10">
              {course.subjectName || 'Umum'}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-xs font-semibold text-xs text-white/90 border border-white/10 capitalize">
              Tingkat {course.level}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#C9CAD3] leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#8A8D9A]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8F7FF7]" />
              <span className="text-white font-medium">{course.estimatedDurationMinutes} Menit</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#8F7FF7]" />
              <span className="text-white font-medium">{course.totalLessons || 0} Pelajaran</span>
            </div>
            {isEnrolled && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold">{course.progressPercentage}% Selesai</span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            {!isEnrolled ? (
              <Button
                variant="default"
                size="lg"
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold rounded-xl text-xs sm:text-sm px-6 shadow-lg shadow-[#6C5CE7]/30"
              >
                {enrolling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                <span>Daftar Kursus Ini Sekarang</span>
              </Button>
            ) : firstLesson ? (
              <Link to={`/student/courses/${course.id}/lessons/${firstLesson.id}`}>
                <Button
                  variant="default"
                  size="lg"
                  className="bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold rounded-xl text-xs sm:text-sm px-6 shadow-lg shadow-[#6C5CE7]/30"
                >
                  <span>{isCompleted ? 'Tinjau Materi' : 'Lanjutkan Belajar'}</span>
                </Button>
              </Link>
            ) : null}

            {isCompleted && (
              <Link to="/student/achievements">
                <Button variant="outline" size="lg" className="rounded-xl text-xs sm:text-sm text-white border-white/20 hover:bg-white/10 gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Lihat Sertifikat Kelulusan</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Curriculum sections and lessons */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#17181C]">Silabus & Kurikulum Pelajaran</h3>
            <span className="text-xs text-[#8A8D9A]">
              {course.sections?.length || 0} Bagian &bull; {course.totalLessons || 0} Pelajaran
            </span>
          </div>

          <CourseCurriculum
            courseId={course.id}
            sections={course.sections || []}
            isEnrolled={isEnrolled}
          />
        </div>

        {/* Right Col: Learning Objectives & Overview */}
        <div className="space-y-6">
          {/* Objectives Card */}
          {course.objectives && course.objectives.length > 0 && (
            <div className="bg-white rounded-2xl border border-border/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#17181C]">
                <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
                <span>Target Capaian Belajar</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#676A78]">
                {course.objectives.map((obj) => (
                  <li key={obj.id} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{obj.objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Info Card */}
          <div className="bg-white rounded-2xl border border-border/80 p-5 shadow-xs space-y-3 text-xs text-[#676A78]">
            <h4 className="font-bold text-sm text-[#17181C]">Ketentuan Kelulusan</h4>
            <p className="leading-relaxed">
              Siswa berhak memperoleh sertifikat digital resmi setelah menuntaskan seluruh pelajaran dan lulus evaluasi kuis dengan skor minimal 70.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
