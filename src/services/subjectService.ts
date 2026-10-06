import { requireSupabase } from '@/lib/supabase'
import type { Subject } from '@/types'
import { toAppError } from '@/utils/errors'

export type SubjectSummary = Pick<Subject, 'id' | 'name' | 'category' | 'description'>

export const subjectService = {
  /** Database-driven subject catalog (RLS: anyone can read active subjects). */
  async listActiveSubjects(): Promise<SubjectSummary[]> {
    const { data, error } = await requireSupabase()
      .from('subjects')
      .select('id, name, category, description')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw toAppError(error, 'Gagal memuat daftar mata pelajaran.')
    return data
  },
}
