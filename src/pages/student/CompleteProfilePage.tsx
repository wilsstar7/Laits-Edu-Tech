import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  User,
  Phone,
  Calendar,
  School,
  MapPin,
  GraduationCap,
  Sparkles,
  Loader2,
  LogOut,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  studentProfileSchema,
  type StudentProfileValues,
} from '@/lib/validation'
import { GRADE_OPTIONS, GENDER_OPTIONS } from '@/lib/constants'
import { profileService } from '@/services/profileService'
import { studentService } from '@/services/studentService'
import { getErrorMessage } from '@/utils/errors'
import { todayIsoDate } from '@/utils/format'
import type { Gender } from '@/types'

export function CompleteProfilePage() {
  const { profile, account, signOut, updateAccount } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentProfileValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
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

  const onSubmit = async (values: StudentProfileValues) => {
    if (!profile) return
    setSubmitting(true)
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

      toast.success('Profil siswa berhasil disimpan! Selamat datang di ZEINBOX.')
      navigate('/student/dashboard', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menyimpan data profil. Silakan periksa kembali.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Brand */}
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <img
            src="/logo-mark.png"
            alt="Logo ZEINBOX"
            className="w-14 h-14 object-contain drop-shadow-xs"
          />
          <div className="text-center">
            <span className="font-extrabold text-2xl text-[#0F1D33] tracking-tight block leading-none">
              ZEINBOX
            </span>
            <span className="text-[10px] font-semibold tracking-[0.16em] text-[#676A78] uppercase mt-1.5 block">
              Where Every Mind Grows
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="surface-card p-6 sm:p-10 bg-white border border-border shadow-sm">
          {/* Header */}
          <div className="mb-6 space-y-2 pb-5 border-b border-border/60">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8ECF6] text-[#183058] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Langkah Terakhir Pendaftaran Siswa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F1D33] tracking-tight">
              Lengkapi Profil Siswa Baru
            </h1>
            <p className="text-xs sm:text-sm text-[#676A78] leading-relaxed">
              Akun Anda{' '}
              <strong className="text-foreground">{profile?.email}</strong> telah terhubung melalui
              Google. Mohon lengkapi informasi akademik berikut untuk memetakan kurikulum dan bimbingan yang tepat.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* 1. Data Diri Siswa */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <GraduationCap className="w-4 h-4 text-[#183058]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Identitas Siswa
                </h3>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="comp-fullname" className="block text-xs font-bold text-foreground">
                  Nama Lengkap Siswa <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="comp-fullname"
                    type="text"
                    placeholder="Nama lengkap siswa"
                    disabled={submitting}
                    {...register('fullName')}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground transition-all min-h-[44px] ${
                      errors.fullName
                        ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                        : 'border-border focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs font-medium text-destructive mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Phone / WA Siswa */}
              <div className="space-y-1.5">
                <label htmlFor="comp-phone" className="block text-xs font-bold text-foreground">
                  Nomor WhatsApp Siswa (Opsional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="comp-phone"
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    disabled={submitting}
                    {...register('phone')}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground transition-all min-h-[44px] ${
                      errors.phone
                        ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                        : 'border-border focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs font-medium text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label htmlFor="comp-dob" className="block text-xs font-bold text-foreground">
                    Tanggal Lahir <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      id="comp-dob"
                      type="date"
                      max={todayIsoDate()}
                      disabled={submitting}
                      {...register('dateOfBirth')}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground transition-all min-h-[44px] ${
                        errors.dateOfBirth
                          ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                          : 'border-border focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15'
                      }`}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="text-xs font-medium text-destructive mt-1">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label htmlFor="comp-gender" className="block text-xs font-bold text-foreground">
                    Jenis Kelamin
                  </label>
                  <select
                    id="comp-gender"
                    disabled={submitting}
                    {...register('gender')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15 transition-all min-h-[44px]"
                  >
                    <option value="">Pilih jenis kelamin (opsional)</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="text-xs font-medium text-destructive mt-1">{errors.gender.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Informasi Akademik & Sekolah */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <School className="w-4 h-4 text-[#183058]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Informasi Akademik & Sekolah
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Grade / Kelas */}
                <div className="space-y-1.5">
                  <label htmlFor="comp-grade" className="block text-xs font-bold text-foreground">
                    Tingkat / Jenjang Kelas <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="comp-grade"
                    disabled={submitting}
                    {...register('grade')}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground transition-all min-h-[44px] ${
                      errors.grade
                        ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                        : 'border-border focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15'
                    }`}
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label} ({g.group})
                      </option>
                    ))}
                  </select>
                  {errors.grade && (
                    <p className="text-xs font-medium text-destructive mt-1">{errors.grade.message}</p>
                  )}
                </div>

                {/* School */}
                <div className="space-y-1.5">
                  <label htmlFor="comp-school" className="block text-xs font-bold text-foreground">
                    Asal Sekolah
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <School className="w-4 h-4" />
                    </div>
                    <input
                      id="comp-school"
                      type="text"
                      placeholder="Contoh: SMA Negeri 1 Jakarta"
                      disabled={submitting}
                      {...register('school')}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15 transition-all min-h-[44px]"
                    />
                  </div>
                  {errors.school && (
                    <p className="text-xs font-medium text-destructive mt-1">{errors.school.message}</p>
                  )}
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label htmlFor="comp-city" className="block text-xs font-bold text-foreground">
                  Kota Domisili
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="comp-city"
                    type="text"
                    placeholder="Contoh: Jakarta Selatan"
                    disabled={submitting}
                    {...register('city')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15 transition-all min-h-[44px]"
                  />
                </div>
                {errors.city && (
                  <p className="text-xs font-medium text-destructive mt-1">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* 3. Kontak Wali */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <User className="w-4 h-4 text-[#183058]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Kontak Orang Tua / Wali
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="comp-parent-name" className="block text-xs font-bold text-foreground">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    id="comp-parent-name"
                    type="text"
                    placeholder="Contoh: Bapak H. Suryono"
                    disabled={submitting}
                    {...register('parentName')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15 transition-all min-h-[44px]"
                  />
                  {errors.parentName && (
                    <p className="text-xs font-medium text-destructive mt-1">{errors.parentName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="comp-parent-phone" className="block text-xs font-bold text-foreground">
                    Nomor WhatsApp Orang Tua
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="comp-parent-phone"
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      disabled={submitting}
                      {...register('parentPhone')}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 transition-all min-h-[44px] ${
                        errors.parentPhone
                          ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                          : 'border-border focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15'
                      }`}
                    />
                  </div>
                  {errors.parentPhone && (
                    <p className="text-xs font-medium text-destructive mt-1">{errors.parentPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#183058] text-white text-sm font-bold shadow-lg shadow-[#183058]/30 hover:bg-[#102342] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[46px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Profil...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan & Masuk ke Dashboard</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Bukan akun Anda? Keluar dan ganti akun</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
