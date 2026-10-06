import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/utils/format'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'

interface PaymentProofUploaderProps {
  onUpload: (file: File) => Promise<void>
  disabled?: boolean
}

export function PaymentProofUploader({ onUpload, disabled }: PaymentProofUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelection = (file: File) => {
    setErrorMessage(null)

    // Allowed: JPG, PNG, PDF
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Format file tidak didukung. Harap pilih gambar (JPG, PNG) atau dokumen PDF.')
      return
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(`Ukuran file terlalu besar (${formatFileSize(file.size)}). Batas maksimal adalah 5 MB.`)
      return
    }

    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelection(file)
  }

  const handleClear = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setErrorMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setErrorMessage(null)
    try {
      await onUpload(selectedFile)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah bukti pembayaran.'
      setErrorMessage(msg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="surface-card p-6 bg-white border border-border rounded-2xl shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">Unggah Bukti Transfer</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Unggah foto struk transfer atau tangkapan layar m-banking (maks. 5 MB)
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        id="proof-file-input"
        disabled={disabled || isUploading}
      />

      {!selectedFile ? (
        <label
          htmlFor="proof-file-input"
          className={`border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 ${
            disabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Klik untuk memilih file bukti transfer
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Format yang didukung: JPG, PNG, atau PDF (maks. 5 MB)
          </span>
        </label>
      ) : (
        <div className="border border-border/80 rounded-2xl p-4 bg-muted/30 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Pratinjau bukti transfer"
                    className="w-10 h-10 object-cover rounded-xl"
                  />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={isUploading}
              aria-label="Batalkan pilihan file"
              className="text-muted-foreground hover:text-foreground shrink-0 min-h-[44px] min-w-[44px]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>File siap dikirim untuk verifikasi oleh admin.</span>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading || disabled}
            className="w-full min-h-[44px] font-semibold gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengirimkan Bukti...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Kirim Bukti Pembayaran</span>
              </>
            )}
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
