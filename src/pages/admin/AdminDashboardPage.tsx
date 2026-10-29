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
  UserPlus,
  ClipboardList,
  ArrowRight,
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
import { AdminCreateTutorModal } from '@/components/admin/AdminCreateTutorModal'
import { formatShortDate, formatReportDate } from '@/utils/format'
import { env } from '@/lib/env'
import { useAuth } from '@/hooks/useAuth'

export function AdminDashboardPage() {
  const { role } = useAuth()
  const [data, setData] = useState<AdminOverview | null>(null)
  const [studentAssessments, setStudentAssessments] = useState<AdminStudentAssessmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null)
  const [isCreateTutorOpen, setIsCreateTutorOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      try {
        if (env.isSupabaseConfigured) {
          const [overview, assessments] = await Promise.all([
            adminService.getOverview(role).catch(() => null),
            adminService.getStudentAssessments().catch(() => []),
          ])
          if (!cancelled) {
            if (overview) setData(overview)
            setStudentAssessments(assessments)
          }
        } else {
          if (!cancelled) {
            setData({ totalStudents: 0, totalTutors: 0, activeBookings: 0, pendingPayments: 0, recentUsers: [] })
            setStudentAssessments([])
          }
        }
      } catch {
        if (!cancelled) {
          setData({ totalStudents: 0, totalTutors: 0, activeBookings: 0, pendingPayments: 0, recentUsers: [] })
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
  }, [role])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      if (env.isSupabaseConfigured) {
        const [overview, assessments] = await Promise.all([
          adminService.getOverview(role).catch(() => null),
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
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsCreateTutorOpen(true)}
              className="inline-flex items-center justify-center flex-1 sm:flex-initial gap-2 px-4 py-2.5 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] active:scale-[0.98] transition-colors min-h-[44px] cursor-pointer"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Tambah Akun Tutor</span>
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-border text-foreground text-xs font-bold hover:bg-[#ECF0F7] transition-colors min-h-[44px] cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-5">
        <StatCard
          label="Total Siswa Terdaftar"
          value={loading ? '-' : String(data?.totalStudents ?? 0)}
          description="Basis data tabel profiles"
          icon={Users}
          iconBg="bg-[#E8ECF6]"
          iconColor="text-[#183058]"
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
          value={loading ? '-' : String(data?.activeBookings ?? 0)}
          description="Sesi privat berjalan"
          icon={Calendar}
          iconBg="bg-[#FDF4E2]"
          iconColor="text-[#B87A14]"
        />

        <StatCard
          label="Pembayaran Tertunda"
          value={loading ? '-' : String(data?.pendingPayments ?? 0)}
          description="Transaksi dalam proses"
          icon={CreditCard}
          iconBg="bg-[#E8ECF6]"
          iconColor="text-[#183058]"
        />
      </div>

      <section aria-label="Akses cepat manajemen" className="space-y-3">
        <h2 className="text-sm font-bold text-[#17181C]">Akses Cepat Manajemen</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
          <Link
            to="/admin/assessments"
            className="surface-card p-3.5 rounded-2xl bg-white border border-border hover:bg-[#ECF0F7] transition-colors min-h-[48px] flex items-center justify-between gap-3 text-xs font-bold text-[#17181C]"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <ClipboardList className="w-4 h-4 text-[#183058] shrink-0" />
              <span className="truncate">Kelola Soal &amp; Jenjang</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#676A78] shrink-0" />
          </Link>

          <Link
            to="/admin/courses"
            className="surface-card p-3.5 rounded-2xl bg-white border border-border hover:bg-[#ECF0F7] transition-colors min-h-[48px] flex items-center justify-between gap-3 text-xs font-bold text-[#17181C]"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Library className="w-4 h-4 text-[#183058] shrink-0" />
              <span className="truncate">Kelola Kursus</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#676A78] shrink-0" />
          </Link>

          <Link
            to="/admin/announcements"
            className="surface-card p-3.5 rounded-2xl bg-white border border-border hover:bg-[#ECF0F7] transition-colors min-h-[48px] flex items-center justify-between gap-3 text-xs font-bold text-[#17181C]"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Megaphone className="w-4 h-4 text-[#183058] shrink-0" />
              <span className="truncate">Pengumuman</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#676A78] shrink-0" />
          </Link>

          {role === 'super_admin' && (
            <Link
              to="/admin/payments"
              className="surface-card p-3.5 rounded-2xl bg-white border border-border hover:bg-[#ECF0F7] transition-colors min-h-[48px] flex items-center justify-between gap-3 text-xs font-bold text-[#17181C]"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <CreditCard className="w-4 h-4 text-[#183058] shrink-0" />
                <span className="truncate">Verifikasi Pembayaran</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#676A78] shrink-0" />
            </Link>
          )}

          <Link
            to="/admin/reviews"
            className="surface-card p-3.5 rounded-2xl bg-white border border-border hover:bg-[#ECF0F7] transition-colors min-h-[48px] flex items-center justify-between gap-3 text-xs font-bold text-[#17181C]"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Compass className="w-4 h-4 text-[#183058] shrink-0" />
              <span className="truncate">Moderasi Ulasan</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#676A78] shrink-0" />
          </Link>
        </div>
      </section>

      <div className="surface-card p-4 sm:p-6 space-y-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserCheck className="w-5 h-5 text-[#183058] shrink-0" />
            <h3 className="font-bold text-sm sm:text-base text-[#17181C]">
              Pengguna Terbaru Terdaftar
            </h3>
          </div>
          <Link
            to="/admin/users"
            className="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-[#183058] hover:underline"
          >
            <span>Kelola Semua Pengguna</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#183058]" />
            <span className="text-xs">Memuat data pengguna...</span>
          </div>
        ) : (data?.recentUsers.length ?? 0) === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-xs">
            Belum ada data pengguna di database. Terapkan database seed di{' '}
            <code className="font-mono bg-black/5 px-1 py-0.5 rounded">supabase/seed.sql</code>.
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-3">
              {data?.recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-xl bg-[#F4F6FA] border border-border/60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground break-words">
                        {u.full_name || 'Tanpa Nama'}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">{u.email}</p>
                    </div>
                    <span className="capitalize px-2 py-0.5 rounded text-xs font-bold bg-[#E8ECF6] text-[#183058] shrink-0">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Terdaftar: {formatShortDate(u.created_at)}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Peran</th>
                    <th className="py-2.5 px-3">Tanggal Dibuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data?.recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F4F6FA]/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {u.full_name || 'Tanpa Nama'}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className="capitalize px-2 py-0.5 rounded text-xs font-bold bg-[#E8ECF6] text-[#183058]">
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
          </>
        )}
      </div>

      <div className="surface-card p-4 sm:p-6 space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/60">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <Compass className="w-5 h-5 text-[#183058] shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[#17181C]">
                Data Hasil Asesmen Siswa
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Akses langsung data profil dan dimensi belajar tanpa membebani penyimpanan berkas PDF.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E8ECF6] text-[#183058] text-xs font-bold self-start sm:self-center shrink-0">
            <Database className="w-3.5 h-3.5" />
            <span>Mode Data Murni</span>
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#183058]" />
            <span className="text-xs">Memuat data asesmen siswa...</span>
          </div>
        ) : studentAssessments.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-xs space-y-1">
            <p className="font-semibold text-foreground">Belum ada hasil asesmen siswa yang selesai.</p>
            <p>Data akan otomatis muncul di sini begitu siswa menyelesaikan tes kepribadian.</p>
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-3">
              {studentAssessments.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#F4F6FA] border border-border/60 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground break-words">
                        {item.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">
                        {item.studentEmail}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-[#E8ECF6] text-[#183058] shrink-0">
                      {item.overallScore}%
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#17181C]">{item.personalityTypeName}</span>
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-white text-[#183058]">
                        {item.personalityTypeCode}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatReportDate(item.completedAt)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedResultId(item.id)}
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-border hover:bg-[#E8ECF6] text-[#183058] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span>Lihat Data Profil</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-semibold">
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
                    <tr key={item.id} className="hover:bg-[#F4F6FA]/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {item.studentName}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{item.studentEmail}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#17181C]">{item.personalityTypeName}</span>
                          <span className="px-1.5 py-0.5 rounded text-xs font-extrabold bg-[#E8ECF6] text-[#183058]">
                            {item.personalityTypeCode}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#183058]">
                        {item.overallScore}%
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {formatReportDate(item.completedAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedResultId(item.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F4F6FA] hover:bg-[#E8ECF6] text-[#183058] hover:text-[#102342] font-bold text-xs transition-colors min-h-[44px] cursor-pointer"
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
          </>
        )}
      </div>

      <AdminStudentAssessmentModal
        resultId={selectedResultId}
        onClose={() => setSelectedResultId(null)}
      />

      <AdminCreateTutorModal
        isOpen={isCreateTutorOpen}
        onClose={() => setIsCreateTutorOpen(false)}
        onSuccess={handleRefresh}
      />
    </AppShell>
  )
}
