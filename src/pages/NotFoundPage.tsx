import { Link } from 'react-router'
import { FileQuestion, Home } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F4F5FB] flex items-center justify-center p-4">
      <div className="surface-card p-8 sm:p-12 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto shadow-md">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6C5CE7]">
            Halaman Tidak Ditemukan (404)
          </span>
          <h1 className="text-2xl font-extrabold text-[#17181C]">
            Ups, Halaman Hilang
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Halaman yang Anda tuju tidak ditemukan atau URL mungkin salah ketik.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-md shadow-[#6C5CE7]/25 hover:bg-[#5243D6] transition-all min-h-[42px]"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
