import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Phone,
  School,
  MapPin,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Save,
  Loader2,
  LogOut,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard'
import { useAuth } from '@/hooks/useAuth'
import {
  studentProfileSchema,
  changePasswordSchema,
  type StudentProfileValues,
  type ChangePasswordValues,
} from '@/lib/validation'
import { GRADE_OPTIONS, GENDER_OPTIONS } from '@/lib/constants'
import { profileService } from '@/services/profileService'
import { studentService } from '@/services/studentService'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/utils/errors'
import { todayIsoDate } from '@/utils/format'
import type { Gender } from '@/types'

export function StudentSettingsPage() {
  const { profile, account, role, signOut, updateAccount } = useAuth()
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<StudentProfileValues>({
    resolver: zodResolver(studentProfileSchema),
    values: {
      fullName: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      dateOfBirth: account?.studentProfile?.date_of_birth ?? '',
      gender: (account?.studentProfile?.gender ?? '') as Gender | '',
      school: account?.studentProfile?.school ?? '',
      grade: account?.studentProfile?.grade ?? '10',
      city: account?.studentProfile?.city ?? '',
      parentName: account?.studentProfile?.parent_name ?? '',
      parentPhone: account?.studentProfile?.parent_phone ?? '',
    },
  })

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSaveProfile = async (values: StudentProfileValues) => {
    if (!profile) return
    setProfileSaving(true)
    try {
      const updatedProfile = await profileService.updateAccountInfo(profile.id, {
        fullName: values.fullName,
        phone: values.phone ?? '',
      })

      const updatedStudent = await studentService.saveStudentProfile(profile.id, {
        dateOfBirth: values.dateOfBirth,
        gender: values.gender as Gender | '',
        school: values.school ?? '',
        grade: values.grade,
        city: values.city ?? '',
        parentName: values.parentName ?? '',
        parentPhone: values.parentPhone ?? '',
      })

      updateAccount((prev) => ({
        ...prev,
        profile: updatedProfile,
        studentProfile: updatedStudent,
      }))

      toast.success('Profil berhasil diperbarui!')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menyimpan perubahan profil.'))
    } finally {
      setProfileSaving(false)
    }
  }

  const onChangePassword = async (values: ChangePasswordValues) => {
    if (!profile?.email) return
    setPasswordSaving(true)
    try {
      await authService.changePassword(profile.email, values.currentPassword, values.newPassword)
      toast.success('Kata sandi berhasil diperbarui!')
      resetPasswordForm()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal memperbarui kata sandi.'))
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // handled
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Pengaturan Akun & Profil"
        subtitle="Kelola data identitas siswa, informasi wali murid, dan keamanan akun Anda."
      />

      {/* Completion Indicator */}
      {role === 'student' && <ProfileCompletionCard />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Info Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border/60">
              <div className="w-10 h-10 rounded-xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17181C]">Informasi Identitas & Sekolah</h3>
                <p className="text-xs text-muted-foreground">
                  Data ini digunakan oleh tim pengajar untuk menyesuaikan kurikulum belajar Anda.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile(onSaveProfile)} className="space-y-5" noValidate>
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="set-name" className="block text-xs font-bold text-foreground">
                    Nama Lengkap <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="set-name"
                      type="text"
                      disabled={profileSaving}
                      {...registerProfile('fullName')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15 transition-all min-h-[44px]"
                    />
                  </div>
                  {profileErrors.fullName && (
                    <p className="text-xs text-destructive mt-1">{profileErrors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="set-email" className="block text-xs font-bold text-foreground">
                    Alamat Email (Akun)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="set-email"
                      type="email"
                      value={profile?.email ?? ''}
                      readOnly
                      disabled
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border/60 bg-[#EEF0F8]/60 text-sm text-muted-foreground cursor-not-allowed min-h-[44px]"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Email terikat pada autentikasi akun.</p>
                </div>
              </div>

              {/* Phone & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="set-phone" className="block text-xs font-bold text-foreground">
                    Nomor WhatsApp Siswa
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="set-phone"
                      type="tel"
                      placeholder="081234567890"
                      disabled={profileSaving}
                      {...registerProfile('phone')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15 transition-all min-h-[44px]"
                    />
                  </div>
                  {profileErrors.phone && (
                    <p className="text-xs text-destructive mt-1">{profileErrors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="set-dob" className="block text-xs font-bold text-foreground">
                    Tanggal Lahir <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      id="set-dob"
                      type="date"
                      max={todayIsoDate()}
                      disabled={profileSaving}
                      {...registerProfile('dateOfBirth')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15 transition-all min-h-[44px]"
                    />
                  </div>
                  {profileErrors.dateOfBirth && (
                    <p className="text-xs text-destructive mt-1">{profileErrors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>

              {/* Gender & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="set-gender" className="block text-xs font-bold text-foreground">
                    Jenis Kelamin
                  </label>
                  <select
                    id="set-gender"
                    disabled={profileSaving}
                    {...registerProfile('gender')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15 transition-all min-h-[44px]"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="set-grade" className="block text-xs font-bold text-foreground">
                    Tingkat Kelas <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="set-grade"
                    disabled={profileSaving}
                    {...registerProfile('grade')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15 transition-all min-h-[44px]"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label} ({g.group})
                      </option>
                    ))}
                  </select>
                  {profileErrors.grade && (
                    <p className="text-xs text-destructive mt-1">{profileErrors.grade.message}</p>
                  )}
                </div>
              </div>

              {/* School & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="set-school" className="block text-xs font-bold text-foreground">
                    Asal Sekolah
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <School className="w-4 h-4" />
                    </div>
                    <input
                      id="set-school"
                      type="text"
                      placeholder="Nama Sekolah"
                      disabled={profileSaving}
                      {...registerProfile('school')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="set-city" className="block text-xs font-bold text-foreground">
                    Kota Domisili
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="set-city"
                      type="text"
                      placeholder="Kota Domisili"
                      disabled={profileSaving}
                      {...registerProfile('city')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15 transition-all min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div className="pt-2 border-t border-border/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Informasi Kontak Wali Murid
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="set-parent-name" className="block text-xs font-bold text-foreground">
                      Nama Orang Tua / Wali
                    </label>
                    <input
                      id="set-parent-name"
                      type="text"
                      placeholder="Nama Orang Tua"
                      disabled={profileSaving}
                      {...registerProfile('parentName')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15 transition-all min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="set-parent-phone" className="block text-xs font-bold text-foreground">
                      Nomor WhatsApp Orang Tua
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="set-parent-phone"
                        type="tel"
                        placeholder="081234567890"
                        disabled={profileSaving}
                        {...registerProfile('parentPhone')}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15 transition-all min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/25 hover:bg-[#5243D6] disabled:opacity-60 transition-all flex items-center gap-2 min-h-[42px]"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Perubahan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan Profil</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security, Role & Password */}
        <div className="lg:col-span-4 space-y-6">
          {/* RBAC Info Card (Read only role) */}
          <div className="surface-card p-6 bg-white space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Shield className="w-4 h-4 text-[#6C5CE7]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Peran & Otorisasi
              </h4>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Peran Terdaftar</span>
                <span className="capitalize font-bold text-xs px-2.5 py-1 rounded-md bg-[#EFEDFD] text-[#6C5CE7]">
                  {role ?? 'Student'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Peran sistem dilindungi oleh arsitektur Supabase RLS. Siswa tidak diizinkan mengubah hak akses secara mandiri.
              </p>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="surface-card p-6 bg-white space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Lock className="w-4 h-4 text-[#6C5CE7]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ganti Kata Sandi
              </h4>
            </div>

            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-3.5" noValidate>
              <div className="space-y-1">
                <label htmlFor="set-curr-pass" className="block text-xs font-bold text-foreground">
                  Kata Sandi Saat Ini
                </label>
                <div className="relative">
                  <input
                    id="set-curr-pass"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={passwordSaving}
                    {...registerPassword('currentPassword')}
                    className="w-full px-3.5 pr-10 py-2 rounded-xl border border-border bg-white text-xs text-foreground focus:border-[#6C5CE7] min-h-[40px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-[11px] text-destructive mt-0.5">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="set-new-pass" className="block text-xs font-bold text-foreground">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    id="set-new-pass"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Min. 8 karakter"
                    disabled={passwordSaving}
                    {...registerPassword('newPassword')}
                    className="w-full px-3.5 pr-10 py-2 rounded-xl border border-border bg-white text-xs text-foreground focus:border-[#6C5CE7] min-h-[40px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-[11px] text-destructive mt-0.5">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="set-conf-pass" className="block text-xs font-bold text-foreground">
                  Konfirmasi Sandi Baru
                </label>
                <input
                  id="set-conf-pass"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Ketik ulang sandi baru"
                  disabled={passwordSaving}
                  {...registerPassword('confirmPassword')}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-white text-xs text-foreground focus:border-[#6C5CE7] min-h-[40px]"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-[11px] text-destructive mt-0.5">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-foreground text-white text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 min-h-[40px]"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memperbarui Sandi...</span>
                  </>
                ) : (
                  <span>Perbarui Kata Sandi</span>
                )}
              </button>
            </form>
          </div>

          {/* Logout Action */}
          <div className="surface-card p-6 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sesi Masuk
            </h4>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FDECEC] text-[#E96A6A] hover:bg-[#E96A6A]/20 text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[40px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
