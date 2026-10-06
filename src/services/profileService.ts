import { requireSupabase } from '@/lib/supabase'
import type { AccountBundle, Profile, ProfileUpdateInput } from '@/types'
import { MESSAGES, toAppError } from '@/utils/errors'
import { studentService } from './studentService'

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const profileService = {
  /**
   * Returns the caller's profile, creating it (role = student) if missing.
   * Backed by the SECURITY DEFINER RPC `ensure_profile()`.
   */
  async ensureProfile(): Promise<Profile> {
    const { data, error } = await requireSupabase().rpc('ensure_profile')
    if (error) throw toAppError(error, MESSAGES.profileLoad)
    if (!data) throw toAppError(null, MESSAGES.profileLoad)
    return data
  },

  async getAccountBundle(): Promise<AccountBundle> {
    const profile = await profileService.ensureProfile()
    const studentProfile =
      profile.role === 'student' ? await studentService.getStudentProfile(profile.id) : null
    return { profile, studentProfile }
  },

  /** Only non-authorization columns are writable (enforced by column GRANTs). */
  async updateAccountInfo(userId: string, input: ProfileUpdateInput): Promise<Profile> {
    const { data, error } = await requireSupabase()
      .from('profiles')
      .update({ full_name: input.fullName.trim(), phone: emptyToNull(input.phone) })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw toAppError(error, 'Gagal memperbarui profil.')
    return data
  },
}
