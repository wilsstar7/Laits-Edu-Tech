import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { courseService } from '@/services/courseService'
import { quizService } from '@/services/quizService'
import { assignmentService } from '@/services/assignmentService'
import { QuizPlayerModal } from '@/components/learning/QuizPlayerModal'
import { AssignmentModal } from '@/components/learning/AssignmentModal'
import type { Course, Lesson } from '@/types/course'
import type { Quiz } from '@/types/quiz'
import type { Assignment } from '@/types/assignment'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileDown,
  HelpCircle,
  FileText,
  Loader2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function LessonPlayerPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  // Interactive Quiz & Assignment modals
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)

  const loadData = async (cId: string, lId: string) => {
    try {
      const courseData = await courseService.getCourseById(cId)
      setCourse(courseData)

      if (courseData?.sections) {
        let foundLesson: Lesson | null = null
        for (const s of courseData.sections) {
          const l = s.lessons?.find((item) => item.id === lId)
          if (l) {
            foundLesson = l
            break
          }
        }
        setCurrentLesson(foundLesson)
      }

      // Check for lesson quiz & assignment
      const [qData, aData] = await Promise.all([
        quizService.getQuizByLessonId(lId),
        assignmentService.getAssignmentByLessonId(lId),
      ])
      setQuiz(qData)
      setAssignment(aData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    if (courseId && lessonId) {
      loadData(courseId, lessonId)
    }
    return () => {
      isMounted = false
    }
  }, [courseId, lessonId])

  // Flatten lessons for linear navigation (Prev / Next)
  const allLessons: Lesson[] = []
  if (course?.sections) {
    for (const sec of course.sections) {
      if (sec.lessons) {
        allLessons.push(...sec.lessons)
      }
    }
  }

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const handleMarkComplete = async () => {
    if (!lessonId) return
    setCompleting(true)
    try {
      const res = await courseService.completeLesson(lessonId)
      toast.success('Pelajaran berhasil diselesaikan!')

      // Reload course state
      if (courseId) {
        await loadData(courseId, lessonId)
      }

      if (res.isCourseCompleted) {
        toast.success('Selamat! Anda telah menyelesaikan 100% kursus ini.', {
          description: 'Sertifikat digital resmi Anda telah diterbitkan.',
        })
      } else if (nextLesson && courseId) {
        navigate(`/student/courses/${courseId}/lessons/${nextLesson.id}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menandai pelajaran selesai.')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
          <p className="text-xs text-[#8A8D9A]">Memuat konten pelajaran...</p>
        </div>
      </AppShell>
    )
  }

  if (!course || !currentLesson) {
    return (
      <AppShell>
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-4">
          <h3 className="font-bold text-base text-[#17181C]">Pelajaran Tidak Ditemukan</h3>
          <p className="text-xs text-[#676A78]">Konten materi tidak dapat dimuat atau telah dipindahkan.</p>
          <Link to={`/student/courses/${courseId || ''}`}>
            <Button variant="default" size="sm" className="rounded-xl text-xs bg-[#6C5CE7] text-white">
              Kembali ke Silabus
            </Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const isCompleted = currentLesson.progress?.status === 'completed'

  return (
    <AppShell>
      {/* Top Breadcrumb & Return to Course */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={`/student/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A8D9A] hover:text-[#17181C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Silabus Kursus</span>
        </Link>

        <span className="text-xs text-[#676A78] font-medium hidden sm:inline-block">
          Pelajaran {currentIndex + 1} dari {allLessons.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Lesson Content (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Lesson Title Header */}
            <div className="border-b border-border/60 pb-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#EFEDFD] text-[#6C5CE7] text-[11px] font-bold uppercase tracking-wider">
                  {currentLesson.lessonType}
                </span>
                <span className="text-xs text-[#8A8D9A] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {currentLesson.estimatedDurationMinutes} Menit
                </span>
                {isCompleted && (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Selesai
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#17181C] tracking-tight">
                {currentLesson.title}
              </h1>
            </div>

            {/* Lesson Body Content */}
            <div className="prose prose-sm max-w-none text-xs sm:text-sm text-[#1D1D24] leading-relaxed space-y-4">
              {currentLesson.content ? (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {currentLesson.content}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#F9FAFD] border border-border/60 text-center text-xs text-[#8A8D9A]">
                  Pelajaran ini berfokus pada materi interaktif dan file penunjang di bawah.
                </div>
              )}
            </div>

            {/* Materials Section */}
            {currentLesson.materials && currentLesson.materials.length > 0 && (
              <div className="pt-4 border-t border-border/60 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#8A8D9A]">
                  Materi & Dokumen Penunjang
                </h4>
                <div className="space-y-2">
                  {currentLesson.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3 rounded-xl border border-border/70 flex items-center justify-between bg-[#F9FAFD] hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileDown className="w-4 h-4 text-[#6C5CE7]" />
                        <span className="text-xs font-semibold text-[#17181C]">{mat.title}</span>
                      </div>
                      {mat.externalUrl && (
                        <a
                          href={mat.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#6C5CE7] hover:underline flex items-center gap-1"
                        >
                          <span>Buka Tautan</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quizzes & Assignments Card */}
            {(quiz || assignment) && (
              <div className="pt-4 border-t border-border/60 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#8A8D9A]">
                  Evaluasi & Penugasan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quiz && (
                    <div className="p-4 rounded-2xl bg-[#EFEDFD]/60 border border-[#6C5CE7]/20 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#6C5CE7]">
                          <HelpCircle className="w-4 h-4" />
                          <span>Kuis Evaluasi</span>
                        </div>
                        <h5 className="font-bold text-sm text-[#17181C] mt-1">{quiz.title}</h5>
                        <p className="text-[11px] text-[#676A78] mt-0.5">
                          Batas Lulus: {quiz.passingScore}%
                        </p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setQuizModalOpen(true)}
                        className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold"
                      >
                        Buka Kuis
                      </Button>
                    </div>
                  )}

                  {assignment && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/50 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                          <FileText className="w-4 h-4" />
                          <span>Tugas Praktik</span>
                        </div>
                        <h5 className="font-bold text-sm text-[#17181C] mt-1">{assignment.title}</h5>
                        <p className="text-[11px] text-[#676A78] mt-0.5">
                          Status: {assignment.submission ? assignment.submission.status.toUpperCase() : 'BELUM DIKERJAKAN'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssignmentModalOpen(true)}
                        className="rounded-xl text-xs font-bold border-amber-300 text-amber-900 hover:bg-amber-100"
                      >
                        Lihat Tugas
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions: Mark Complete & Prev / Next */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {prevLesson && courseId ? (
                  <Link to={`/student/courses/${courseId}/lessons/${prevLesson.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs w-full sm:w-auto gap-1">
                      <ChevronLeft className="w-4 h-4" />
                      <span>Sebelumnya</span>
                    </Button>
                  </Link>
                ) : <div />}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant={isCompleted ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleMarkComplete}
                  disabled={completing}
                  className={`rounded-xl text-xs font-bold gap-1.5 ${
                    isCompleted ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white'
                  }`}
                >
                  {completing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isCompleted ? 'Tandai Selesai Kembali' : 'Tandai Selesai'}</span>
                </Button>

                {nextLesson && courseId && (
                  <Link to={`/student/courses/${courseId}/lessons/${nextLesson.id}`}>
                    <Button variant="default" size="sm" className="rounded-xl text-xs bg-[#17181C] hover:bg-black text-white gap-1 font-bold">
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Navigation outline */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-border/80 p-5 shadow-xs space-y-4">
            <div className="border-b border-border/60 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C5CE7]">
                Daftar Pelajaran
              </span>
              <h4 className="font-bold text-sm text-[#17181C] line-clamp-1 mt-0.5">{course.title}</h4>
            </div>

            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {allLessons.map((l, idx) => {
                const isCur = l.id === lessonId
                const isDone = l.progress?.status === 'completed'

                return (
                  <Link
                    key={l.id}
                    to={`/student/courses/${course.id}/lessons/${l.id}`}
                    className={`p-3 rounded-xl text-xs flex items-center justify-between transition-colors block ${
                      isCur
                        ? 'bg-[#6C5CE7] text-white font-bold shadow-xs'
                        : 'text-[#17181C] hover:bg-[#F4F5FB]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <span className={`text-[11px] shrink-0 ${isCur ? 'text-white/80' : 'text-[#8A8D9A]'}`}>
                        {idx + 1}.
                      </span>
                      <span className="truncate">{l.title}</span>
                    </div>

                    {isDone ? (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${isCur ? 'text-white' : 'text-emerald-600'}`} />
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {quiz && quizModalOpen && (
        <QuizPlayerModal
          quiz={quiz}
          onClose={() => setQuizModalOpen(false)}
          onSuccess={() => {
            if (courseId && lessonId) loadData(courseId, lessonId)
          }}
        />
      )}

      {/* Assignment Modal */}
      {assignment && assignmentModalOpen && (
        <AssignmentModal
          assignment={assignment}
          onClose={() => setAssignmentModalOpen(false)}
          onSuccess={() => {
            if (courseId && lessonId) loadData(courseId, lessonId)
          }}
        />
      )}
    </AppShell>
  )
}
