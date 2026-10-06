import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { CourseCard } from '@/components/learning/CourseCard'
import { courseService } from '@/services/courseService'
import type { Course, CourseLevel } from '@/types/course'
import { BookOpen, Search, Filter, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all')
  const [tab, setTab] = useState<'all' | 'enrolled'>('all')

  useEffect(() => {
    let isMounted = true
    courseService
      .getCourses()
      .then((data) => {
        if (isMounted) {
          setCourses(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const enrolledCourses = courses.filter((c) => Boolean(c.enrollment))

  const filteredCourses = (tab === 'enrolled' ? enrolledCourses : courses).filter((c) => {
    if (levelFilter !== 'all' && c.level !== levelFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchTitle = c.title.toLowerCase().includes(q)
      const matchDesc = (c.description || '').toLowerCase().includes(q)
      const matchSub = (c.subjectName || '').toLowerCase().includes(q)
      if (!matchTitle && !matchDesc && !matchSub) return false
    }
    return true
  })

  return (
    <AppShell>
      <PageHeader
        title="Kursus & Modul Belajar"
        subtitle="Eksplorasi modul materi terstruktur, pelajaran interaktif, kuis, dan sertifikasi kelulusan."
        badge="Akademik"
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'all'
              ? 'bg-[#6C5CE7] text-white shadow-xs'
              : 'text-[#676A78] hover:text-[#17181C] hover:bg-[#EEF0F8]'
          }`}
        >
          Semua Kursus ({courses.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('enrolled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            tab === 'enrolled'
              ? 'bg-[#6C5CE7] text-white shadow-xs'
              : 'text-[#676A78] hover:text-[#17181C] hover:bg-[#EEF0F8]'
          }`}
        >
          Sedang Dipelajari ({enrolledCourses.length})
        </button>
      </div>

      {/* Search and Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8D9A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi atau kursus..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/80 text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#8A8D9A]" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as CourseLevel | 'all')}
            className="px-3 py-2 rounded-xl border border-border/80 text-xs font-semibold text-[#17181C] bg-white focus:outline-hidden"
          >
            <option value="all">Semua Level</option>
            <option value="beginner">Tingkat Pemula</option>
            <option value="intermediate">Tingkat Menengah</option>
            <option value="advanced">Tingkat Lanjutan</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
          <p className="text-xs text-[#8A8D9A]">Memuat daftar kursus materi...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#17181C]">
            {tab === 'enrolled' ? 'Belum Ada Kursus yang Diikuti' : 'Kursus Tidak Ditemukan'}
          </h3>
          <p className="text-xs text-[#676A78] max-w-sm mx-auto">
            {tab === 'enrolled'
              ? 'Jelajahi katalog materi untuk memulai perjalanan belajar terstruktur Anda.'
              : 'Coba ubah kata kunci pencarian atau sesuaikan filter level.'}
          </p>
          {tab === 'enrolled' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setTab('all')}
              className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold"
            >
              Jelajahi Katalog
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
