import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge'
import { paymentService } from '@/services/paymentService'
import type { Payment, PaymentStatus } from '@/types/payment'
import { formatCurrency, formatReportDate } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CreditCard,
  ArrowRight,
  Receipt,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react'

export function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all')

  useEffect(() => {
    async function loadPayments() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await paymentService.getStudentPayments()
        setPayments(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat transaksi.'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    }
    loadPayments()
  }, [])

  const filteredPayments = payments.filter((p) => {
    if (statusFilter === 'all') return true
    return p.status === statusFilter
  })

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Riwayat Pembayaran"
          subtitle="Daftar transaksi, faktur pembayaran, dan status verifikasi sesi bimbingan Anda."
        />

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Semua Transaksi' },
            { id: 'awaiting_payment', label: 'Menunggu Pembayaran' },
            { id: 'awaiting_verification', label: 'Menunggu Verifikasi' },
            { id: 'paid', label: 'Lunas' },
            { id: 'failed', label: 'Gagal' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as 'all' | PaymentStatus)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[38px] cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-white text-muted-foreground border border-border/80 hover:bg-muted/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="surface-card p-5 bg-white border border-border rounded-2xl space-y-3"
              >
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="surface-card p-12 bg-white border border-border rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Tidak Ada Transaksi Ditemukan
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? 'Anda belum memiliki transaksi pembayaran sesi bimbingan.'
                  : 'Tidak ada transaksi dengan status pembayaran yang dipilih.'}
              </p>
            </div>
            <Link to="/student/tutors">
              <Button className="min-h-[44px] gap-2 font-semibold text-xs">
                <span>Cari Tutor Belajar</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((p) => (
              <div
                key={p.id}
                className="surface-card p-5 bg-white border border-border rounded-2xl shadow-sm hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary">
                      {p.invoice?.invoiceNumber || `#${p.id.slice(0, 8)}`}
                    </span>
                    <PaymentStatusBadge status={p.status} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5 text-foreground font-semibold">
                      <User className="w-3.5 h-3.5 text-primary shrink-0" />
                      {p.tutorName}
                    </span>
                    <span>• {p.subjectName}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatReportDate(p.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40 shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-muted-foreground">Total Tagihan</div>
                    <div className="text-base font-black text-foreground">
                      {formatCurrency(p.amount)}
                    </div>
                  </div>

                  <Link to={`/student/payments/${p.id}`}>
                    <Button
                      variant={p.status === 'awaiting_payment' ? 'default' : 'outline'}
                      size="sm"
                      className="min-h-[44px] gap-1.5 font-semibold text-xs"
                    >
                      {p.status === 'awaiting_payment' ? (
                        <>
                          <span>Bayar Sekarang</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Receipt className="w-4 h-4" />
                          <span>Detail</span>
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
