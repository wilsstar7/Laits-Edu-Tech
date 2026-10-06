import { Link } from 'react-router'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function UnauthorizedPage() {
  const { role } = useAuth()

  const homeUrl =
    role === 'admin' || role === 'super_admin'
      ? '/admin/dashboard'
      : role === 'tutor'
      ? '/tutor/dashboard'
      : '/student/dashboard'

  return (
    <div className="min-h-screen bg-[#F4F5FB] flex items-center justify-center p-4">
      <div className="surface-card p-8 sm:p-12 max-w-lg w-full text-center space-y-6 bg-white/95 backdrop-blur-md">
        <div className="w-16 h-16 rounded-3xl bg-[#FDECEC] text-[#E96A6A] flex items-center justify-center mx-auto shadow-md">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E96A6A]">
            Akses Ditolak (403)
          </span>
          <h1 className="text-2xl font-extrabold text-[#17181C]">
            Anda Tidak Memiliki Otorisasi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Halaman yang Anda coba tuju memerlukan hak akses atau peran administratif khusus yang tidak terasosiasi dengan akun Anda.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={homeUrl}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/25 hover:bg-[#5243D6] transition-all flex items-center justify-center gap-2 min-h-[42px]"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Dashboard Saya</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-border text-foreground text-xs font-bold hover:bg-[#EEF0F8] transition-all flex items-center justify-center gap-2 min-h-[42px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Beranda Utama</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
