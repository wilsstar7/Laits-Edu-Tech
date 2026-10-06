import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { LearningGoalCard } from '@/components/learning/LearningGoalCard'
import { StreakCard } from '@/components/learning/StreakCard'
import { engagementService } from '@/services/engagementService'
import type { LearningGoal, StudentStreak, GoalTargetType } from '@/types/engagement'
import { Target, Plus, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function StudentGoalsPage() {
  const [goals, setGoals] = useState<LearningGoal[]>([])
  const [streak, setStreak] = useState<StudentStreak>({ studentId: '', currentStreak: 0, longestStreak: 0, lastActivityDate: null })
  const [loading, setLoading] = useState(true)

  // Create Goal Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetType, setTargetType] = useState<GoalTargetType>('sessions')
  const [targetValue, setTargetValue] = useState(4)
  const [targetDate, setTargetDate] = useState('')

  const loadData = async () => {
    try {
      const [goalsData, streakData] = await Promise.all([
        engagementService.getGoals(),
        engagementService.getStreak(),
      ])
      setGoals(goalsData)
      setStreak(streakData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    Promise.all([
      engagementService.getGoals(),
      engagementService.getStreak(),
    ]).then(([goalsData, streakData]) => {
      if (isMounted) {
        setGoals(goalsData)
        setStreak(streakData)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

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
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat target.')
    } finally {
      setCreating(false)
    }
  }

  const handleIncrement = async (goalId: string) => {
    try {
      await engagementService.updateGoalProgress(goalId, 1)
      toast.success('Progres target diperbarui!')
      await loadData()
    } catch (err: any) {
      toast.error('Gagal memperbarui progres target.')
    }
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  return (
    <AppShell>
      <PageHeader
        title="Target Belajar & Resolusi"
        subtitle="Tetapkan sasaran akademik mandiri dan pantau konsistensi belajar Anda setiap hari."
        badge="Target Belajar"
      />

      {/* Top Streak and Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
          <StreakCard streak={streak} />
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-border/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17181C]">Rencana Belajar Pribadi</h3>
              <p className="text-xs text-[#676A78]">
                {activeGoals.length} Target Aktif &bull; {completedGoals.length} Target Selesai
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Target Baru</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F4F5FB] border border-border/60">
              <span className="text-[#8A8D9A] block text-[11px]">Total Target</span>
              <strong className="text-base font-extrabold text-[#17181C] mt-0.5 block">{goals.length}</strong>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-700 block text-[11px]">Tercapai</span>
              <strong className="text-base font-extrabold text-emerald-800 mt-0.5 block">{completedGoals.length}</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#EFEDFD] border border-[#6C5CE7]/20 col-span-2 sm:col-span-1">
              <span className="text-[#6C5CE7] block text-[11px]">Konsistensi</span>
              <strong className="text-base font-extrabold text-[#6C5CE7] mt-0.5 block">{streak.currentStreak} Hari</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Active Goals Section */}
      <div className="space-y-4 pt-2">
        <h3 className="font-bold text-base text-[#17181C]">Target Sedang Berjalan</h3>

        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#6C5CE7]" />
            <p className="text-xs text-[#8A8D9A]">Memuat target belajar...</p>
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeGoals.map((g) => (
              <LearningGoalCard key={g.id} goal={g} onIncrement={handleIncrement} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-[#17181C]">Target Telah Tercapai</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {completedGoals.map((g) => (
              <LearningGoalCard key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      {/* Create Goal Dialog Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-[#6C5CE7]" />
                <h3 className="font-bold text-base text-[#17181C]">Buat Target Belajar</h3>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="text-[#8A8D9A] hover:text-[#17181C] text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label htmlFor="goal-title" className="block text-xs font-bold text-[#17181C] mb-1">
                  Judul Target
                </label>
                <input
                  id="goal-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Selesaikan 8 sesi les bulan ini"
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="goal-desc" className="block text-xs font-bold text-[#17181C] mb-1">
                  Deskripsi / Catatan (Opsional)
                </label>
                <input
                  id="goal-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Misal: Fokus pada pemahaman kalkulus"
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-target-type" className="block text-xs font-bold text-[#17181C] mb-1">
                    Jenis Satuan
                  </label>
                  <select
                    id="goal-target-type"
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
                  <label htmlFor="goal-target-value" className="block text-xs font-bold text-[#17181C] mb-1">
                    Jumlah Sasaran
                  </label>
                  <input
                    id="goal-target-value"
                    type="number"
                    min={1}
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="goal-target-date" className="block text-xs font-bold text-[#17181C] mb-1">
                  Batas Waktu (Opsional)
                </label>
                <input
                  id="goal-target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden bg-white"
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
