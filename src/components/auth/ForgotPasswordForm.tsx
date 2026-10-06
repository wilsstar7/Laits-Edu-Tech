import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validation'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/utils/errors'

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sentEmail, setSentEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordValues) => {
    setLoading(true)
    try {
      await authService.requestPasswordReset(values.email)
      setSentEmail(values.email)
      toast.success('Permintaan reset kata sandi telah dikirim.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal mengirim email reset password.'))
    } finally {
      setLoading(false)
    }
  }

  if (sentEmail) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#E6F6EE] text-[#45B97C] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-[#17181C]">Periksa Email Anda</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Jika alamat <strong className="text-foreground">{sentEmail}</strong> terdaftar, kami telah mengirimkan instruksi untuk membuat kata sandi baru.
          </p>
        </div>
        <div className="pt-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#6C5CE7] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="forgot-email" className="block text-xs font-bold text-foreground">
          Alamat Email Terdaftar
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="forgot-email"
            type="email"
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
          <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
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
              <span>Mengirim Tautan...</span>
            </>
          ) : (
            <span>Kirim Instruksi Reset</span>
          )}
        </button>
      </div>

      <div className="text-center pt-2">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
      </div>
    </form>
  )
}
