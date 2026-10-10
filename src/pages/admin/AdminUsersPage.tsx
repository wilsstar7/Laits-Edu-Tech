import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  GraduationCap,
  UserCheck,
  Shield,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  Eye,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Award,
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
import { useAuth } from '@/hooks/useAuth'
import {
  adminService,
  type UserListItem,
  type UserCounts,
  type UserDetail,
} from '@/services/adminService'
import { AdminCreateTutorModal } from '@/components/admin/AdminCreateTutorModal'
import { AdminStudentAssessmentModal } from '@/components/admin/AdminStudentAssessmentModal'
import { formatShortDate, formatCurrency } from '@/utils/format'
import type { UserRole } from '@/types'

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; badgeClass: string; bgSoft: string; textClass: string }
> = {
  student: {
    label: 'Siswa',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
    bgSoft: 'bg-blue-100 dark:bg-blue-900/50',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  tutor: {
    label: 'Tutor',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900',
    bgSoft: 'bg-purple-100 dark:bg-purple-900/50',
    textClass: 'text-purple-700 dark:text-purple-300',
  },
  admin: {
    label: 'Admin',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    bgSoft: 'bg-amber-100 dark:bg-amber-900/50',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  super_admin: {
    label: 'Super Admin',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    bgSoft: 'bg-emerald-100 dark:bg-emerald-900/50',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
}

export function AdminUsersPage() {
  const { user: currentUser, role: currentUserRole } = useAuth()

  const [users, setUsers] = useState<UserListItem[]>([])
  const [counts, setCounts] = useState<UserCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 15

  const [isCreateTutorOpen, setIsCreateTutorOpen] = useState(false)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)

  const [detailUser, setDetailUser] = useState<UserListItem | null>(null)
  const [userDetailData, setUserDetailData] = useState<UserDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [roleModalUser, setRoleModalUser] = useState<UserListItem | null>(null)
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('student')
  const [updatingRole, setUpdatingRole] = useState(false)

  const isSuperAdmin = currentUserRole === 'super_admin'

  const loadData = useCallback(async () => {
    try {
      const [countsData, usersData] = await Promise.all([
        adminService.getUserCounts().catch(() => null),
        adminService.getUsers({
          role: roleFilter,
          search: search.trim() || undefined,
          page,
          pageSize,
          callerRole: currentUserRole,
        }),
      ])

      if (countsData) setCounts(countsData)
      setUsers(usersData.users)
      setTotal(usersData.total)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data pengguna.'
      toast.error(msg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [roleFilter, search, page, currentUserRole])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
  }

  const handleOpenDetail = async (user: UserListItem) => {
    setDetailUser(user)
    setLoadingDetail(true)
    try {
      const detail = await adminService.getUserDetail(user.id)
      setUserDetailData(detail)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat rincian pengguna.'
      toast.error(msg)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleOpenRoleModal = (user: UserListItem) => {
    if (user.id === currentUser?.id) {
      toast.error('Anda tidak dapat mengubah peran akun Anda sendiri.')
      return
    }
    if (!isSuperAdmin && (user.role === 'super_admin' || user.role === 'admin')) {
      toast.error('Akses ditolak: Anda tidak memiliki wewenang untuk mengubah peran administrator.')
      return
    }
    setRoleModalUser(user)
    setSelectedNewRole(user.role)
  }

  const handleConfirmRoleChange = async () => {
    if (!roleModalUser) return
    if (roleModalUser.role === selectedNewRole) {
      setRoleModalUser(null)
      return
    }

    if (!isSuperAdmin && (roleModalUser.role === 'super_admin' || roleModalUser.role === 'admin')) {
      toast.error('Akses ditolak: Anda tidak memiliki wewenang untuk mengubah peran administrator.')
      setRoleModalUser(null)
      return
    }

    if (!isSuperAdmin && (selectedNewRole === 'super_admin' || selectedNewRole === 'admin')) {
      toast.error('Akses ditolak: Hanya Super Admin yang berhak menetapkan peran administrator.')
      return
    }

    setUpdatingRole(true)
    try {
      await adminService.updateUserRole(roleModalUser.id, selectedNewRole, {
        targetUserRole: roleModalUser.role,
        callerRole: currentUserRole,
      })
      toast.success(
        `Peran pengguna ${roleModalUser.full_name} berhasil diperbarui menjadi ${ROLE_CONFIG[selectedNewRole].label}.`
      )
      setRoleModalUser(null)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah peran pengguna.'
      toast.error(msg)
    } finally {
      setUpdatingRole(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize) || 1

  const roleTabs = isSuperAdmin
    ? ([
        { id: 'all', label: 'Semua' },
        { id: 'student', label: 'Siswa' },
        { id: 'tutor', label: 'Tutor' },
        { id: 'admin', label: 'Admin' },
        { id: 'super_admin', label: 'Super Admin' },
      ] as const)
    : ([
        { id: 'all', label: 'Semua' },
        { id: 'student', label: 'Siswa' },
        { id: 'tutor', label: 'Tutor' },
      ] as const)

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Kelola Pengguna"
          subtitle="Pantau seluruh akun terdaftar, kelola hak akses dan peran (RBAC), serta tinjau data profil platform."
          badge="Administrasi Sistem"
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
                onClick={() => setIsCreateTutorOpen(true)}
                className="min-h-[44px] gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Akun Tutor</span>
              </Button>
            </div>
          }
        />

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
          <StatCard
            label="Total Pengguna"
            value={
              counts
                ? (isSuperAdmin ? counts.total : counts.student + counts.tutor).toLocaleString('id-ID')
                : '...'
            }
            icon={Users}
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            iconColor="text-blue-600"
          />
          <StatCard
            label="Siswa Terdaftar"
            value={counts ? counts.student.toLocaleString('id-ID') : '...'}
            icon={GraduationCap}
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            iconColor="text-indigo-600"
          />
          <StatCard
            label="Mitra Tutor"
            value={counts ? counts.tutor.toLocaleString('id-ID') : '...'}
            icon={UserCheck}
            iconBg="bg-purple-50 dark:bg-purple-950/40"
            iconColor="text-purple-600"
          />
          {isSuperAdmin && (
            <StatCard
              label="Administrator"
              value={counts ? (counts.admin + counts.super_admin).toLocaleString('id-ID') : '...'}
              icon={Shield}
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
              iconColor="text-emerald-600"
            />
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9 pr-4 py-2 text-sm w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {roleTabs.map((tab) => {
                const isActive = roleFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setRoleFilter(tab.id)
                      setPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Pengguna</th>
                  <th className="py-3 px-4 font-semibold">Peran</th>
                  <th className="py-3 px-4 font-semibold">No. Telepon</th>
                  <th className="py-3 px-4 font-semibold">Terdaftar</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-9 h-9 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="w-32 h-4" />
                            <Skeleton className="w-44 h-3" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="w-16 h-5 rounded-full" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="w-24 h-4" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="w-20 h-4" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Skeleton className="w-24 h-8 ml-auto rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        Tidak ada pengguna ditemukan
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Coba sesuaikan kata kunci pencarian atau filter peran akun.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((item) => {
                    const isSelf = item.id === currentUser?.id
                    const isTargetAdmin = item.role === 'admin' || item.role === 'super_admin'
                    const canChangeRole =
                      !isSelf &&
                      (isSuperAdmin || (!isTargetAdmin && (item.role === 'student' || item.role === 'tutor')))
                    const roleInfo = ROLE_CONFIG[item.role] || ROLE_CONFIG.student
                    const initials = (item.full_name || 'U')
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${roleInfo.bgSoft} ${roleInfo.textClass} shrink-0`}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 dark:text-white truncate">
                                {item.full_name || 'Tanpa Nama'}
                                {isSelf && (
                                  <span className="ml-2 text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    Akun Anda
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{item.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`text-xs px-2.5 py-0.5 font-medium ${roleInfo.badgeClass}`}
                          >
                            {roleInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                          {item.phone || '-'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {formatShortDate(item.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetail(item)}
                              className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Detail</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRoleModal(item)}
                              disabled={!canChangeRole}
                              className="h-8 px-2.5 text-xs gap-1 border-slate-200 dark:border-slate-700"
                              title={
                                isSelf
                                  ? 'Tidak dapat mengubah peran sendiri'
                                  : !canChangeRole
                                  ? 'Hanya Super Admin yang berhak mengelola peran administrator'
                                  : 'Ubah Peran'
                              }
                            >
                              <Shield className="w-3.5 h-3.5 text-slate-500" />
                              <span className="hidden sm:inline">Peran</span>
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <div>
              Menampilkan {users.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(page * pageSize, total)} dari {total} pengguna
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-2">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || loading}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Rincian Profil Pengguna</DialogTitle>
            <DialogDescription>
              Informasi lengkap akun dan status data pengguna di sistem LMS.
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-xs text-slate-500">Memuat rincian akun...</p>
            </div>
          ) : detailUser && userDetailData ? (
            <div className="space-y-5 py-2">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                    ROLE_CONFIG[detailUser.role].bgSoft
                  } ${ROLE_CONFIG[detailUser.role].textClass} shrink-0`}
                >
                  {(detailUser.full_name || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {detailUser.full_name || 'Tanpa Nama'}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`text-[11px] px-2 py-0.5 ${ROLE_CONFIG[detailUser.role].badgeClass}`}
                    >
                      {ROLE_CONFIG[detailUser.role].label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{detailUser.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{detailUser.phone || 'Belum diisi'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Bergabung: {formatShortDate(detailUser.created_at)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      ID: {detailUser.id}
                    </div>
                  </div>
                </div>
              </div>

              {detailUser.role === 'student' && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    Status Asesmen Kepribadian
                  </h5>
                  {userDetailData.studentAssessments &&
                  userDetailData.studentAssessments.length > 0 ? (
                    <div className="space-y-2">
                      {userDetailData.studentAssessments.map((res) => (
                        <div
                          key={res.id}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {res.personalityTypeName}{' '}
                              <span className="text-slate-400">({res.personalityTypeCode})</span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Skor Rata-rata: {res.overallScore}% • Selesai: {formatShortDate(res.completedAt)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 gap-1"
                            onClick={() => setSelectedAssessmentId(res.id)}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lihat Profil Asesmen</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500">
                      Siswa belum menyelesaikan tes asesmen kepribadian.
                    </div>
                  )}
                </div>
              )}

              {detailUser.role === 'tutor' && userDetailData.tutorProfile && (
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    Profil Pengajar Tutor
                  </h5>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Tarif per Jam:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatCurrency(userDetailData.tutorProfile.hourly_rate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Rating & Ulasan:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          ★ {userDetailData.tutorProfile.rating_avg.toFixed(1)} (
                          {userDetailData.tutorProfile.rating_count} ulasan)
                        </span>
                      </div>
                    </div>
                    {userDetailData.tutorProfile.education && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Pendidikan:</span>
                        <span className="text-slate-800 dark:text-slate-200">
                          {userDetailData.tutorProfile.education}
                        </span>
                      </div>
                    )}
                    {userDetailData.tutorProfile.bio && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Biografi:</span>
                        <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-3">
                          {userDetailData.tutorProfile.bio}
                        </p>
                      </div>
                    )}
                    {userDetailData.tutorProfile.subjects &&
                      userDetailData.tutorProfile.subjects.length > 0 && (
                        <div>
                          <span className="text-slate-400 block text-[10px] mb-1">
                            Mata Pelajaran yang Diajarkan:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {userDetailData.tutorProfile.subjects.map((sub, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300"
                              >
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailUser(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!roleModalUser} onOpenChange={(open) => !open && setRoleModalUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Peran Pengguna</DialogTitle>
            <DialogDescription>
              Atur hak akses otorisasi sistem untuk akun {roleModalUser?.full_name}.
            </DialogDescription>
          </DialogHeader>

          {roleModalUser && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {roleModalUser.full_name}
                </p>
                <p className="text-slate-500">{roleModalUser.email}</p>
                <div className="pt-1 flex items-center gap-1.5">
                  <span className="text-slate-400">Peran saat ini:</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${ROLE_CONFIG[roleModalUser.role].badgeClass}`}
                  >
                    {ROLE_CONFIG[roleModalUser.role].label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Peran Baru:
                </label>
                <div className="space-y-1.5">
                  {(
                    [
                      {
                        role: 'student',
                        label: 'Siswa (Student)',
                        desc: 'Akses penuh ke modul belajar, asesmen kepribadian, booking tutor.',
                      },
                      {
                        role: 'tutor',
                        label: 'Tutor',
                        desc: 'Akses ke dashboard pengajar, jadwal mengajar, dan materi kursus.',
                      },
                      {
                        role: 'admin',
                        label: 'Admin',
                        desc: 'Kelola kursus, ulasan, verifikasi pembayaran, dan data pengguna.',
                        superOnly: true,
                      },
                      {
                        role: 'super_admin',
                        label: 'Super Admin',
                        desc: 'Hak akses tertinggi ke konfigurasi teknis dan seluruh hak admin.',
                        superOnly: true,
                      },
                    ] as const
                  ).map((option) => {
                    const isAllowed =
                      currentUserRole === 'super_admin' || !('superOnly' in option && option.superOnly)

                    return (
                      <label
                        key={option.role}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedNewRole === option.role
                            ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        } ${!isAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name="targetRole"
                          value={option.role}
                          checked={selectedNewRole === option.role}
                          disabled={!isAllowed}
                          onChange={() => setSelectedNewRole(option.role as UserRole)}
                          className="mt-0.5 text-brand-primary focus:ring-brand-primary"
                        />
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-900 dark:text-white">{option.label}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{option.desc}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {currentUserRole !== 'super_admin' && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    Hanya Super Admin yang berhak mempromosikan pengguna menjadi Admin atau Super Admin.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRoleModalUser(null)}
              disabled={updatingRole}
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmRoleChange}
              disabled={updatingRole || roleModalUser?.role === selectedNewRole}
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              {updatingRole ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Memperbarui...</span>
                </>
              ) : (
                'Simpan Peran'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminCreateTutorModal
        isOpen={isCreateTutorOpen}
        onClose={() => setIsCreateTutorOpen(false)}
        onSuccess={() => {
          setIsCreateTutorOpen(false)
          loadData()
        }}
      />

      <AdminStudentAssessmentModal
        resultId={selectedAssessmentId}
        onClose={() => setSelectedAssessmentId(null)}
      />
    </AppShell>
  )
}
