import { requireSupabase } from '@/lib/supabase'
import type { StudentProfile, StudentProfileInput } from '@/types'
import { toAppError } from '@/utils/errors'

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toRow(input: StudentProfileInput) {
  return {
    date_of_birth: input.dateOfBirth || null,
    gender: input.gender || null,
    school: emptyToNull(input.school),
    grade: input.grade || null,
    city: emptyToNull(input.city),
    parent_name: emptyToNull(input.parentName),
    parent_phone: emptyToNull(input.parentPhone),
  }
}

export const studentService = {
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const { data, error } = await requireSupabase()
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw toAppError(error, 'Gagal memuat data siswa.')
    return data
  },

  /** Inserts the row if missing (RLS: students only), otherwise updates it. */
  async saveStudentProfile(userId: string, input: StudentProfileInput): Promise<StudentProfile> {
    const client = requireSupabase()
    const existing = await studentService.getStudentProfile(userId)
    const row = toRow(input)

    const query = existing
      ? client.from('student_profiles').update(row).eq('user_id', userId).select().single()
      : client.from('student_profiles').insert({ user_id: userId, ...row }).select().single()

    const { data, error } = await query
    if (error) throw toAppError(error, 'Gagal menyimpan data siswa.')
    return data
  },
}
