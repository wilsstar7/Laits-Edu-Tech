import type { Session } from '@supabase/supabase-js'
import { requireSupabase } from '@/lib/supabase'
import type { RegisterInput } from '@/types'
import { AppError, toAppError } from '@/utils/errors'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function redirectUrl(path: string): string {
  return `${window.location.origin}${path}`
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const authService = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await requireSupabase().auth.getSession()
    if (error) throw toAppError(error, 'Gagal memuat sesi.')
    return data.session
  },

  /**
   * Registers a STUDENT. Role is never sent from the client: the database
   * trigger always assigns 'student'. Student details travel as user metadata
   * and are sanitized server-side by `handle_new_user()`.
   */
  async signUp(input: RegisterInput): Promise<{ needsEmailVerification: boolean }> {
    const { data, error } = await requireSupabase().auth.signUp({
      email: normalizeEmail(input.email),
      password: input.password,
      options: {
        emailRedirectTo: redirectUrl('/auth/callback'),
        data: {
          full_name: input.fullName.trim(),
          date_of_birth: input.dateOfBirth,
          gender: input.gender || null,
          school: emptyToNull(input.school),
          grade: input.grade,
          city: emptyToNull(input.city),
          parent_name: emptyToNull(input.parentName),
          parent_phone: emptyToNull(input.parentPhone),
        },
      },
    })

    if (error) throw toAppError(error, 'Pendaftaran gagal. Silakan coba lagi.')

    // With email confirmation enabled, Supabase returns an obfuscated user with
    // no identities when the email is already registered.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      throw new AppError('Email sudah digunakan.', 'email_taken')
    }

    return { needsEmailVerification: data.session === null }
  },

  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await requireSupabase().auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    })
    if (error) throw toAppError(error, 'Login gagal. Silakan coba lagi.')
    return data.session
  },

  /** Optional: only used when VITE_ENABLE_GOOGLE_OAUTH=true. */
  async signInWithGoogle(): Promise<void> {
    const { error } = await requireSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl('/auth/callback') },
    })
    if (error) throw toAppError(error, 'Login dengan Google gagal.')
  },

  async signOut(): Promise<void> {
    const { error } = await requireSupabase().auth.signOut({ scope: 'local' })
    if (error) throw toAppError(error, 'Gagal keluar. Silakan coba lagi.')
  },

  async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await requireSupabase().auth.resend({
      type: 'signup',
      email: normalizeEmail(email),
      options: { emailRedirectTo: redirectUrl('/auth/callback') },
    })
    if (error) throw toAppError(error, 'Gagal mengirim ulang email verifikasi.')
  },

  /**
   * Always resolves on success regardless of whether the email exists
   * (prevents account enumeration).
   */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(normalizeEmail(email), {
      redirectTo: redirectUrl('/reset-password'),
    })
    if (error) throw toAppError(error, 'Gagal mengirim email reset password.')
  },

  /** Used from the recovery link session on /reset-password. */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await requireSupabase().auth.updateUser({ password: newPassword })
    if (error) throw toAppError(error, 'Gagal memperbarui password.')
  },

  /** Re-verifies the current password before changing it. */
  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    const client = requireSupabase()
    const { error: verifyError } = await client.auth.signInWithPassword({
      email: normalizeEmail(email),
      password: currentPassword,
    })
    if (verifyError) {
      const appError = toAppError(verifyError)
      if (appError.code === 'invalid_credentials') {
        throw new AppError('Password saat ini salah.', 'invalid_credentials')
      }
      throw appError
    }

    const { error } = await client.auth.updateUser({ password: newPassword })
    if (error) throw toAppError(error, 'Gagal memperbarui password.')
  },
}
