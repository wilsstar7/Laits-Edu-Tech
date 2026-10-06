import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  GraduationCap,
  Users,
  Calendar,
  CreditCard,
  UserCheck,
  Loader2,
  RefreshCw,
  Compass,
  Eye,
  Database,
  Library,
  Megaphone,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import {
  adminService,
  type AdminOverview,
  type AdminStudentAssessmentItem,
} from '@/services/adminService'
import { AdminStudentAssessmentModal } from '@/components/admin/AdminStudentAssessmentModal'
import { formatShortDate, formatReportDate } from '@/utils/format'
import { env } from '@/lib/env'

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [studentAssessments, setStudentAssessments] = useState<AdminStudentAssessmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      try {
        if (env.isSupabaseConfigured) {
          const [overview, assessments] = await Promise.all([
            adminService.getOverview().catch(() => null),
            adminService.getStudentAssessments().catch(() => []),
          ])
          if (!cancelled) {
            if (overview) setData(overview)
            setStudentAssessments(assessments)
          }
        } else {
          if (!cancelled) {
            setData({ totalStudents: 0, totalTutors: 0, recentUsers: [] })
            setStudentAssessments([])
          }
        }
      } catch {
        if (!cancelled) {
          setData({ totalStudents: 0, totalTutors: 0, recentUsers: [] })
          setStudentAssessments([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      if (env.isSupabaseConfigured) {
        const [overview, assessments] = await Promise.all([
          adminService.getOverview().catch(() => null),
          adminService.getStudentAssessments().catch(() => []),
        ])
        if (overview) setData(overview)
        setStudentAssessments(assessments)
      }
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Admin Overview"
        subtitle="Ringkasan operasional sistem, database pengguna terdaftar, dan status otorisasi platform."
        badge="Administrator"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/courses"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold hover:bg-[#5243D6] transition-colors min-h-[44px]"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Kelola Kursus</span>
            </Link>
            <Link
              to="/admin/announcements"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border text-foreground text-xs font-bold hover:bg-[#EEF0F8] transition-colors min-h-[44px]"
            >
              <Megaphone className="w-3.5 h-3.5 text-[#6C5CE7]" />
              <span>Pengumuman</span>
            </Link>
            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border text-foreground text-xs font-bold hover:bg-[#EEF0F8] transition-colors min-h-[44px]"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#6C5CE7]" />
              <span>Verifikasi Pembayaran</span>
            </Link>
            <Link
              to="/admin/reviews"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border text-foreground text-xs font-bold hover:bg-[#EEF0F8] transition-colors min-h-[44px]"
            >
              <Compass className="w-3.5 h-3.5 text-[#6C5CE7]" />
              <span>Moderasi Ulasan</span>
            </Link>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border text-foreground text-xs font-bold hover:bg-[#EEF0F8] transition-colors min-h-[44px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan Data</span>
            </button>
          </div>
        }
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Siswa Terdaftar"
          value={loading ? '-' : String(data?.totalStudents ?? 0)}
          description="Basis data tabel profiles"
          icon={Users}
          iconBg="bg-[#EFEDFD]"
          iconColor="text-[#6C5CE7]"
        />

        <StatCard
          label="Total Tutor Terdaftar"
          value={loading ? '-' : String(data?.totalTutors ?? 0)}
          description="Tutor dengan profil aktif"
          icon={GraduationCap}
          iconBg="bg-[#E6F6EE]"
          iconColor="text-[#45B97C]"
        />

        <StatCard
          label="Booking Aktif"
          value="0"
          description="Sesi privat berjalan"
          icon={Calendar}
          iconBg="bg-[#FDF4E2]"
          iconColor="text-[#B87A14]"
          badge="Phase 2"
        />

        <StatCard
          label="Pembayaran Tertunda"
          value="0"
          description="Transaksi dalam proses"
          icon={CreditCard}
          iconBg="bg-[#EFEDFD]"
          iconColor="text-[#6C5CE7]"
          badge="Phase 2"
        />
      </div>

      {/* Table: Recent Users */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-[#6C5CE7]" />
            <h3 className="font-bold text-base text-[#17181C]">Pengguna Terbaru Terdaftar</h3>
          </div>
          <span className="text-xs text-muted-foreground">Kueri realtime Supabase</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#6C5CE7]" />
            <span className="text-xs">Memuat data pengguna...</span>
          </div>
        ) : (data?.recentUsers.length ?? 0) === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-xs">
            Belum ada data pengguna di database. Terapkan database seed di <code className="font-mono bg-black/5 px-1 py-0.5 rounded">supabase/seed.sql</code>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Peran</th>
                  <th className="py-2.5 px-3">Tanggal Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data?.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F4F5FB]/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">
                      {u.full_name || 'Tanpa Nama'}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFEDFD] text-[#6C5CE7]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {formatShortDate(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table: Student Assessment Data (Mega Admin Data View - Zero PDF Storage) */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#6C5CE7]" />
            <div>
              <h3 className="font-bold text-base text-[#17181C]">
                Data Hasil Asesmen Siswa (Mega Admin)
              </h3>
              <p className="text-xs text-muted-foreground">
                Akses langsung data profil dan dimensi belajar tanpa membebani penyimpanan berkas PDF.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFEDFD] text-[#6C5CE7] text-[11px] font-bold self-start sm:self-center">
            <Database className="w-3 h-3" />
            <span>Mode Data Murni</span>
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#6C5CE7]" />
            <span className="text-xs">Memuat data asesmen siswa...</span>
          </div>
        ) : studentAssessments.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-xs space-y-1">
            <p className="font-semibold text-foreground">Belum ada hasil asesmen siswa yang selesai.</p>
            <p>Data akan otomatis muncul di sini begitu siswa menyelesaikan tes kepribadian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Tipe Kepribadian</th>
                  <th className="py-2.5 px-3">Skor Rata-rata</th>
                  <th className="py-2.5 px-3">Tanggal Selesai</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {studentAssessments.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F4F5FB]/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">
                      {item.studentName}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{item.studentEmail}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#17181C]">{item.personalityTypeName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#EFEDFD] text-[#6C5CE7]">
                          {item.personalityTypeCode}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#6C5CE7]">
                      {item.overallScore}%
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {formatReportDate(item.completedAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedResultId(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F5FB] hover:bg-[#EFEDFD] text-[#6C5CE7] hover:text-[#5243D6] font-bold text-xs transition-colors min-h-[44px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Data Profil</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mega Admin Student Assessment Modal */}
      <AdminStudentAssessmentModal
        resultId={selectedResultId}
        onClose={() => setSelectedResultId(null)}
      />
    </AppShell>
  )
}
