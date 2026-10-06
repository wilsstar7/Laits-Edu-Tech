import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { announcementService } from '@/services/announcementService'
import type { Announcement, AnnouncementAudience } from '@/types/announcement'
import {
  Megaphone,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<AnnouncementAudience>('all')

  const loadData = async () => {
    try {
      const data = await announcementService.getAllAnnouncementsAdmin()
      setAnnouncements(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    announcementService
      .getAllAnnouncementsAdmin()
      .then((data) => {
        if (isMounted) setAnnouncements(data)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Judul dan isi pengumuman wajib diisi.')
      return
    }

    setCreating(true)
    try {
      await announcementService.createAnnouncement({
        title,
        content,
        audience,
      })
      toast.success('Draft pengumuman berhasil disimpan.')
      setDialogOpen(false)
      setTitle('')
      setContent('')
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat pengumuman.'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await announcementService.publishAnnouncement(id)
      toast.success('Pengumuman berhasil dipublikasikan & notifikasi sistem telah dikirim!')
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mempublikasikan pengumuman.'
      toast.error(msg)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Pengumuman & Komunikasi Platform"
        subtitle="Siarkan informasi operasional, pembaruan kurikulum, dan pengumuman resmi ke seluruh pengguna."
        badge="Komunikasi"
      />

      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-border/80">
        <div>
          <h3 className="font-bold text-sm text-[#17181C]">Daftar Pengumuman Siaran</h3>
          <p className="text-xs text-[#676A78]">Total {announcements.length} pengumuman terdaftar</p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
          <p className="text-xs text-[#8A8D9A]">Memuat arsip pengumuman...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3">
          <Megaphone className="w-8 h-8 text-[#6C5CE7] mx-auto" />
          <h4 className="font-bold text-base text-[#17181C]">Belum Ada Pengumuman</h4>
          <p className="text-xs text-[#676A78]">
            Buat pesan siaran baru untuk menginformasikan pengumuman penting kepada siswa atau tutor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-border/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      item.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                  </span>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#F4F5FB] text-[#676A78] uppercase">
                    Audience: {item.audience}
                  </span>
                </div>

                <h4 className="font-bold text-base text-[#17181C]">{item.title}</h4>
                <p className="text-xs text-[#676A78] leading-relaxed line-clamp-2">
                  {item.content}
                </p>

                <div className="text-[11px] text-[#8A8D9A] pt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Dibuat: {new Date(item.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {item.status === 'draft' ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handlePublish(item.id)}
                    className="rounded-xl text-xs bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publikasikan</span>
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aktif Tayang</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-[#17181C]">Buat Pengumuman Baru</h3>
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
                <label htmlFor="ann-title" className="block text-xs font-bold text-[#17181C] mb-1">
                  Judul Pengumuman
                </label>
                <input
                  id="ann-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Pembaruan Kurikulum Semester Ganjil"
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#6C5CE7] focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="ann-aud" className="block text-xs font-bold text-[#17181C] mb-1">
                  Target Sasaran (Audience)
                </label>
                <select
                  id="ann-aud"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                  className="w-full p-2.5 rounded-xl border border-border text-xs bg-white focus:outline-hidden"
                >
                  <option value="all">Semua Pengguna (Siswa & Tutor)</option>
                  <option value="students">Hanya Siswa</option>
                  <option value="tutors">Hanya Tutor</option>
                  <option value="admins">Internal Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="ann-content" className="block text-xs font-bold text-[#17181C] mb-1">
                  Isi Pesan Siaran
                </label>
                <textarea
                  id="ann-content"
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi pengumuman lengkap di sini..."
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
                  <span>Simpan Draft</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
