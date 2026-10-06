import { FileText, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'
import type { ReportStatus } from '@/types/report'

interface ReportGenerationDialogProps {
  isOpen: boolean
  status: ReportStatus | 'idle'
  errorMessage?: string | null
  onClose: () => void
  onViewReport?: () => void
}

export function ReportGenerationDialog({
  isOpen,
  status,
  errorMessage,
  onClose,
  onViewReport,
}: ReportGenerationDialogProps) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-150 animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white border border-border p-6 shadow-xl space-y-5 relative">
        {/* Close Button when not generating */}
        {status !== 'generating' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="absolute top-4 right-4 p-2 rounded-xl text-[#676A78] hover:text-[#17181C] hover:bg-[#F4F5FB] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* State: Generating */}
        {status === 'generating' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto">
              <Loader2 className="w-7 h-7 animate-spin" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 id="dialog-title" className="text-base font-extrabold text-[#17181C]">
                Menyusun Dokumen Laporan...
              </h3>
              <p className="text-xs text-[#676A78] leading-relaxed max-w-xs mx-auto">
                Sistem sedang memproses hasil penilaian kognitif Anda menjadi laporan resmi 9 halaman. Proses ini membutuhkan beberapa detik.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F4F5FB] text-[11px] text-[#676A78] text-left space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-pulse" />
                <span>Memvalidasi skor dimensi dan profil karakter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-pulse" />
                <span>Menyusun rekomendasi belajar dan gaya tutor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7] animate-pulse" />
                <span>Mengunggah dokumen ke penyimpanan aman</span>
              </div>
            </div>
          </div>
        )}

        {/* State: Ready */}
        {status === 'ready' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 id="dialog-title" className="text-base font-extrabold text-[#17181C]">
                Laporan Siap Diunduh
              </h3>
              <p className="text-xs text-[#676A78] leading-relaxed max-w-xs mx-auto">
                Dokumen resmi Personality & Learning Profile Report Anda telah berhasil digenerate dan tersimpan dengan aman.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {onViewReport && (
                <button
                  type="button"
                  onClick={onViewReport}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#6C5CE7] hover:bg-[#5243D6] text-white text-xs font-bold shadow-sm transition-colors min-h-[44px]"
                >
                  Lihat Dokumen
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#F4F5FB] hover:bg-[#EAEBF0] text-[#17181C] text-xs font-bold transition-colors min-h-[44px]"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* State: Failed */}
        {status === 'failed' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDECEC] text-[#C64848] flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 id="dialog-title" className="text-base font-extrabold text-[#17181C]">
                Gagal Membuat Laporan
              </h3>
              <p className="text-xs text-[#676A78] leading-relaxed max-w-xs mx-auto">
                {errorMessage || 'Terjadi kendala saat menyusun laporan. Silakan coba kembali.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F4F5FB] hover:bg-[#EAEBF0] text-[#17181C] text-xs font-bold transition-colors min-h-[44px]"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* State: Idle / Confirm */}
        {status === 'idle' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 id="dialog-title" className="text-base font-extrabold text-[#17181C]">
                Generate Personality Report
              </h3>
              <p className="text-xs text-[#676A78] leading-relaxed max-w-xs mx-auto">
                Laporan ini akan mengompilasi hasil asesmen menjadi dokumen PDF 9 halaman yang tersimpan secara privat di akun Anda.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
