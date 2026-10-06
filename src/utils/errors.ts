import { AuthError, type PostgrestError } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export type ErrorCategory =
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export type AppErrorCode =
  | 'unknown'
  | 'network'
  | 'not_configured'
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'email_taken'
  | 'weak_password'
  | 'rate_limited'
  | 'invalid_email'
  | 'same_password'
  | 'session_expired'
  | 'link_expired'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'conflict'
  | 'server_error'

const CODE_TO_CATEGORY: Record<AppErrorCode, ErrorCategory> = {
  unknown: 'UNKNOWN_ERROR',
  network: 'NETWORK_ERROR',
  not_configured: 'SERVER_ERROR',
  invalid_credentials: 'AUTH_ERROR',
  email_not_confirmed: 'AUTH_ERROR',
  email_taken: 'CONFLICT',
  weak_password: 'VALIDATION_ERROR',
  rate_limited: 'RATE_LIMITED',
  invalid_email: 'VALIDATION_ERROR',
  same_password: 'VALIDATION_ERROR',
  session_expired: 'AUTH_ERROR',
  link_expired: 'AUTH_ERROR',
  forbidden: 'PERMISSION_ERROR',
  not_found: 'NOT_FOUND',
  validation: 'VALIDATION_ERROR',
  conflict: 'CONFLICT',
  server_error: 'SERVER_ERROR',
}

/** Error with a safe, user-facing Indonesian message. */
export class AppError extends Error {
  readonly code: AppErrorCode
  readonly category: ErrorCategory
  readonly correlationId?: string

  constructor(
    message: string,
    code: AppErrorCode = 'unknown',
    options?: { cause?: unknown; correlationId?: string }
  ) {
    super(message, options)
    this.name = 'AppError'
    this.code = code
    this.category = CODE_TO_CATEGORY[code] || 'UNKNOWN_ERROR'
    this.correlationId = options?.correlationId
  }
}

export const MESSAGES = {
  generic: 'Terjadi kesalahan sistem. Silakan coba lagi beberapa saat lagi.',
  network: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  sessionExpired: 'Sesi akun Anda telah berakhir. Silakan masuk kembali.',
  forbidden: 'Anda tidak memiliki hak akses untuk tindakan ini.',
  profileLoad: 'Terjadi kendala saat memuat data profil akun.',
  dataUnavailable: 'Data belum tersedia saat ini.',
} as const

const AUTH_CODE_MAP: Record<string, [string, AppErrorCode]> = {
  invalid_credentials: ['Email atau password salah.', 'invalid_credentials'],
  email_not_confirmed: [
    'Email Anda belum diverifikasi. Silakan periksa kotak masuk email Anda.',
    'email_not_confirmed',
  ],
  user_already_exists: ['Email sudah terdaftar.', 'email_taken'],
  email_exists: ['Email sudah terdaftar.', 'email_taken'],
  weak_password: [
    'Password terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.',
    'weak_password',
  ],
  over_email_send_rate_limit: [
    'Terlalu banyak permintaan email. Silakan coba lagi dalam beberapa menit.',
    'rate_limited',
  ],
  over_request_rate_limit: [
    'Terlalu banyak percobaan. Harap tunggu beberapa saat sebelum mencoba kembali.',
    'rate_limited',
  ],
  email_address_invalid: ['Silakan masukkan format email yang valid.', 'invalid_email'],
  same_password: ['Password baru harus berbeda dari password sebelumnya.', 'same_password'],
  session_not_found: [MESSAGES.sessionExpired, 'session_expired'],
  session_expired: [MESSAGES.sessionExpired, 'session_expired'],
  refresh_token_not_found: [MESSAGES.sessionExpired, 'session_expired'],
  refresh_token_already_used: [MESSAGES.sessionExpired, 'session_expired'],
  reauthentication_needed: ['Silakan masuk ulang untuk melanjutkan proses.', 'session_expired'],
  otp_expired: ['Tautan verifikasi telah kedaluwarsa. Silakan minta tautan baru.', 'link_expired'],
  flow_state_expired: ['Tautan telah kedaluwarsa. Silakan ulangi proses dari awal.', 'link_expired'],
  signup_disabled: ['Pendaftaran akun sedang tidak tersedia.', 'forbidden'],
  email_provider_disabled: ['Masuk dengan email sedang dinonaktifkan.', 'forbidden'],
  provider_disabled: ['Metode autentikasi ini belum diaktifkan.', 'forbidden'],
  validation_failed: ['Data yang Anda kirimkan tidak valid.', 'validation'],
}

const PG_CODE_MAP: Record<string, [string, AppErrorCode]> = {
  '42501': [MESSAGES.forbidden, 'forbidden'],
  '23505': ['Data tersebut sudah terdaftar dalam sistem.', 'conflict'],
  '23514': ['Data yang dimasukkan tidak memenuhi kriteria validasi.', 'validation'],
  '22007': ['Format tanggal tidak valid.', 'validation'],
  '22008': ['Format tanggal tidak valid.', 'validation'],
  '22P02': ['Format data yang dikirimkan tidak sesuai.', 'validation'],
  P0002: ['Data yang diminta tidak ditemukan.', 'not_found'],
  PGRST116: ['Data tidak ditemukan.', 'not_found'],
  PGRST301: [MESSAGES.sessionExpired, 'session_expired'],
  PGRST303: [MESSAGES.sessionExpired, 'session_expired'],
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  )
}

/**
 * Converts any thrown runtime error into a sanitized AppError with safe Indonesian message.
 * Internal technical details and SQL schema errors are logged securely and never leaked to users.
 */
export function toAppError(
  error: unknown,
  fallback: string = MESSAGES.generic,
  correlationId?: string
): AppError {
  if (error instanceof AppError) return error

  logger.error('[AppError:handled]', error, correlationId)

  if (error instanceof AuthError) {
    const mapped = error.code ? AUTH_CODE_MAP[error.code] : undefined
    if (mapped) return new AppError(mapped[0], mapped[1], { cause: error, correlationId })
    if (error.status === 0 || error.name === 'AuthRetryableFetchError') {
      return new AppError(MESSAGES.network, 'network', { cause: error, correlationId })
    }
    if (error.status === 429) {
      return new AppError(AUTH_CODE_MAP.over_request_rate_limit![0], 'rate_limited', {
        cause: error,
        correlationId,
      })
    }
    return new AppError(fallback, 'unknown', { cause: error, correlationId })
  }

  if (isPostgrestError(error)) {
    const mapped = PG_CODE_MAP[error.code]
    if (mapped) return new AppError(mapped[0], mapped[1], { cause: error, correlationId })
    if (/jwt expired/i.test(error.message)) {
      return new AppError(MESSAGES.sessionExpired, 'session_expired', { cause: error, correlationId })
    }
    if (/failed to fetch|network/i.test(error.message)) {
      return new AppError(MESSAGES.network, 'network', { cause: error, correlationId })
    }
    return new AppError(fallback, 'server_error', { cause: error, correlationId })
  }

  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return new AppError(MESSAGES.network, 'network', { cause: error, correlationId })
  }

  return new AppError(fallback, 'unknown', { cause: error, correlationId })
}

export function getErrorMessage(error: unknown, fallback: string = MESSAGES.generic): string {
  return toAppError(error, fallback).message
}
