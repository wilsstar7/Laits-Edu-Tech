/**
 * Centralized Application Logger
 * Phase 7: Production Hardening, Observability, and Sensitive Data Protection
 *
 * Enforces structured logging, log levels, environment gating, and automatic
 * redaction of credentials, tokens, and sensitive personal information.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const SENSITIVE_KEYS = new Set([
  'password',
  'newpassword',
  'oldpassword',
  'confirmpassword',
  'token',
  'access_token',
  'refresh_token',
  'service_role',
  'service_role_key',
  'secret',
  'apikey',
  'authorization',
  'card_number',
  'credit_card',
  'cvv',
  'parent_phone',
])

/**
 * Recursively deep-masks sensitive data keys in log payloads.
 */
export function sanitizeLogData<T>(data: T): T {
  if (data === null || data === undefined) return data

  if (typeof data === 'string') {
    // Check for bearer tokens or JWT strings
    if (data.startsWith('Bearer ') || data.startsWith('ey')) {
      return '[REDACTED_TOKEN]' as unknown as T
    }
    return data
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item)) as unknown as T
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const rawLower = key.toLowerCase()
      const strippedLower = rawLower.replace(/[-_]/g, '')
      if (
        SENSITIVE_KEYS.has(rawLower) ||
        SENSITIVE_KEYS.has(strippedLower) ||
        strippedLower.includes('password') ||
        strippedLower.includes('secret') ||
        strippedLower.includes('token') ||
        strippedLower.includes('servicerole')
      ) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeLogData(value)
      }
    }
    return sanitized as T
  }

  return data
}

/**
 * Creates a unique correlation ID for distributed tracing between operations.
 */
export function generateCorrelationId(prefix = 'req'): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${randomStr}`
}

class AppLogger {
  private isDev = typeof import.meta !== 'undefined' ? import.meta.env?.DEV : true

  private log(level: LogLevel, message: string, context?: unknown, correlationId?: string) {
    // Suppress debug logs in production
    if (level === 'debug' && !this.isDev) {
      return
    }

    const timestamp = new Date().toISOString()
    const sanitizedContext = context !== undefined ? sanitizeLogData(context) : undefined

    const formattedLog = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(correlationId ? { correlationId } : {}),
      ...(sanitizedContext !== undefined ? { context: sanitizedContext } : {}),
    }

    switch (level) {
      case 'debug':
        if (this.isDev) {
          console.debug(`[DEBUG] ${timestamp} - ${message}`, sanitizedContext ?? '')
        }
        break
      case 'info':
        console.info(`[INFO] ${timestamp} - ${message}`, sanitizedContext ?? '')
        break
      case 'warn':
        console.warn(`[WARN] ${timestamp} - ${message}`, sanitizedContext ?? '')
        break
      case 'error':
        console.error(`[ERROR] ${timestamp} - ${message}`, sanitizedContext ?? '')
        break
    }

    return formattedLog
  }

  debug(message: string, context?: unknown, correlationId?: string) {
    return this.log('debug', message, context, correlationId)
  }

  info(message: string, context?: unknown, correlationId?: string) {
    return this.log('info', message, context, correlationId)
  }

  warn(message: string, context?: unknown, correlationId?: string) {
    return this.log('warn', message, context, correlationId)
  }

  error(message: string, context?: unknown, correlationId?: string) {
    return this.log('error', message, context, correlationId)
  }
}

export const logger = new AppLogger()
