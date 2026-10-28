import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { CourseCard } from '@/components/learning/CourseCard'
import { LearningGoalCard } from '@/components/learning/LearningGoalCard'
import { StreakCard } from '@/components/learning/StreakCard'
import { courseService } from '@/services/courseService'
import { engagementService } from '@/services/engagementService'
import type { Course, CourseLevel } from '@/types/course'
import type { LearningGoal, StudentStreak, GoalTargetType } from '@/types/engagement'
import {
  BookOpen,
  Search,
  Filter,
  Loader2,
  Target,
  Plus,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function StudentCoursesPage() {
  // Course State
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all')
  const [courseTab, setCourseTab] = useState<'all' | 'enrolled'>('all')

  // Learning Goals & Streak State
  const [goals, setGoals] = useState<LearningGoal[]>([])
  const [streak, setStreak] = useState<StudentStreak>({
    studentId: '',
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  })
  const [loadingGoals, setLoadingGoals] = useState(true)

  // Create Goal Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetType, setTargetType] = useState<GoalTargetType>('sessions')
  const [targetValue, setTargetValue] = useState(4)
  const [targetDate, setTargetDate] = useState('')

  // Load Courses
  useEffect(() => {
    let isMounted = true
    courseService
      .getCourses()
      .then((data) => {
        if (isMounted) {
          setCourses(data)
          setLoadingCourses(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoadingCourses(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Load Goals & Streak
  const reloadGoalsData = async () => {
    try {
      const [goalsData, streakData] = await Promise.all([
        engagementService.getGoals(),
        engagementService.getStreak(),
      ])
      setGoals(goalsData)
      setStreak(streakData)
    } finally {
      setLoadingGoals(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    Promise.all([engagementService.getGoals(), engagementService.getStreak()]).then(
      ([goalsData, streakData]) => {
        if (isMounted) {
          setGoals(goalsData)
          setStreak(streakData)
          setLoadingGoals(false)
        }
      }
    )

    return () => {
      isMounted = false
    }
  }, [])

  // Goal Actions
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Judul target tidak boleh kosong.')
      return
    }

    setCreating(true)
    try {
      await engagementService.createGoal({
        title,
        description,
        targetType,
        targetValue,
        targetDate: targetDate || null,
      })
      toast.success('Target belajar baru berhasil dibuat!')
      setDialogOpen(false)
      setTitle('')
      setDescription('')
      setTargetValue(4)
      setTargetDate('')
      await reloadGoalsData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat target.'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleIncrement = async (goalId: string) => {
    try {
      await engagementService.updateGoalProgress(goalId, 1)
      toast.success('Progres target diperbarui!')
      await reloadGoalsData()
    } catch {
      toast.error('Gagal memperbarui progres target.')
    }
  }

  // Filtered Goals
  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  // Filtered Courses
  const enrolledCourses = courses.filter((c) => Boolean(c.enrollment))
  const filteredCourses = (courseTab === 'enrolled' ? enrolledCourses : courses).filter((c) => {
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
        title="Kursus & Target Belajar"
        subtitle="Eksplorasi modul materi terstruktur, kelola sasaran akademik mandiri, dan pantau konsistensi belajar Anda setiap hari."
        badge="Akademik & Target"
      />

      <div className="space-y-10">
        {/* ========================================================= */}
        {/* BAGIAN 1: TARGET & KONSISTENSI BELAJAR */}
        {/* ========================================================= */}
        <section aria-labelledby="section-goals-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8ECF6] text-[#183058] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 id="section-goals-heading" className="text-lg font-bold text-[#17181C]">
                  Target & Resolusi Belajar
                </h2>
                <p className="text-xs text-[#676A78]">
                  Pantau perkembangan sasaran belajar personal dan rekor streak Anda
                </p>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="rounded-xl text-xs bg-[#183058] hover:bg-[#5B4CD7] text-white font-bold gap-1.5 shadow-xs w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Target Baru</span>
            </Button>
          </div>

          {/* Top Streak and Quick Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <div className="md:col-span-1 h-full">
              <StreakCard streak={streak} className="h-full" />
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl border border-border/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#17181C]">Rencana Belajar Pribadi</h3>
                  <p className="text-xs text-[#676A78] mt-0.5">
                    {activeGoals.length} Target Aktif &bull; {completedGoals.length} Target Selesai
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8ECF6] text-[#183058] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fokus Belajar</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F4F6FA] border border-border/60">
                  <span className="text-[#8A8D9A] block text-[11px] font-medium">Total Target</span>
                  <strong className="text-lg font-extrabold text-[#17181C] mt-0.5 block">
                    {goals.length}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-emerald-700 block text-[11px] font-medium">Tercapai</span>
                  <strong className="text-lg font-extrabold text-emerald-800 mt-0.5 block">
                    {completedGoals.length}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-[#E8ECF6] border border-[#183058]/20">
                  <span className="text-[#183058] block text-[11px] font-medium">Konsistensi</span>
                  <strong className="text-lg font-extrabold text-[#183058] mt-0.5 block">
                    {streak.currentStreak} Hari
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Active Goals Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#17181C] flex items-center gap-2">
                <span>Target Sedang Berjalan</span>
                <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#E8ECF6] text-[#183058] font-bold">
                  {activeGoals.length}
                </span>
              </h3>
            </div>

            {loadingGoals ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-border/70">
                <Loader2 className="w-6 h-6 animate-spin text-[#183058]" />
                <p className="text-xs text-[#8A8D9A]">Memuat target belajar...</p>
              </div>
            ) : activeGoals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border/80 p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8ECF6] text-[#183058] flex items-center justify-center mx-auto">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#17181C]">Belum Ada Target Aktif</h4>
                <p className="text-xs text-[#676A78] max-w-sm mx-auto">
                  Buat resolusi belajar Anda bulan ini untuk memacu konsistensi dan perkembangan akademik.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  className="rounded-xl text-xs font-bold"
                >
                  Mulai Buat Target
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map((g) => (
                  <LearningGoalCard key={g.id} goal={g} onIncrement={handleIncrement} />
                ))}
              </div>
            )}
          </div>

          {/* Completed Goals Section */}
          {completedGoals.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#17181C]">
                  Target Telah Tercapai ({completedGoals.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map((g) => (
                  <LearningGoalCard key={g.id} goal={g} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Separator between Target and Courses */}
        <div className="border-t border-border/80" />

        {/* ========================================================= */}
        {/* BAGIAN 2: KATALOG & MODUL KURSUS */}
        {/* ========================================================= */}
        <section aria-labelledby="section-courses-heading" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8ECF6] text-[#183058] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 id="section-courses-heading" className="text-lg font-bold text-[#17181C]">
                  Modul & Materi Kursus
                </h2>
                <p className="text-xs text-[#676A78]">
                  Pilih kursus terstruktur untuk menunjang pencapaian target belajar Anda
                </p>
              </div>
            </div>

            {/* Course Filter Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCourseTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  courseTab === 'all'
                    ? 'bg-[#183058] text-white shadow-xs'
                    : 'text-[#676A78] hover:text-[#17181C] hover:bg-[#ECF0F7] bg-white border border-border/70'
                }`}
              >
                Semua Kursus ({courses.length})
              </button>
              <button
                type="button"
                onClick={() => setCourseTab('enrolled')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  courseTab === 'enrolled'
                    ? 'bg-[#183058] text-white shadow-xs'
                    : 'text-[#676A78] hover:text-[#17181C] hover:bg-[#ECF0F7] bg-white border border-border/70'
                }`}
              >
                Sedang Dipelajari ({enrolledCourses.length})
              </button>
            </div>
          </div>

          {/* Search and Filter toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border/80 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8D9A]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari materi atau topik kursus..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/80 text-xs focus:ring-2 focus:ring-[#183058] focus:outline-hidden bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-[#8A8D9A]" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as CourseLevel | 'all')}
                className="px-3 py-2 rounded-xl border border-border/80 text-xs font-semibold text-[#17181C] bg-white focus:outline-hidden w-full sm:w-auto"
              >
                <option value="all">Semua Level</option>
                <option value="beginner">Tingkat Pemula</option>
                <option value="intermediate">Tingkat Menengah</option>
                <option value="advanced">Tingkat Lanjutan</option>
              </select>
            </div>
          </div>

          {/* Courses Grid */}
          {loadingCourses ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-border/70">
              <Loader2 className="w-8 h-8 animate-spin text-[#183058]" />
              <p className="text-xs text-[#8A8D9A]">Memuat daftar kursus materi...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E8ECF6] text-[#183058] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#17181C]">
                {courseTab === 'enrolled' ? 'Belum Ada Kursus yang Diikuti' : 'Kursus Tidak Ditemukan'}
              </h3>
              <p className="text-xs text-[#676A78] max-w-sm mx-auto">
                {courseTab === 'enrolled'
                  ? 'Jelajahi katalog materi untuk memulai perjalanan belajar terstruktur Anda.'
                  : 'Coba ubah kata kunci pencarian atau sesuaikan filter level.'}
              </p>
              {courseTab === 'enrolled' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setCourseTab('all')}
                  className="rounded-xl text-xs bg-[#183058] hover:bg-[#5B4CD7] text-white font-bold"
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
        </section>
      </div>

      {/* ========================================================= */}
      {/* MODAL DIALOG BUAT TARGET BELAJAR */}
      {/* ========================================================= */}
      {dialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50"
        >
          <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-[#183058]" />
                <h3 id="dialog-title" className="font-bold text-base text-[#17181C]">
                  Buat Target Belajar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="text-[#8A8D9A] hover:text-[#17181C] p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label htmlFor="modal-goal-title" className="block text-xs font-bold text-[#17181C] mb-1">
                  Judul Target
                </label>
                <input
                  id="modal-goal-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Selesaikan 8 sesi les bulan ini"
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#183058] focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="modal-goal-desc" className="block text-xs font-bold text-[#17181C] mb-1">
                  Deskripsi / Catatan (Opsional)
                </label>
                <input
                  id="modal-goal-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Misal: Fokus pada pemahaman kalkulus"
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#183058] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-goal-target-type" className="block text-xs font-bold text-[#17181C] mb-1">
                    Jenis Satuan
                  </label>
                  <select
                    id="modal-goal-target-type"
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as GoalTargetType)}
                    className="w-full p-2.5 rounded-xl border border-border text-xs bg-white focus:outline-hidden"
                  >
                    <option value="sessions">Sesi Les Privat</option>
                    <option value="courses">Kursus Materi</option>
                    <option value="lessons">Pelajaran Selesai</option>
                    <option value="minutes">Menit Belajar</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-goal-target-value" className="block text-xs font-bold text-[#17181C] mb-1">
                    Jumlah Sasaran
                  </label>
                  <input
                    id="modal-goal-target-value"
                    type="number"
                    min={1}
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#183058] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal-goal-target-date" className="block text-xs font-bold text-[#17181C] mb-1">
                  Batas Waktu (Opsional)
                </label>
                <input
                  id="modal-goal-target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#183058] focus:outline-hidden bg-white"
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
                  className="rounded-xl text-xs bg-[#183058] hover:bg-[#5B4CD7] text-white font-bold"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  <span>Simpan Target</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
