/**
 * Public, client-safe configuration only.
 * NEVER add service role keys or server secrets here: anything prefixed with VITE_
 * is bundled into the client browser.
 */

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''
const rawAppUrl = import.meta.env.VITE_APP_URL?.trim() ?? ''

function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const isSupabaseConfigured =
  rawSupabaseUrl.length > 0 &&
  rawSupabaseAnonKey.length > 0 &&
  isValidHttpUrl(rawSupabaseUrl)

export const env = {
  supabaseUrl: rawSupabaseUrl,
  supabaseAnonKey: rawSupabaseAnonKey,
  appUrl: rawAppUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
  isSupabaseConfigured,
  isGoogleOAuthEnabled: import.meta.env.VITE_ENABLE_GOOGLE_OAUTH === 'true',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const

/**
 * Validates the runtime environment and returns any configuration issues found.
 */
export function validateEnvironment(): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  if (!rawSupabaseUrl) {
    issues.push('VITE_SUPABASE_URL tidak didefinisikan.')
  } else if (!isValidHttpUrl(rawSupabaseUrl)) {
    issues.push('VITE_SUPABASE_URL harus berupa URL HTTP/HTTPS yang valid.')
  }

  if (!rawSupabaseAnonKey) {
    issues.push('VITE_SUPABASE_ANON_KEY tidak didefinisikan.')
  }

  // Prevent accidental leak check: ensure no service role keys are exposed
  for (const key of Object.keys(import.meta.env)) {
    if (key.includes('SERVICE_ROLE') || key.includes('SECRET')) {
      issues.push(`POTENSI KEBOCORAN KEAMANAN: Kunci sensitif '${key}' ditemukan di client environment!`)
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}
