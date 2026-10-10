import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Library,
  Compass,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Loader2,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  subjectService,
  type SubjectCounts,
} from '@/services/subjectService'
import type { Subject } from '@/types'
import { formatShortDate } from '@/utils/format'

export function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [counts, setCounts] = useState<SubjectCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'general' | 'religious'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<'general' | 'religious'>('general')
  const [formDescription, setFormDescription] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [countsData, subjectsData] = await Promise.all([
        subjectService.getSubjectCounts().catch(() => null),
        subjectService.getAllSubjects({
          category: categoryFilter,
          status: statusFilter,
          search: search.trim() || undefined,
        }),
      ])

      if (countsData) setCounts(countsData)
      setSubjects(subjectsData)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat katalog mata pelajaran.'
      toast.error(msg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [categoryFilter, statusFilter, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
  }

  const handleOpenCreate = () => {
    setEditingSubject(null)
    setFormName('')
    setFormCategory('general')
    setFormDescription('')
    setFormIsActive(true)
    setDialogOpen(true)
  }

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub)
    setFormName(sub.name)
    setFormCategory(sub.category)
    setFormDescription(sub.description || '')
    setFormIsActive(sub.is_active)
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error('Nama mata pelajaran wajib diisi.')
      return
    }

    setSaving(true)
    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id, {
          name: formName,
          category: formCategory,
          description: formDescription,
          is_active: formIsActive,
        })
        toast.success(`Mata pelajaran "${formName}" berhasil diperbarui.`)
      } else {
        await subjectService.createSubject({
          name: formName,
          category: formCategory,
          description: formDescription,
          is_active: formIsActive,
        })
        toast.success(`Mata pelajaran "${formName}" berhasil ditambahkan.`)
      }
      setDialogOpen(false)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan mata pelajaran.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (sub: Subject) => {
    const nextStatus = !sub.is_active
    try {
      await subjectService.toggleSubjectStatus(sub.id, nextStatus)
      toast.success(
        `Status mata pelajaran "${sub.name}" diubah menjadi ${nextStatus ? 'Aktif' : 'Non-aktif'}.`
      )
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status.'
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!deletingSubject) return
    setDeleting(true)
    try {
      await subjectService.deleteSubject(deletingSubject.id)
      toast.success(`Mata pelajaran "${deletingSubject.name}" berhasil dihapus.`)
      setDeletingSubject(null)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus mata pelajaran.'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Katalog Mata Pelajaran"
          subtitle="Kelola direktori kurikulum mata pelajaran umum dan keagamaan Islam yang tersedia bagi siswa dan tutor."
          badge="Kurikulum & Katalog"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </Button>
              <Button
                size="sm"
                onClick={handleOpenCreate}
                className="min-h-[44px] gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Mata Pelajaran</span>
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Mata Pelajaran"
            value={counts ? counts.total.toLocaleString('id-ID') : '...'}
            icon={BookOpen}
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            iconColor="text-blue-600"
          />
          <StatCard
            label="Kurikulum Umum"
            value={counts ? counts.general.toLocaleString('id-ID') : '...'}
            icon={Library}
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            iconColor="text-indigo-600"
          />
          <StatCard
            label="Pendidikan Agama"
            value={counts ? counts.religious.toLocaleString('id-ID') : '...'}
            icon={Compass}
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            iconColor="text-emerald-600"
          />
          <StatCard
            label="Status Aktif"
            value={counts ? counts.active.toLocaleString('id-ID') : '...'}
            icon={CheckCircle2}
            iconBg="bg-teal-50 dark:bg-teal-950/40"
            iconColor="text-teal-600"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari nama atau deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(
                  [
                    { id: 'all', label: 'Semua Kategori' },
                    { id: 'general', label: 'Umum' },
                    { id: 'religious', label: 'Keagamaan' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === tab.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(
                  [
                    { id: 'all', label: 'Semua' },
                    { id: 'active', label: 'Aktif' },
                    { id: 'inactive', label: 'Non-aktif' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === tab.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Mata Pelajaran</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Deskripsi</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Terdaftar</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4">
                        <Skeleton className="w-36 h-4" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="w-20 h-5 rounded-full" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="w-56 h-4" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="w-16 h-5 rounded-full" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="w-20 h-4" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Skeleton className="w-24 h-8 ml-auto rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        Tidak ada mata pelajaran ditemukan
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Coba sesuaikan kata kunci pencarian atau tambahkan mata pelajaran baru.
                      </p>
                    </td>
                  </tr>
                ) : (
                  subjects.map((item) => {
                    const isGeneral = item.category === 'general'

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`text-xs px-2.5 py-0.5 font-medium ${
                              isGeneral
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                            }`}
                          >
                            {isGeneral ? 'Umum' : 'Keagamaan'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {item.description || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`text-xs px-2 py-0.5 font-medium ${
                              item.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {item.is_active ? 'Aktif' : 'Non-aktif'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {formatShortDate(item.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(item)}
                              className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white gap-1"
                              title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            >
                              {item.is_active ? (
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-slate-400" />
                              )}
                              <span className="hidden sm:inline">
                                {item.is_active ? 'Matikan' : 'Aktifkan'}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(item)}
                              className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white gap-1"
                              title="Ubah"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Ubah</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingSubject(item)}
                              className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-xs text-slate-500">
            Total {subjects.length} mata pelajaran terdaftar dalam katalog kurikulum.
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            </DialogTitle>
            <DialogDescription>
              Isi data mata pelajaran untuk ditampilkan pada kurikulum dan penugasan tutor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Mata Pelajaran <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Contoh: Matematika Diskrit, Bahasa Arab..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kategori Kurikulum
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    formCategory === 'general'
                      ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 font-semibold text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value="general"
                    checked={formCategory === 'general'}
                    onChange={() => setFormCategory('general')}
                    className="text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Pendidikan Umum</span>
                </label>
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    formCategory === 'religious'
                      ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 font-semibold text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value="religious"
                    checked={formCategory === 'religious'}
                    onChange={() => setFormCategory('religious')}
                    className="text-brand-primary focus:ring-brand-primary"
                  />
                  <span>Pendidikan Agama</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Deskripsi / Silabus Ringkas
              </label>
              <textarea
                rows={3}
                placeholder="Penjelasan ringkas materi dan fokus pembahasan mata pelajaran..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_active"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="is_active" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                Aktifkan mata pelajaran (dapat dipilih siswa dan tutor)
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Menyimpan...</span>
                  </>
                ) : editingSubject ? (
                  'Perbarui'
                ) : (
                  'Tambah Mata Pelajaran'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingSubject}
        onOpenChange={(open) => !open && setDeletingSubject(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Hapus Mata Pelajaran?</span>
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus mata pelajaran{' '}
              <strong className="text-slate-900 dark:text-white">
                {deletingSubject?.name}
              </strong>
              ? Jika mata pelajaran sudah terhubung dengan data pengajar atau kurikulum, sistem
              akan merekomendasikan untuk menonaktifkan statusnya.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingSubject(null)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Menghapus...</span>
                </>
              ) : (
                'Ya, Hapus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
