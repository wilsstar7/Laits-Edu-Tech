import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { courseService } from '@/services/courseService'
import type { Course, CourseStatus } from '@/types/course'
import {
  BookOpen,
  Plus,
  Clock,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all')

  // Create course dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const loadCourses = async () => {
    try {
      // In admin view, we query all statuses
      const data = await courseService.getCourses({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      setCourses(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    courseService
      .getCourses({ status: statusFilter !== 'all' ? statusFilter : undefined })
      .then((data) => {
        if (isMounted) setCourses(data)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [statusFilter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Judul kursus wajib diisi.')
      return
    }

    setCreating(true)
    try {
      await courseService.createCourse({
        title: newTitle,
        description: newDescription,
        level: 'beginner',
        estimatedDurationMinutes: 60,
      })
      toast.success('Draft kursus berhasil dibuat!')
      setDialogOpen(false)
      setNewTitle('')
      setNewDescription('')
      await loadCourses()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat kursus.'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (courseId: string, newStatus: CourseStatus) => {
    try {
      await courseService.setCourseStatus(courseId, newStatus)
      toast.success(`Status kursus berhasil diubah menjadi ${newStatus.toUpperCase()}.`)
      await loadCourses()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status kursus.'
      toast.error(msg)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Manajemen Kursus & Konten"
        subtitle="Kelola silabus modul pembelajaran, materi kurikulum, penugasan, dan status publikasi."
        badge="Administrasi Konten"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border/80">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CourseStatus | 'all')}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-[#17181C] bg-white focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="published">Dipublikasikan (Published)</option>
            <option value="draft">Konsep (Draft)</option>
            <option value="archived">Diarsipkan (Archived)</option>
          </select>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kursus Baru</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
          <p className="text-xs text-[#8A8D9A]">Memuat daftar kursus admin...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#6C5CE7] mx-auto" />
          <h4 className="font-bold text-base text-[#17181C]">Belum Ada Kursus Terdaftar</h4>
          <p className="text-xs text-[#676A78]">
            Mulai susun kurikulum materi baru dengan menekan tombol buat kursus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-border/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EFEDFD] text-[#6C5CE7]">
                    {course.subjectName || 'Umum'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      course.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : course.status === 'draft'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#17181C] line-clamp-1">{course.title}</h3>
                <p className="text-xs text-[#676A78] line-clamp-2 leading-relaxed">
                  {course.description || 'Tidak ada deskripsi.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between text-xs text-[#8A8D9A]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.estimatedDurationMinutes} Menit
                  </span>
                  <span className="capitalize font-semibold text-[#17181C]">Level: {course.level}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link to={`/student/courses/${course.id}`} className="text-xs font-bold text-[#6C5CE7] hover:underline">
                    Pratinjau Siswa &rarr;
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {course.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(course.id, 'published')}
                        className="rounded-lg text-[11px] h-7 px-2 font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        Publikasikan
                      </Button>
                    )}
                    {course.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(course.id, 'archived')}
                        className="rounded-lg text-[11px] h-7 px-2 font-bold text-rose-700 border-rose-300 hover:bg-rose-50"
                      >
                        Arsipkan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Dialog Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-[#17181C]">Buat Draft Kursus Baru</h3>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="text-[#8A8D9A] hover:text-[#17181C] text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="course-title" className="block text-xs font-bold text-[#17181C] mb-1">
                  Judul Kursus
                </label>
                <input
                  id="course-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Pemahaman Dasar Bahasa Arab"
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="course-desc" className="block text-xs font-bold text-[#17181C] mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  id="course-desc"
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Jelaskan ringkasan materi dan target pembelajaran..."
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={creating}
                  className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  <span>Buat Kursus</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
