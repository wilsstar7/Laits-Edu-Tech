import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'
import { loginSchema, type LoginValues } from '@/lib/validation'
import { authService } from '@/services/authService'
import { profileService } from '@/services/profileService'
import { getErrorMessage } from '@/utils/errors'
import { env } from '@/lib/env'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginValues) => {
    setLoading(true)
    try {
      await authService.signIn(values.email, values.password)
      toast.success('Login berhasil! Selamat datang kembali.')

      // Always redirect directly to the role's dashboard upon login
      const { profile } = await profileService.getAccountBundle()

      if (profile.role === 'admin' || profile.role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (profile.role === 'tutor') {
        navigate('/tutor/dashboard', { replace: true })
      } else {
        navigate('/student/dashboard', { replace: true })
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login gagal. Periksa kembali email dan password Anda.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithGoogle()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login dengan Google gagal.'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-bold text-foreground">
          Alamat Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            disabled={loading}
            {...register('email')}
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 transition-all min-h-[44px] ${
              errors.email
                ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                : 'border-border focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-xs font-medium text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-xs font-bold text-foreground">
            Kata Sandi
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-[#6C5CE7] hover:underline"
          >
            Lupa Sandi?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={loading}
            {...register('password')}
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 transition-all min-h-[44px] ${
              errors.password
                ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                : 'border-border focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#6C5CE7] text-white text-sm font-bold shadow-lg shadow-[#6C5CE7]/30 hover:bg-[#5243D6] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[44px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses Masuk...</span>
            </>
          ) : (
            <span>Masuk ke Akun</span>
          )}
        </button>
      </div>

      {/* Google OAuth (if enabled in env) */}
      {env.isGoogleOAuthEnabled && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-border text-foreground text-sm font-semibold hover:bg-[#EEF0F8] transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
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
            <span>Masuk dengan Google</span>
          </button>
        </div>
      )}
    </form>
  )
}
