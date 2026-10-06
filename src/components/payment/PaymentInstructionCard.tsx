import { useState } from 'react'
import { MANUAL_TRANSFER_INSTRUCTIONS } from '@/types/payment'
import { Button } from '@/components/ui/button'
import { Building2, Copy, Check, Info } from 'lucide-react'

export function PaymentInstructionCard() {
  const [copied, setCopied] = useState(false)

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(
        MANUAL_TRANSFER_INSTRUCTIONS.accountNumber.replace(/-/g, '')
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn('Clipboard write failed:', err)
    }
  }

  return (
    <div className="surface-card p-6 bg-white border border-border rounded-2xl shadow-sm space-y-5">
      <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">
          Instruksi Transfer Bank Manual
        </h3>
      </div>

      <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3">
        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
          Bank Tujuan
        </div>
        <div className="text-sm font-bold text-foreground">
          {MANUAL_TRANSFER_INSTRUCTIONS.bankName}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          <div>
            <div className="text-xs text-muted-foreground">Nomor Rekening</div>
            <div className="font-mono text-lg font-bold text-foreground tracking-wide">
              {MANUAL_TRANSFER_INSTRUCTIONS.accountNumber}
            </div>
            <div className="text-xs text-muted-foreground">
              a.n. {MANUAL_TRANSFER_INSTRUCTIONS.accountHolder}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAccount}
            className="gap-1.5 min-h-[44px] px-3.5"
            aria-label="Salin nomor rekening"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Info className="w-4 h-4 text-primary" />
          <span>Langkah Pembayaran:</span>
        </div>
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
          {MANUAL_TRANSFER_INSTRUCTIONS.instructions.map((step, idx) => (
            <li key={idx} className="text-foreground/80">
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
