import { Link } from 'react-router'
import { Layers, AlertTriangle } from 'lucide-react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { readAuthLinkInfo, describeLinkError } from '@/utils/authLink'

export function ResetPasswordPage() {
  const linkInfo = readAuthLinkInfo('/reset-password')
  const hasError = Boolean(linkInfo.errorCode)

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
                className="inline-block px-4 py-2 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold hover:bg-[#5243D6]"
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
