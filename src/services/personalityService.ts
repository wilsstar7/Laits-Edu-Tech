import { getSupabase } from '@/lib/supabase'
import type { AssessmentResult, DimensionResult, PersonalityType } from '@/types/assessment'

const RESULT_STORAGE_PREFIX = 'laits_persona_result_'
const LATEST_RESULT_PREFIX = 'laits_persona_latest_'

export const personalityService = {
  /**
   * Menyimpan hasil kalkulasi asesmen siswa.
   */
  async saveResult(result: AssessmentResult): Promise<void> {
    try {
      localStorage.setItem(`${RESULT_STORAGE_PREFIX}${result.id}`, JSON.stringify(result))
      localStorage.setItem(`${LATEST_RESULT_PREFIX}${result.user_id}`, JSON.stringify(result))

      // Update history list in localStorage
      const historyKey = `laits_persona_history_${result.user_id}`
      const existingHistoryRaw = localStorage.getItem(historyKey)
      const historyList: AssessmentResult[] = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : []
      const updated = [result, ...historyList.filter((item) => item.id !== result.id)]
      localStorage.setItem(historyKey, JSON.stringify(updated))
    } catch (err) {
      console.warn('Failed to save assessment result in localStorage:', err)
    }

    // Coba simpan ke Supabase jika ada
    const supabase = getSupabase()
    if (supabase) {
      try {
        await supabase.from('assessment_results').upsert({
          id: result.id,
          session_id: result.session_id,
          user_id: result.user_id,
          assessment_id: result.assessment_id,
          personality_type_id: result.personality_type_id,
          overall_score: result.overall_score,
          completed_at: result.completed_at,
          created_at: result.created_at,
        })
      } catch (err) {
        console.warn('Supabase assessment_results upsert notice:', err)
      }
    }
  },

  /**
   * Mengambil hasil asesmen terbaru untuk seorang siswa.
   */
  async getLatestResult(userId: string): Promise<AssessmentResult | null> {
    // 1. Cek local storage
    try {
      const raw = localStorage.getItem(`${LATEST_RESULT_PREFIX}${userId}`)
      if (raw) {
        return JSON.parse(raw) as AssessmentResult
      }
    } catch {
      // ignore
    }

    // 2. Cek Supabase jika ada
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('assessment_results')
          .select(`
            *,
            personality_types (*),
            assessment_result_dimensions (
              id,
              result_id,
              dimension_id,
              raw_score,
              normalized_score,
              percentile,
              assessment_dimensions (*)
            )
          `)
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!error && data) {
          return formatResultData(data)
        }
      } catch (err) {
        console.warn('Supabase fetch latest result error:', err)
      }
    }

    return null
  },

  /**
   * Mengambil hasil asesmen spesifik berdasarkan ID.
   */
  async getResultById(resultId: string): Promise<AssessmentResult | null> {
    // 1. Cek local storage
    try {
      const raw = localStorage.getItem(`${RESULT_STORAGE_PREFIX}${resultId}`)
      if (raw) {
        return JSON.parse(raw) as AssessmentResult
      }
      // Cari di latest jika id cocok
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(LATEST_RESULT_PREFIX) || key?.startsWith('laits_persona_history_')) {
          const val = localStorage.getItem(key)
          if (val) {
            const parsed = JSON.parse(val)
            if (Array.isArray(parsed)) {
              const found = parsed.find((p) => p.id === resultId)
              if (found) return found as AssessmentResult
            } else if (parsed?.id === resultId) {
              return parsed as AssessmentResult
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // 2. Cek Supabase
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('assessment_results')
          .select(`
            *,
            personality_types (*),
            assessment_result_dimensions (
              id,
              result_id,
              dimension_id,
              raw_score,
              normalized_score,
              percentile,
              assessment_dimensions (*)
            )
          `)
          .eq('id', resultId)
          .maybeSingle()

        if (!error && data) {
          return formatResultData(data)
        }
      } catch (err) {
        console.warn('Supabase getResultById error:', err)
      }
    }

    return null
  },

  /**
   * Mengambil riwayat pengerjaan asesmen siswa.
   */
  async getHistory(userId: string): Promise<AssessmentResult[]> {
    // 1. Cek local storage
    try {
      const historyKey = `laits_persona_history_${userId}`
      const raw = localStorage.getItem(historyKey)
      if (raw) {
        return JSON.parse(raw) as AssessmentResult[]
      }
    } catch {
      // ignore
    }

    // 2. Cek Supabase
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('assessment_results')
          .select(`
            id,
            session_id,
            user_id,
            assessment_id,
            personality_type_id,
            overall_score,
            completed_at,
            created_at,
            personality_types (name, code),
            assessments (name)
          `)
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })

        if (!error && data) {
          return data as unknown as AssessmentResult[]
        }
      } catch (err) {
        console.warn('Supabase getHistory error:', err)
      }
    }

    return []
  },
}

interface RawResultQuery {
  id: string
  session_id: string
  user_id: string
  assessment_id: string
  personality_type_id: string
  overall_score: number
  completed_at: string
  created_at: string
  personality_types: PersonalityType | null
  assessment_result_dimensions: Array<{
    id: string
    result_id: string
    dimension_id: string
    raw_score: number
    normalized_score: number
    percentile: number | null
    assessment_dimensions: unknown
  }>
}

function formatResultData(raw: unknown): AssessmentResult {
  const r = raw as RawResultQuery
  const dimensions: DimensionResult[] = (r.assessment_result_dimensions ?? []).map(
    (dim) => ({
      id: dim.id,
      result_id: dim.result_id,
      dimension_id: dim.dimension_id,
      raw_score: Number(dim.raw_score),
      normalized_score: Number(dim.normalized_score),
      percentile: dim.percentile,
      dimension: dim.assessment_dimensions as DimensionResult['dimension'],
    })
  )

  return {
    id: r.id,
    session_id: r.session_id,
    user_id: r.user_id,
    assessment_id: r.assessment_id,
    personality_type_id: r.personality_type_id,
    overall_score: Number(r.overall_score),
    completed_at: r.completed_at,
    created_at: r.created_at,
    personality_type: r.personality_types ?? undefined,
    dimensions,
  }
}
