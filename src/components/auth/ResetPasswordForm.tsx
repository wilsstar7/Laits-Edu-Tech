import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/utils/errors'
import { useAuth } from '@/hooks/useAuth'

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { clearPasswordRecovery } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ResetPasswordValues) => {
    setLoading(true)
    try {
      await authService.updatePassword(values.password)
      clearPasswordRecovery()
      toast.success('Kata sandi berhasil diperbarui! Silakan masuk kembali.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal memperbarui kata sandi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* New Password */}
      <div className="space-y-1.5">
        <label htmlFor="reset-new-password" className="block text-xs font-bold text-foreground">
          Kata Sandi Baru
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="reset-new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 karakter (huruf & angka)"
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
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="reset-confirm-password" className="block text-xs font-bold text-foreground">
          Konfirmasi Kata Sandi Baru
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="reset-confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Ketik ulang kata sandi baru"
            disabled={loading}
            {...register('confirmPassword')}
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-sm text-foreground placeholder:text-muted-foreground/60 transition-all min-h-[44px] ${
              errors.confirmPassword
                ? 'border-destructive focus:border-destructive ring-1 ring-destructive/20'
                : 'border-border focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/15'
            }`}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-destructive mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#6C5CE7] text-white text-sm font-bold shadow-lg shadow-[#6C5CE7]/30 hover:bg-[#5243D6] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-h-[44px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan Kata Sandi...</span>
            </>
          ) : (
            <span>Simpan Kata Sandi Baru</span>
          )}
        </button>
      </div>
    </form>
  )
}
