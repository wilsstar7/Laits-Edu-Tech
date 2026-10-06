import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { profileService } from '@/services/profileService'
import { readAuthLinkInfo, describeLinkError } from '@/utils/authLink'

export function AuthCallbackPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(() => {
    const linkInfo = readAuthLinkInfo('/auth/callback')
    return linkInfo.errorCode ? describeLinkError(linkInfo.errorCode) : null
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (errorMsg) return

    if (!supabase) {
      navigate('/login', { replace: true })
      return
    }

    // Give Supabase a moment to handle session detection from URL
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error || !data.session) {
        setErrorMsg('Tidak dapat memvalidasi sesi autentikasi. Silakan login langsung.')
        return
      }

      setIsSuccess(true)
      try {
        const { profile } = await profileService.getAccountBundle()
        setTimeout(() => {
          if (profile.role === 'admin' || profile.role === 'super_admin') {
            navigate('/admin/dashboard', { replace: true })
          } else if (profile.role === 'tutor') {
            navigate('/tutor/dashboard', { replace: true })
          } else {
            navigate('/student/dashboard', { replace: true })
          }
        }, 1200)
      } catch {
        navigate('/student/dashboard', { replace: true })
      }
    })
  }, [errorMsg, navigate])

  return (
    <div className="min-h-screen bg-[#F4F5FB] flex items-center justify-center p-4">
      <div className="surface-card p-8 max-w-md w-full text-center space-y-4">
        {errorMsg ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[#FDECEC] text-[#E96A6A] flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-[#17181C]">Verifikasi Gagal</h2>
            <p className="text-xs text-muted-foreground">{errorMsg}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold hover:bg-[#5243D6]"
              >
                <span>Kembali ke Halaman Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : isSuccess ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[#E6F6EE] text-[#45B97C] flex items-center justify-center mx-auto animate-in zoom-in-75">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-[#17181C]">Verifikasi Berhasil!</h2>
            <p className="text-xs text-muted-foreground">
              Sesi Anda telah aktif. Mengarahkan ke dashboard...
            </p>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-[#6C5CE7] animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-[#17181C]">Memverifikasi Akun...</h2>
            <p className="text-xs text-muted-foreground">
              Mohon tunggu sebentar selagi kami menyiapkan akses Anda.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
