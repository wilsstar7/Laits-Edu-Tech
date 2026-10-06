import { Link } from 'react-router'
import { Layers, AlertCircle } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { env } from '@/lib/env'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F4F5FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-[#17181C] tracking-tight">
            LAITS <span className="text-[#6C5CE7]">EDU</span>
          </span>
        </Link>

        {/* Card */}
        <div className="surface-card p-6 sm:p-8 bg-white border border-border shadow-sm">
          <div className="mb-6 text-center space-y-1">
            <h1 className="text-xl font-extrabold text-[#17181C] tracking-tight">
              Masuk ke Portal Siswa
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
            <Link to="/register" className="font-bold text-[#6C5CE7] hover:underline">
              Daftar Sekarang
            </Link>
          </div>
        </div>

        {/* Demo Credentials hint */}
        <div className="mt-5 p-3.5 rounded-xl bg-white border border-border text-center text-[11px] text-[#676A78]">
          <p className="font-bold text-[#17181C] mb-0.5">Informasi Akun Demo (Phase 1):</p>
          <p>
            Akun uji coba development tercantum di file <code className="font-mono text-[#6C5CE7]">supabase/seed.sql</code> dan README.
          </p>
        </div>
      </div>
    </div>
  )
}
