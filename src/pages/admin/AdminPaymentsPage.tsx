import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge'
import { paymentService } from '@/services/paymentService'
import type { Payment } from '@/types/payment'
import { formatCurrency, formatReportDate } from '@/utils/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react'

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Proof Modal
  const [activeProofPayment, setActiveProofPayment] = useState<Payment | null>(null)

  // Reject Reason Modal
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const loadPendingPayments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await paymentService.getPendingVerifications()
      setPayments(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat verifikasi pembayaran.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    paymentService
      .getPendingVerifications()
      .then((data) => {
        if (isMounted) setPayments(data)
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Gagal memuat verifikasi pembayaran.'
          setError(msg)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleApprove = async (paymentId: string) => {
    setIsProcessing(true)
    try {
      await paymentService.verifyPayment(paymentId, 'approve')
      await loadPendingPayments()
      setActiveProofPayment(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyetujui pembayaran.'
      setError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectingPayment) return
    setIsProcessing(true)
    try {
      await paymentService.verifyPayment(
        rejectingPayment.id,
        'reject',
        rejectReason.trim() || undefined
      )
      setRejectingPayment(null)
      setRejectReason('')
      await loadPendingPayments()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menolak pembayaran.'
      setError(msg)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Verifikasi Pembayaran Siswa"
          subtitle="Tinjau dan verifikasi bukti transfer manual yang diunggah siswa untuk mengonfirmasi sesi bimbingan."
        />

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card p-5 bg-white border border-border rounded-2xl space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="surface-card p-12 bg-white border border-border rounded-2xl text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Semua Pembayaran Telah Terverifikasi
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Tidak ada antrean bukti transfer yang menunggu verifikasi saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="surface-card p-5 bg-white border border-border rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary">
                      {p.invoice?.invoiceNumber || `#${p.id.slice(0, 8)}`}
                    </span>
                    <PaymentStatusBadge status={p.status} />
                  </div>

                  <div className="text-xs text-foreground font-semibold">
                    Siswa: {p.studentName} ({p.studentEmail || '-'}) • Tutor: {p.tutorName}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Mata Pelajaran: {p.subjectName} • Diunggah: {formatReportDate(p.createdAt)}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-border/40 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] text-muted-foreground">Nominal Transfer</div>
                    <div className="text-base font-black text-foreground">
                      {formatCurrency(p.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveProofPayment(p)}
                      className="min-h-[44px] gap-1.5 font-semibold text-xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Bukti</span>
                    </Button>

                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleApprove(p.id)}
                      className="min-h-[44px] gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Setujui</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => setRejectingPayment(p)}
                      className="min-h-[44px] gap-1.5 font-semibold text-xs text-rose-600 border-rose-300 hover:bg-rose-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Proof Modal */}
        {activeProofPayment && (
          <Dialog open={!!activeProofPayment} onOpenChange={(open: boolean) => !open && setActiveProofPayment(null)}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Bukti Transfer Pembayaran</span>
                </DialogTitle>
                <DialogDescription>
                  Tagihan {activeProofPayment.invoice?.invoiceNumber} • Siswa {activeProofPayment.studentName}
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 space-y-3">
                <div className="rounded-xl overflow-hidden border border-border bg-muted/20 flex items-center justify-center p-2 min-h-[250px]">
                  {activeProofPayment.proof?.signedUrl ? (
                    activeProofPayment.proof.mimeType.startsWith('image/') ? (
                      <img
                        src={activeProofPayment.proof.signedUrl}
                        alt="Bukti Transfer Siswa"
                        className="max-h-[450px] w-auto object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <FileText className="w-12 h-12 text-primary mx-auto" />
                        <div className="font-semibold text-sm">Dokumen Bukti (PDF)</div>
                        <a
                          href={activeProofPayment.proof.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline text-xs font-bold block"
                        >
                          Buka Dokumen di Tab Baru
                        </a>
                      </div>
                    )
                  ) : (
                    <div className="text-muted-foreground text-xs p-6 text-center">
                      File bukti transfer tidak dapat dimuat atau URL kedaluwarsa.
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Nama File: {activeProofPayment.proof?.originalFileName || '-'}</span>
                  <span>Nominal: {formatCurrency(activeProofPayment.amount)}</span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setActiveProofPayment(null)}
                  className="min-h-[44px]"
                >
                  Tutup
                </Button>
                <Button
                  onClick={() => handleApprove(activeProofPayment.id)}
                  disabled={isProcessing}
                  className="min-h-[44px] gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui Pembayaran</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Reject Dialog */}
        {rejectingPayment && (
          <Dialog open={!!rejectingPayment} onOpenChange={(open: boolean) => !open && setRejectingPayment(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-rose-600">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Tolak Bukti Pembayaran</span>
                </DialogTitle>
                <DialogDescription>
                  Siswa akan menerima pemberitahuan dan dapat mengunggah bukti pembayaran baru.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <label className="text-xs font-semibold text-foreground block">
                  Alasan Penolakan
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Misal: Nominal transfer tidak sesuai, foto buram/tidak terbaca..."
                  className="w-full text-sm rounded-xl border border-border p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setRejectingPayment(null)}
                  disabled={isProcessing}
                  className="min-h-[44px]"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectConfirm}
                  disabled={isProcessing}
                  className="min-h-[44px] gap-2 font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Tolak</span>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppShell>
  )
}
