import { Badge } from '@/components/ui/badge'
import type { PaymentStatus } from '@/types/payment'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  XCircle,
  RefreshCcw,
} from 'lucide-react'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  switch (status) {
    case 'paid':
      return (
        <Badge
          className={`bg-emerald-50 text-emerald-700 border-emerald-200/60 font-medium gap-1.5 py-1 px-2.5 ${className || ''}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Lunas
        </Badge>
      )
    case 'awaiting_verification':
      return (
        <Badge
          className={`bg-blue-50 text-blue-700 border-blue-200/60 font-medium gap-1.5 py-1 px-2.5 ${className || ''}`}
        >
          <FileSearch className="w-3.5 h-3.5 text-blue-600" />
          Menunggu Verifikasi
        </Badge>
      )
    case 'awaiting_payment':
    case 'pending':
      return (
        <Badge
          className={`bg-amber-50 text-amber-700 border-amber-200/60 font-medium gap-1.5 py-1 px-2.5 ${className || ''}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Menunggu Pembayaran
        </Badge>
      )
    case 'expired':
      return (
        <Badge
          className={`bg-gray-100 text-gray-700 border-gray-200 font-medium gap-1.5 py-1 px-2.5 ${className || ''}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
          Kedaluwarsa
        </Badge>
      )
    case 'failed':
      return (
        <Badge
          className={`bg-rose-50 text-rose-700 border-rose-200/60 font-medium gap-1.5 py-1 px-2.5 ${className || ''}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Gagal / Ditolak
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge
          className={`bg-gray-100 text-gray-600 border-gray-200 font-medium gap-1.5 py-1 px-2.5 ${className || ''}`}
        >
          <XCircle className="w-3.5 h-3.5 text-gray-500" />
          Dibatalkan
        </Badge>
      )
    case 'refunded':
    case 'partially_refunded':
      return (
        <Badge
          className={`bg-purple-50 text-purple-700 border-purple-200/60 font-medium gap-1.5 py-1 px-2.5 ${className || ''}`}
        >
          <RefreshCcw className="w-3.5 h-3.5 text-purple-600" />
          Dikembalikan
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
