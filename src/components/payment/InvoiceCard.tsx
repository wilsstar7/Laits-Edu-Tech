import type { Invoice, Payment } from '@/types/payment'
import { formatCurrency, formatReportDate } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Printer, ShieldCheck } from 'lucide-react'

interface InvoiceCardProps {
  invoice: Invoice
  payment: Payment
}

export function InvoiceCard({ invoice, payment }: InvoiceCardProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="surface-card p-6 sm:p-8 bg-white border border-border rounded-2xl shadow-sm space-y-6 print:border-none print:shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="text-xs font-bold text-primary tracking-wider uppercase">
            Laits Edu Tech • Faktur Resmi
          </div>
          <h2 className="text-2xl font-black text-foreground mt-1">
            {invoice.invoiceNumber}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="min-h-[44px] gap-2 print:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Faktur</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground font-medium">Ditagihkan Kepada:</div>
          <div className="font-bold text-foreground">{payment.studentName || 'Siswa'}</div>
          <div className="text-xs text-muted-foreground">{payment.studentEmail || '-'}</div>
        </div>

        <div className="space-y-1 sm:text-right">
          <div className="text-xs text-muted-foreground font-medium">Informasi Faktur:</div>
          <div className="text-xs text-muted-foreground">
            Tanggal Terbit:{' '}
            <span className="font-semibold text-foreground">
              {formatReportDate(invoice.issuedAt)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Jatuh Tempo:{' '}
            <span className="font-semibold text-foreground">
              {formatReportDate(invoice.dueAt)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Status:{' '}
            <span className="font-semibold uppercase text-primary">
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      <div className="border border-border/60 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border/60 text-xs font-semibold text-muted-foreground">
            <tr>
              <th className="p-3.5">Layanan</th>
              <th className="p-3.5 text-right">Durasi</th>
              <th className="p-3.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            <tr>
              <td className="p-3.5">
                <div className="font-semibold text-foreground">
                  Sesi Bimbingan: {payment.subjectName}
                </div>
                <div className="text-xs text-muted-foreground">
                  Tutor: {payment.tutorName}
                </div>
              </td>
              <td className="p-3.5 text-right text-muted-foreground">1 Sesi</td>
              <td className="p-3.5 text-right font-semibold text-foreground">
                {formatCurrency(invoice.subtotal)}
              </td>
            </tr>
          </tbody>
          <tfoot className="bg-muted/30 border-t border-border/60">
            <tr>
              <td colSpan={2} className="p-3.5 text-right font-bold text-foreground">
                Total Tagihan:
              </td>
              <td className="p-3.5 text-right font-black text-primary text-base">
                {formatCurrency(invoice.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Faktur digital ini sah dan diterbitkan secara elektronik oleh platform Laits Edu Tech.</span>
      </div>
    </div>
  )
}
