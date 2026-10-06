import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { AuthContext, type AuthContextValue, type AuthStatus, type ProfileStatus } from './auth-context'
import { supabase } from '@/lib/supabase'
import { authService } from '@/services/authService'
import { profileService } from '@/services/profileService'
import type { AccountBundle } from '@/types'
import { MESSAGES, getErrorMessage } from '@/utils/errors'

interface LoadedAccount {
  userId: string
  account: AccountBundle
}

interface FailedAccount {
  userId: string
  message: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(supabase ? 'initializing' : 'unconfigured')
  const [session, setSession] = useState<Session | null>(null)
  const [loaded, setLoaded] = useState<LoadedAccount | null>(null)
  const [failed, setFailed] = useState<FailedAccount | null>(null)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  const hadSessionRef = useRef(false)
  const manualSignOutRef = useRef(false)

  // --- Session lifecycle -----------------------------------------------------
  useEffect(() => {
    if (!supabase) return

    // Fires INITIAL_SESSION immediately, then every auth change.
    // NOTE: never await Supabase calls inside this callback (can deadlock).
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true)

      if (event === 'SIGNED_OUT') {
        if (hadSessionRef.current && !manualSignOutRef.current) {
          toast.error(MESSAGES.sessionExpired)
        }
        manualSignOutRef.current = false
        setIsPasswordRecovery(false)
      }

      hadSessionRef.current = nextSession !== null
      setSession(nextSession)
      setStatus(nextSession ? 'authenticated' : 'unauthenticated')
    })

    return () => data.subscription.unsubscribe()
  }, [])

  // --- Profile loading (keyed by user id, not by token refreshes) -----------
  const userId = session?.user.id ?? null

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    profileService.getAccountBundle().then(
      (account) => {
        if (!cancelled) setLoaded({ userId, account })
      },
      (error: unknown) => {
        if (!cancelled) setFailed({ userId, message: getErrorMessage(error, MESSAGES.profileLoad) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [userId])

  const refreshAccount = useCallback(async () => {
    if (!userId) return
    setFailed(null)
    try {
      const account = await profileService.getAccountBundle()
      setLoaded({ userId, account })
    } catch (error) {
      setFailed({ userId, message: getErrorMessage(error, MESSAGES.profileLoad) })
    }
  }, [userId])

  const updateAccount = useCallback((updater: (prev: AccountBundle) => AccountBundle) => {
    setLoaded((prev) => (prev ? { ...prev, account: updater(prev.account) } : prev))
  }, [])

  const signOut = useCallback(async () => {
    manualSignOutRef.current = true
    try {
      await authService.signOut()
    } catch (error) {
      manualSignOutRef.current = false
      throw error
    }
  }, [])

  const clearPasswordRecovery = useCallback(() => setIsPasswordRecovery(false), [])

  // --- Derived state ---------------------------------------------------------
  const account = userId && loaded?.userId === userId ? loaded.account : null
  const profileError = userId && failed?.userId === userId ? failed.message : null

  let profileStatus: ProfileStatus = 'idle'
  if (userId) {
    if (account) profileStatus = 'ready'
    else if (profileError) profileStatus = 'error'
    else profileStatus = 'loading'
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      account,
      profile: account?.profile ?? null,
      role: account?.profile.role ?? null,
      profileStatus,
      profileError,
      isPasswordRecovery,
      clearPasswordRecovery,
      refreshAccount,
      updateAccount,
      signOut,
    }),
    [
      status,
      session,
      account,
      profileStatus,
      profileError,
      isPasswordRecovery,
      clearPasswordRecovery,
      refreshAccount,
      updateAccount,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
