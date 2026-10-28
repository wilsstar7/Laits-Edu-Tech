import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Calendar,
  School,
  MapPin,
  Phone,
  ShieldCheck,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { registerSchema, type RegisterValues } from '@/lib/validation'
import { GRADE_OPTIONS, GENDER_OPTIONS } from '@/lib/constants'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/utils/errors'
import { todayIsoDate } from '@/utils/format'
import { env } from '@/lib/env'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [verificationNeeded, setVerificationNeeded] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      school: '',
      grade: '10',
      city: '',
      parentName: '',
      parentPhone: '',
    },
  })

  const onSubmit = async (values: RegisterValues) => {
    setLoading(true)
    try {
      const result = await authService.signUp({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        school: values.school,
        grade: values.grade,
        city: values.city,
        parentName: values.parentName,
        parentPhone: values.parentPhone,
      })

      if (result.needsEmailVerification) {
        setVerificationNeeded(values.email)
        toast.success('Pendaftaran berhasil! Silakan cek kotak masuk email Anda.')
      } else {
        toast.success('Pendaftaran berhasil! Selamat datang di ZEINBOX.')
        navigate('/student/dashboard', { replace: true })
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Pendaftaran gagal. Silakan periksa kembali data Anda.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    try {
      await authService.signInWithGoogle()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Pendaftaran dengan Google gagal.'))
      setGoogleLoading(false)
    }
  }

  if (verificationNeeded) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#E6F6EE] text-[#45B97C] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#17181C]">Verifikasi Email Anda</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Kami telah mengirimkan tautan konfirmasi pendaftaran ke alamat{' '}
            <strong className="text-foreground">{verificationNeeded}</strong>. Silakan periksa kotak masuk atau spam email Anda.
          </p>
        </div>
        <div className="pt-4 flex flex-col gap-2.5 max-w-xs mx-auto">
          <Link
            to="/login"
            className="w-full py-2.5 px-4 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342] transition-colors flex items-center justify-center gap-2 min-h-[42px]"
          >
            <span>Sudah Verifikasi? Masuk Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={async () => {
              try {
                await authService.resendVerificationEmail(verificationNeeded)
                toast.success('Tautan verifikasi telah dikirim ulang.')
              } catch (err) {
                toast.error(getErrorMessage(err, 'Gagal mengirim ulang email verifikasi.'))
              }
            }}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground py-2"
          >
            Kirim ulang email verifikasi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Google Sign Up */}
      {env.isGoogleOAuthEnabled && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 rounded-xl bg-white border border-border text-foreground text-sm font-semibold hover:bg-[#ECF0F7] shadow-xs transition-colors flex items-center justify-center gap-2.5 min-h-[46px]"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#183058]" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Daftar Cepat dengan Google</span>
          </button>

          <div className="relative flex items-center justify-center pt-2">
            <div className="w-full border-t border-border/80" />
            <span className="bg-white px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider absolute">
              atau daftar manual dengan formulir
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* SECTION 1: Akun & Keamanan */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-border/60">
            <ShieldCheck className="w-4 h-4 text-[#183058]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Informasi Akun Siswa
            </h3>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="reg-fullname" className="block text-xs font-bold text-foreground">
              Nama Lengkap <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <input
                id="reg-fullname"
                type="text"
                placeholder="Contoh: Muhammad Fatih"
                disabled={loading || googleLoading}
                {...register('fullName')}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 transition-all min-h-[44px] ${
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

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="block text-xs font-bold text-foreground">
              Email Siswa / Wali <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="fatih@email.com"
                disabled={loading || googleLoading}
                {...register('email')}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 transition-all min-h-[44px] ${
                  errors.email
                    ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                    : 'border-border focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Passwords (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="block text-xs font-bold text-foreground">
                Kata Sandi <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 karakter (huruf & angka)"
                  disabled={loading || googleLoading}
                  {...register('password')}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 transition-all min-h-[44px] ${
                    errors.password
                      ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                      : 'border-border focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-foreground">
                Konfirmasi Kata Sandi <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ketik ulang kata sandi"
                  disabled={loading || googleLoading}
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 transition-all min-h-[44px] ${
                    errors.confirmPassword
                      ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                      : 'border-border focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Data Pendidikan Siswa */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-1 border-b border-border/60">
            <School className="w-4 h-4 text-[#183058]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Data Pendidikan & Kontak
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label htmlFor="reg-dob" className="block text-xs font-bold text-foreground">
                Tanggal Lahir <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="reg-dob"
                  type="date"
                  max={todayIsoDate()}
                  disabled={loading || googleLoading}
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
              <label htmlFor="reg-gender" className="block text-xs font-bold text-foreground">
                Jenis Kelamin
              </label>
              <select
                id="reg-gender"
                disabled={loading || googleLoading}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grade / Kelas */}
            <div className="space-y-1.5">
              <label htmlFor="reg-grade" className="block text-xs font-bold text-foreground">
                Tingkat / Kelas <span className="text-destructive">*</span>
              </label>
              <select
                id="reg-grade"
                disabled={loading || googleLoading}
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
              <label htmlFor="reg-school" className="block text-xs font-bold text-foreground">
                Asal Sekolah
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <School className="w-4 h-4" />
                </div>
                <input
                  id="reg-school"
                  type="text"
                  placeholder="Contoh: SMA Negeri 1 Jakarta"
                  disabled={loading || googleLoading}
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
            <label htmlFor="reg-city" className="block text-xs font-bold text-foreground">
              Kota Domisili
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="reg-city"
                type="text"
                placeholder="Contoh: Jakarta Selatan"
                disabled={loading || googleLoading}
                {...register('city')}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15 transition-all min-h-[44px]"
              />
            </div>
            {errors.city && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* Parent Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="reg-parent-name" className="block text-xs font-bold text-foreground">
                Nama Orang Tua / Wali
              </label>
              <input
                id="reg-parent-name"
                type="text"
                placeholder="Contoh: Bapak H. Suryono"
                disabled={loading || googleLoading}
                {...register('parentName')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#183058] focus:ring-2 focus:ring-[#183058]/15 transition-all min-h-[44px]"
              />
              {errors.parentName && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.parentName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-parent-phone" className="block text-xs font-bold text-foreground">
                Nomor Telepon / WhatsApp Orang Tua
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="reg-parent-phone"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  disabled={loading || googleLoading}
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

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#183058] text-white text-sm font-bold shadow-lg shadow-[#183058]/30 hover:bg-[#102342] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[46px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mendaftarkan Akun Siswa...</span>
              </>
            ) : (
              <span>Daftar Sebagai Siswa</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
