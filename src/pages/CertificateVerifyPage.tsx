import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { engagementService } from '@/services/engagementService'
import type { CertificateVerificationResult } from '@/types/engagement'
import {
  Award,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CertificateVerifyPage() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>()
  const [data, setData] = useState<CertificateVerificationResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    if (certificateNumber) {
      engagementService
        .verifyCertificatePublic(certificateNumber)
        .then((res) => {
          if (isMounted) setData(res)
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    }
    return () => {
      isMounted = false
    }
  }, [certificateNumber])

  return (
    <div className="min-h-screen bg-[#F4F5FB] flex flex-col justify-between antialiased text-[#1D1D24]">
      {/* Top Navbar */}
      <header className="h-18 px-6 bg-white border-b border-border/80 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8F7FF7] flex items-center justify-center text-white shadow-md shadow-[#6C5CE7]/30">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#17181C] text-base tracking-tight">
              LAITS <span className="text-[#6C5CE7] font-semibold text-xs uppercase">LMS</span>
            </span>
            <span className="text-[11px] text-[#8A8D9A]">Portal Verifikasi Sertifikat</span>
          </div>
        </Link>

        <Link to="/login">
          <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
            Masuk ke Akun
          </Button>
        </Link>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="bg-white rounded-3xl border border-border shadow-xl max-w-xl w-full p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#6C5CE7]" />
              <p className="text-xs text-[#8A8D9A]">Memeriksa validitas kode sertifikat...</p>
            </div>
          ) : data?.isValid ? (
            <div className="space-y-6 animate-in fade-in-50">
              {/* Badge & Seal */}
              <div className="text-center space-y-3 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10 ring-4 ring-emerald-50">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
                    Sertifikat Terverifikasi
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#17181C] mt-2">
                    Sertifikat Kelulusan Resmi
                  </h1>
                  <p className="text-xs text-[#676A78] mt-1 font-mono">
                    Nomor: <strong>{data.certificateNumber}</strong>
                  </p>
                </div>
              </div>

              {/* Verified Details */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F9FAFD] border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8D9A]">Nama Penerima:</span>
                    <strong className="text-sm text-[#17181C]">{data.studentName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8D9A]">Judul Kursus:</span>
                    <strong className="text-sm text-[#6C5CE7] text-right">{data.courseTitle}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8D9A]">Tingkat Kesulitan:</span>
                    <span className="font-semibold capitalize text-[#17181C]">{data.courseLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8D9A]">Tanggal Penerbitan:</span>
                    <strong className="text-[#17181C]">
                      {data.issuedAt ? new Date(data.issuedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    </strong>
                  </div>
                </div>

                <p className="text-[11px] text-[#8A8D9A] leading-relaxed text-center">
                  Dokumen ini diterbitkan secara otomatis oleh sistem Laits Edu Tech setelah siswa menyelesaikan seluruh materi kurikulum dan memenuhi standar kelulusan asesmen.
                </p>
              </div>

              <div className="pt-2 text-center">
                <Link to="/">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                    <span>Jelajahi Laits Edu Tech</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Invalid State */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-4 ring-rose-50">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#17181C]">Sertifikat Tidak Ditemukan</h2>
                <p className="text-xs text-[#676A78] max-w-sm mx-auto mt-1">
                  Nomor sertifikat <strong>{certificateNumber}</strong> tidak terdaftar dalam catatan basis data resmi Laits Edu Tech.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/">
                  <Button variant="default" size="sm" className="rounded-xl text-xs bg-[#6C5CE7] text-white">
                    Kembali ke Beranda
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-[#8A8D9A] border-t border-border/80 bg-white">
        &copy; {new Date().getFullYear()} Laits Edu Tech &bull; Sistem Manajemen Pembelajaran Terakreditasi
      </footer>
    </div>
  )
}
