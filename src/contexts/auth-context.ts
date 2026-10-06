import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { AccountBundle, Profile, UserRole } from '@/types'

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated' | 'unconfigured'
export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface AuthContextValue {
  status: AuthStatus
  session: Session | null
  user: User | null
  account: AccountBundle | null
  profile: Profile | null
  role: UserRole | null
  profileStatus: ProfileStatus
  profileError: string | null
  /** True after the user arrives via a password recovery link. */
  isPasswordRecovery: boolean
  clearPasswordRecovery: () => void
  /** Re-fetches profile data (e.g. retry after an error). Never throws. */
  refreshAccount: () => Promise<void>
  /** Apply a local update after a successful save (avoids refetch). */
  updateAccount: (updater: (prev: AccountBundle) => AccountBundle) => void
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
