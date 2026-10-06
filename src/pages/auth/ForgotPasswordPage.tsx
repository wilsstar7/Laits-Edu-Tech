import { Link } from 'react-router'
import { Layers } from 'lucide-react'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F4F5FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-[#17181C] tracking-tight">
            LAITS <span className="text-[#6C5CE7]">EDU</span>
          </span>
        </Link>

        <div className="surface-card p-6 sm:p-8 bg-white border border-border shadow-sm">
          <div className="mb-6 text-center space-y-1">
            <h1 className="text-xl font-extrabold text-[#17181C] tracking-tight">
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
