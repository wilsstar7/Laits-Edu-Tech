const LOCALE = 'id-ID'

/** e.g. "Senin, 5 Oktober 2026", always derived from the real current date. */
export function formatLongDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatShortDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

/** Greeting based on the user's local time. */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 19) return 'Selamat sore'
  return 'Selamat malam'
}

/** Today's date as YYYY-MM-DD in local time (for <input type="date" max>). */
export function todayIsoDate(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

/** Strictly validates a YYYY-MM-DD string as a real calendar date. */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number) as [number, number, number]
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

export function getInitials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function getFirstName(name: string | null | undefined): string {
  return (name ?? '').trim().split(/\s+/)[0] ?? ''
}

/** Formats a date for formal reports, e.g. "6 Oktober 2026" */
export function formatReportDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Formats a numerical score consistently, e.g. "72%" */
export function formatScorePercentage(score: number): string {
  if (typeof score !== 'number' || Number.isNaN(score)) return '0%'
  return `${Math.round(score)}%`
}

/** Sanitizes student name and date into a safe filename, e.g. personality-report-ahmad-fulan-2026-10-06.pdf */
export function sanitizeReportFilename(studentName: string, date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const isoDate = !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '2026-10-06'
  const cleanName = (studentName || 'siswa')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'siswa'
  return `personality-report-${cleanName}-${isoDate}.pdf`
}

/** Formats file size in bytes to readable format, e.g. "245 KB" or "1.2 MB" */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const val = bytes / Math.pow(1024, i)
  const formatted = val % 1 === 0 ? val.toString() : val.toFixed(1)
  return `${formatted} ${units[i]}`
}

/** Formats Indonesian Rupiah currency, e.g. "Rp 75.000" */
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const

/** Formats numeric day of week (0=Minggu, 1=Senin, ..., 6=Sabtu) */
export function formatDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex % 7] ?? 'Hari'
}

/** Formats time range with timezone label, e.g. "19:00 - 20:00 WIB" */
export function formatTimeRange(
  startVal: string | Date,
  endVal: string | Date,
  timezone = 'Asia/Jakarta'
): string {
  const start = typeof startVal === 'string' ? new Date(startVal) : startVal
  const end = typeof endVal === 'string' ? new Date(endVal) : endVal

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '-'

  const startStr = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).format(start)

  const endStr = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).format(end)

  const tzLabel = timezone === 'Asia/Jakarta' ? 'WIB' : timezone === 'Asia/Makassar' ? 'WITA' : timezone === 'Asia/Jayapura' ? 'WIT' : timezone

  return `${startStr} - ${endStr} ${tzLabel}`
}

/** Formats full date and time for booking summaries */
export function formatDateTime(value: string | Date, timezone = 'Asia/Jakarta'): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).format(date)
}

