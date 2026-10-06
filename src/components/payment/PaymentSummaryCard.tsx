import type { Payment } from '@/types/payment'
import { formatCurrency, formatReportDate, formatTimeRange } from '@/utils/format'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { Calendar, User, BookOpen, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'

interface PaymentSummaryCardProps {
  payment: Payment
}

export function PaymentSummaryCard({ payment }: PaymentSummaryCardProps) {
  const isExpired = payment.status === 'expired'

  return (
    <div className="surface-card p-6 bg-white border border-border rounded-2xl shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ringkasan Tagihan
          </span>
          <h2 className="text-xl font-bold text-foreground">
            {payment.invoice?.invoiceNumber || `Tagihan #${payment.id.slice(0, 8)}`}
          </h2>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/40">
          <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Tutor Pengajar</div>
            <div className="font-semibold text-foreground">{payment.tutorName || 'Tutor Terpilih'}</div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/40">
          <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Mata Pelajaran</div>
            <div className="font-semibold text-foreground">{payment.subjectName || 'Bimbingan Belajar'}</div>
          </div>
        </div>

        {payment.scheduledStart && payment.scheduledEnd && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/40 sm:col-span-2">
            <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground">Jadwal Sesi Bimbingan</div>
              <div className="font-semibold text-foreground">
                {formatReportDate(payment.scheduledStart)} • {formatTimeRange(payment.scheduledStart, payment.scheduledEnd)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/60 pt-4 space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Biaya Sesi Bimbingan</span>
          <span className="font-medium text-foreground">{formatCurrency(payment.amount)}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Biaya Layanan Platform</span>
          <span className="font-medium text-emerald-600">Gratis (Rp 0)</span>
        </div>
        <div className="flex justify-between items-center text-base font-bold text-foreground border-t border-border/40 pt-2">
          <span>Total Pembayaran</span>
          <span className="text-xl text-primary font-black">{formatCurrency(payment.amount)}</span>
        </div>
      </div>

      {payment.status === 'awaiting_payment' && (
        <div className="rounded-xl p-3.5 bg-amber-50/80 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-800">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Batas Waktu Pembayaran: </span>
            {isExpired ? (
              <span className="text-rose-700 font-bold">Waktu pembayaran telah berakhir.</span>
            ) : (
              <span>Harap selesaikan pembayaran sebelum {formatReportDate(payment.expiresAt)} pukul {new Date(payment.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB.</span>
            )}
          </div>
        </div>
      )}

      {payment.status === 'paid' && (
        <div className="rounded-xl p-3.5 bg-emerald-50/80 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pembayaran telah terverifikasi lunas. Sesi bimbingan Anda telah dijadwalkan secara resmi.</span>
        </div>
      )}

      {payment.status === 'failed' && payment.proof?.rejectionReason && (
        <div className="rounded-xl p-3.5 bg-rose-50/80 border border-rose-200/60 flex items-start gap-2.5 text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Alasan Penolakan: </span>
            <span>{payment.proof.rejectionReason}</span>
          </div>
        </div>
      )}
    </div>
  )
}
