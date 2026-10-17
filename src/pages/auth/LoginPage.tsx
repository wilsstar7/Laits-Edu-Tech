import { Link, Navigate } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'
import { env } from '@/lib/env'

export function LoginPage() {
  const { session, role } = useAuth()

  if (session && role) {
    if (role === 'admin' || role === 'super_admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (role === 'tutor') {
      return <Navigate to="/tutor/dashboard" replace />
    } else {
      return <Navigate to="/student/dashboard" replace />
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <Link to="/" className="flex flex-col items-center justify-center gap-2 mb-6 group">
          <img
            src="/logo-mark.png"
            alt="Logo Persona Academy"
            className="w-16 h-16 object-contain drop-shadow-xs transition-transform group-hover:scale-[1.02]"
          />
          <div className="text-center">
            <span className="font-extrabold text-2xl text-[#0F1D33] tracking-tight block leading-none">
              PERSONA <span className="text-[#183058]">ACADEMY</span>
            </span>
            <span className="text-[10px] font-semibold tracking-[0.16em] text-[#676A78] uppercase mt-1.5 block">
              Learning by Intelligence Type
            </span>
          </div>
        </Link>

        {/* Card */}
        <div className="surface-card p-6 sm:p-8 bg-white border border-border shadow-sm">
          <div className="mb-6 text-center space-y-1">
            <h1 className="text-xl font-extrabold text-[#0F1D33] tracking-tight">
              Masuk ke Akun Anda
            </h1>
            <p className="text-xs text-[#676A78]">
              Gunakan email dan kata sandi akun terdaftar Anda
            </p>
          </div>

          {!env.isSupabaseConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-[#FDF4E2] border border-[#F2B84B]/40 text-xs text-[#92580E] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#F2B84B] shrink-0 mt-0.5" />
              <span>
                Supabase belum terhubung di file <code className="font-mono bg-black/5 px-1 rounded">.env</code>. Pratinjau navigasi lokal aktif.
              </span>
            </div>
          )}

          <LoginForm />

          <div className="mt-6 pt-5 border-t border-border/60 text-center text-xs text-[#676A78]">
            Belum memiliki akun siswa?{' '}
            <Link to="/register" className="font-bold text-[#183058] hover:underline">
              Daftar Sekarang
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
