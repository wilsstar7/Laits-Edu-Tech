import { Link } from 'react-router'
import { Layers } from 'lucide-react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F4F5FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-[#17181C] tracking-tight">
            LAITS <span className="text-[#6C5CE7]">EDU</span>
          </span>
        </Link>

        {/* Form Card */}
        <div className="surface-card p-6 sm:p-10 bg-white border border-border shadow-sm">
          <div className="mb-8 text-center space-y-1 pb-4 border-b border-border/60">
            <h1 className="text-2xl font-extrabold text-[#17181C] tracking-tight">
              Pendaftaran Siswa Baru
            </h1>
            <p className="text-xs sm:text-sm text-[#676A78]">
              Lengkapi informasi akun dan data pendidikan untuk memulai bimbingan belajar
            </p>
          </div>

          <RegisterForm />

          <div className="mt-8 pt-5 border-t border-border/60 text-center text-xs text-[#676A78]">
            Sudah memiliki akun terdaftar?{' '}
            <Link to="/login" className="font-bold text-[#6C5CE7] hover:underline">
              Masuk di Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
