import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types/booking'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react'

interface BookingStatusBadgeProps {
  status: BookingStatus
  className?: string
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant="outline"
          className={`bg-warning/10 text-amber-800 border-warning/30 gap-1.5 font-medium ${className || ''}`}
        >
          <Clock className="w-3 h-3 text-warning" />
          Menunggu Konfirmasi
        </Badge>
      )
    case 'confirmed':
      return (
        <Badge
          variant="outline"
          className={`bg-success/10 text-emerald-800 border-success/30 gap-1.5 font-medium ${className || ''}`}
        >
          <CheckCircle2 className="w-3 h-3 text-success" />
          Terkonfirmasi
        </Badge>
      )
    case 'completed':
      return (
        <Badge
          variant="outline"
          className={`bg-brand-primary/10 text-brand-primary border-brand-primary/30 gap-1.5 font-medium ${className || ''}`}
        >
          <CalendarCheck className="w-3 h-3 text-brand-primary" />
          Selesai
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className={`bg-muted/50 text-ink-muted border-border gap-1.5 font-medium ${className || ''}`}
        >
          <XCircle className="w-3 h-3 text-ink-muted" />
          Dibatalkan
        </Badge>
      )
    case 'rejected':
      return (
        <Badge
          variant="outline"
          className={`bg-danger/10 text-rose-800 border-danger/30 gap-1.5 font-medium ${className || ''}`}
        >
          <AlertCircle className="w-3 h-3 text-danger" />
          Ditolak
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      )
  }
}
