import { requireSupabase } from '@/lib/supabase'
import type { Subject } from '@/types'
import { toAppError } from '@/utils/errors'

export type SubjectSummary = Pick<Subject, 'id' | 'name' | 'category' | 'description'>

export interface SubjectFilterParams {
  category?: 'general' | 'religious' | 'all'
  status?: 'active' | 'inactive' | 'all'
  search?: string
}

export interface SubjectCounts {
  total: number
  general: number
  religious: number
  active: number
}

export interface CreateSubjectPayload {
  name: string
  category: 'general' | 'religious'
  description?: string | null
  is_active?: boolean
}

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

  async getAllSubjects(params?: SubjectFilterParams): Promise<Subject[]> {
    const supabase = requireSupabase()
    let query = supabase.from('subjects').select('*')

    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category)
    }

    if (params?.status && params.status !== 'all') {
      query = query.eq('is_active', params.status === 'active')
    }

    if (params?.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`
      query = query.or(`name.ilike.${term},description.ilike.${term}`)
    }

    query = query.order('category', { ascending: true }).order('name', { ascending: true })

    const { data, error } = await query
    if (error) throw toAppError(error, 'Gagal memuat katalog mata pelajaran.')
    return (data as Subject[]) || []
  },

  async getSubjectCounts(): Promise<SubjectCounts> {
    const supabase = requireSupabase()
    const [totalRes, generalRes, religiousRes, activeRes] = await Promise.all([
      supabase.from('subjects').select('id', { count: 'exact', head: true }),
      supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('category', 'general'),
      supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('category', 'religious'),
      supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ])

    return {
      total: totalRes.count ?? 0,
      general: generalRes.count ?? 0,
      religious: religiousRes.count ?? 0,
      active: activeRes.count ?? 0,
    }
  },

  async createSubject(payload: CreateSubjectPayload): Promise<Subject> {
    const supabase = requireSupabase()
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: payload.name.trim(),
        category: payload.category,
        description: payload.description?.trim() || null,
        is_active: payload.is_active ?? true,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        throw toAppError(error, `Mata pelajaran "${payload.name.trim()}" sudah ada di database.`)
      }
      throw toAppError(error, 'Gagal menambahkan mata pelajaran baru.')
    }
    return data as Subject
  },

  async updateSubject(
    id: string,
    payload: Partial<CreateSubjectPayload>
  ): Promise<Subject> {
    const supabase = requireSupabase()
    const updates: Partial<{
      name: string
      category: 'general' | 'religious'
      description: string | null
      is_active: boolean
    }> = {}

    if (payload.name !== undefined) updates.name = payload.name.trim()
    if (payload.category !== undefined) updates.category = payload.category
    if (payload.description !== undefined) updates.description = payload.description?.trim() || null
    if (payload.is_active !== undefined) updates.is_active = payload.is_active

    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        throw toAppError(error, 'Nama mata pelajaran tersebut sudah digunakan.')
      }
      throw toAppError(error, 'Gagal memperbarui data mata pelajaran.')
    }
    return data as Subject
  },

  async toggleSubjectStatus(id: string, isActive: boolean): Promise<void> {
    const supabase = requireSupabase()
    const { error } = await supabase
      .from('subjects')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) throw toAppError(error, 'Gagal mengubah status keaktifan mata pelajaran.')
  },

  async deleteSubject(id: string): Promise<void> {
    const supabase = requireSupabase()
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') {
        throw toAppError(
          error,
          'Mata pelajaran sedang digunakan pada tutor atau kurikulum. Nonaktifkan statusnya alih-alih menghapusnya.'
        )
      }
      throw toAppError(error, 'Gagal menghapus mata pelajaran.')
    }
  },
}
