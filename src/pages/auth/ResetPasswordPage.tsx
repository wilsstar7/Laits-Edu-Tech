import { Link } from 'react-router'
import { AlertTriangle } from 'lucide-react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { readAuthLinkInfo, describeLinkError } from '@/utils/authLink'

export function ResetPasswordPage() {
  const linkInfo = readAuthLinkInfo('/reset-password')
  const hasError = Boolean(linkInfo.errorCode)

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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

        <div className="surface-card p-6 sm:p-8 bg-white border border-border shadow-sm">
          <div className="mb-6 text-center space-y-1">
            <h1 className="text-xl font-extrabold text-[#0F1D33] tracking-tight">
              Atur Ulang Kata Sandi
            </h1>
            <p className="text-xs text-[#676A78]">
              Masukkan kata sandi baru untuk mengamankan akun Anda
            </p>
          </div>

          {hasError ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#FDECEC] text-[#E96A6A] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-xs text-[#C64848] font-medium">
                {describeLinkError(linkInfo.errorCode)}
              </p>
              <Link
                to="/forgot-password"
                className="inline-block px-4 py-2 rounded-xl bg-[#183058] text-white text-xs font-bold hover:bg-[#102342]"
              >
                Minta Tautan Reset Baru
              </Link>
            </div>
          ) : (
            <ResetPasswordForm />
          )}
        </div>
      </div>
    </div>
  )
}
