import { initialAuthUrl } from '@/lib/supabase'

export interface AuthLinkInfo {
  type: string | null
  errorCode: string | null
  errorDescription: string | null
}

/** Reads auth params (implicit hash or PKCE query) from the boot URL. */
export function readAuthLinkInfo(expectedPath: string): AuthLinkInfo {
  if (initialAuthUrl.pathname !== expectedPath) {
    return { type: null, errorCode: null, errorDescription: null }
  }
  const hash = new URLSearchParams(initialAuthUrl.hash.replace(/^#/, ''))
  const query = new URLSearchParams(initialAuthUrl.search)
  const get = (key: string) => hash.get(key) ?? query.get(key)
  return {
    type: get('type'),
    errorCode: get('error_code') ?? get('error'),
    errorDescription: get('error_description'),
  }
}

export function describeLinkError(code: string | null): string {
  switch (code) {
    case 'otp_expired':
      return 'Tautan sudah kedaluwarsa atau sudah pernah digunakan. Silakan minta tautan baru.'
    case 'access_denied':
      return 'Tautan tidak valid atau sudah kedaluwarsa.'
    default:
      return 'Tautan tidak dapat diproses. Silakan coba lagi.'
  }
}
