import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PaymentSummaryCard } from '@/components/payment/PaymentSummaryCard'
import { PaymentInstructionCard } from '@/components/payment/PaymentInstructionCard'
import { PaymentProofUploader } from '@/components/payment/PaymentProofUploader'
import { InvoiceCard } from '@/components/payment/InvoiceCard'
import { paymentService } from '@/services/paymentService'
import type { Payment } from '@/types/payment'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, CheckCircle2, Clock, Calendar } from 'lucide-react'

export function PaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reloadPayment = async () => {
    if (!paymentId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await paymentService.getPaymentById(paymentId)
      if (!data) throw new Error('Data pembayaran tidak ditemukan.')
      setPayment(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat detail pembayaran.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!paymentId) return
    let isMounted = true

    paymentService
      .getPaymentById(paymentId)
      .then((data) => {
        if (!isMounted) return
        if (!data) throw new Error('Data pembayaran tidak ditemukan.')
        setPayment(data)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Gagal memuat detail pembayaran.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [paymentId])

  const handleUploadProof = async (file: File) => {
    if (!paymentId) return
    await paymentService.uploadPaymentProof(paymentId, file)
    await reloadPayment()
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/student/payments">
            <Button variant="ghost" size="sm" className="min-h-[44px] gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Riwayat Pembayaran</span>
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Selesaikan Pembayaran"
          subtitle="Lakukan transfer sesuai rincian tagihan di bawah ini untuk mengonfirmasi sesi bimbingan Anda."
        />

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : !payment ? (
          <div className="surface-card p-8 bg-white border border-border rounded-2xl text-center">
            Pembayaran tidak ditemukan.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payment Summary */}
            <PaymentSummaryCard payment={payment} />

            {/* If paid -> Show Invoice & Link to Schedule */}
            {payment.status === 'paid' && payment.invoice && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-800 text-sm">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Pembayaran berhasil diverifikasi. Sesi Anda siap dihadiri.</span>
                  </div>
                  <Link to="/student/schedule">
                    <Button size="sm" className="min-h-[44px] gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Calendar className="w-4 h-4" />
                      <span>Lihat Jadwal Saya</span>
                    </Button>
                  </Link>
                </div>
                <InvoiceCard invoice={payment.invoice} payment={payment} />
              </div>
            )}

            {/* If awaiting verification -> Show Pending Message */}
            {payment.status === 'awaiting_verification' && (
              <div className="surface-card p-6 bg-blue-50/50 border border-blue-200/60 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Bukti Pembayaran Sedang Diverifikasi</span>
                </div>
                <p className="text-xs text-blue-700/90 leading-relaxed">
                  Bukti transfer Anda telah diterima dan sedang dalam proses verifikasi oleh administrator. Anda akan menerima notifikasi status setelah verifikasi selesai (maksimal 1x24 jam kerja).
                </p>
                {payment.proof && (
                  <div className="pt-2 text-xs text-blue-600">
                    Nama file bukti: <strong>{payment.proof.originalFileName}</strong>
                  </div>
                )}
              </div>
            )}

            {/* If awaiting payment or failed -> Show bank instructions & uploader */}
            {(payment.status === 'awaiting_payment' || payment.status === 'failed') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PaymentInstructionCard />
                <PaymentProofUploader onUpload={handleUploadProof} />
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
