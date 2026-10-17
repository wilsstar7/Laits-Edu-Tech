import { Link } from 'react-router'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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

        <div className="surface-card p-6 sm:p-8 bg-white border border-border shadow-sm">
          <div className="mb-6 text-center space-y-1">
            <h1 className="text-xl font-extrabold text-[#0F1D33] tracking-tight">
              Lupa Kata Sandi
            </h1>
            <p className="text-xs text-[#676A78]">
              Masukkan email akun Anda untuk menerima instruksi pemulihan kata sandi
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
