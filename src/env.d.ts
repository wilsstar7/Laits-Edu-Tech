/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Optional. Set to "true" only after Google provider is configured in Supabase. */
  readonly VITE_ENABLE_GOOGLE_OAUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
