import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env } from './env'
import { AppError } from '@/utils/errors'

export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Snapshot of the URL at boot, taken BEFORE supabase-js parses and clears
 * auth params from it. Used by /auth/callback and /reset-password to detect
 * link errors such as `error_code=otp_expired`.
 */
export const initialAuthUrl = {
  pathname: typeof window !== 'undefined' ? window.location.pathname : '',
  hash: typeof window !== 'undefined' ? window.location.hash : '',
  search: typeof window !== 'undefined' ? window.location.search : '',
} as const

/**
 * Browser Supabase client (anon key only, protected by RLS).
 * `null` when env vars are missing so the UI can show a setup notice instead
 * of crashing.
 */
export const supabase: TypedSupabaseClient | null = env.isSupabaseConfigured
  ? createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'laits-auth',
      },
    })
  : null

/** Use inside services. Returns null when unconfigured instead of throwing. */
export function getSupabase(): TypedSupabaseClient | null {
  return supabase
}

/** Use inside services. Throws a user-friendly error when not configured. */
export function requireSupabase(): TypedSupabaseClient {
  if (!supabase) {
    throw new AppError(
      'Aplikasi belum terhubung ke server. Hubungi administrator.',
      'not_configured',
    )
  }
  return supabase
}
