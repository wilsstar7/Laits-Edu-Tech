import { Link, Navigate } from 'react-router'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useAuth } from '@/hooks/useAuth'
import { studentNeedsOnboarding } from '@/utils/profileCompletion'

export function RegisterPage() {
  const { session, role, profile, account } = useAuth()

  if (session && role) {
    if (role === 'admin' || role === 'super_admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (role === 'tutor') {
      return <Navigate to="/tutor/dashboard" replace />
    } else {
      if (profile && studentNeedsOnboarding(profile, account?.studentProfile ?? null)) {
        return <Navigate to="/student/complete-profile" replace />
      }
      return <Navigate to="/student/dashboard" replace />
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Brand */}
        <Link to="/" className="flex flex-col items-center justify-center gap-2 mb-6 group">
          <img
            src="/logo-mark.png"
            alt="Logo ZEINBOX"
            className="w-16 h-16 object-contain drop-shadow-xs transition-transform group-hover:scale-[1.02]"
          />
          <div className="text-center">
            <span className="font-extrabold text-2xl text-[#0F1D33] tracking-tight block leading-none">
              ZEINBOX
            </span>
            <span className="text-[10px] font-semibold tracking-[0.16em] text-[#676A78] uppercase mt-1.5 block">
              Where Every Mind Grows
            </span>
          </div>
        </Link>

        {/* Form Card */}
        <div className="surface-card p-6 sm:p-10 bg-white border border-border shadow-sm">
          <div className="mb-8 text-center space-y-1 pb-4 border-b border-border/60">
            <h1 className="text-2xl font-extrabold text-[#0F1D33] tracking-tight">
              Pendaftaran Siswa Baru
            </h1>
            <p className="text-xs sm:text-sm text-[#676A78]">
              Daftar instan dengan akun Google atau lengkapi data formulir untuk memulai bimbingan belajar
            </p>
          </div>

          <RegisterForm />

          <div className="mt-8 pt-5 border-t border-border/60 text-center text-xs text-[#676A78]">
            Sudah memiliki akun terdaftar?{' '}
            <Link to="/login" className="font-bold text-[#183058] hover:underline">
              Masuk di Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
