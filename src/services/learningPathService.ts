import { requireSupabase } from '@/lib/supabase'
import type { LearningPath, LearningPathDetail } from '@/types/learning'
import { toAppError } from '@/utils/errors'

export const learningPathService = {
  /**
   * Lists all active learning paths, annotated with priority/reason if personalityTypeId is provided.
   */
  async listLearningPaths(personalityTypeId?: string): Promise<LearningPath[]> {
    const supabase = requireSupabase()

    try {
      // 1. Fetch active paths with subjects count
      const { data: paths, error: pathsError } = await supabase
        .from('learning_paths')
        .select(`
          id,
          title,
          slug,
          description,
          thumbnail_url,
          difficulty,
          estimated_duration,
          is_active,
          learning_path_subjects (count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (pathsError) throw pathsError
      if (!paths || paths.length === 0) return []

      // 2. If personality type is provided, fetch tailored recommendations
      let recommendationsMap: Record<string, { priority: number; reason: string }> = {}
      if (personalityTypeId) {
        const { data: recs } = await supabase
          .from('personality_type_learning_paths')
          .select('learning_path_id, priority, reason')
          .eq('personality_type_id', personalityTypeId)

        if (recs) {
          recommendationsMap = recs.reduce((acc, cur) => {
            acc[cur.learning_path_id] = { priority: cur.priority, reason: cur.reason }
            return acc
          }, {} as Record<string, { priority: number; reason: string }>)
        }
      }

      // 3. Map to domain LearningPath items and sort by priority if matched
      const formatted: LearningPath[] = paths.map((p) => {
        const countObj = p.learning_path_subjects as unknown as Array<{ count: number }> | undefined
        const subjectsCount = countObj?.[0]?.count ?? 0
        const rec = recommendationsMap[p.id]

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          thumbnailUrl: p.thumbnail_url,
          difficulty: p.difficulty,
          estimatedDuration: p.estimated_duration,
          isActive: p.is_active,
          subjectsCount,
          priority: rec?.priority,
          matchReason: rec?.reason,
        }
      })

      // Sort: Recommended paths first, then by priority
      if (personalityTypeId) {
        formatted.sort((a, b) => {
          if (a.priority && !b.priority) return -1
          if (!a.priority && b.priority) return 1
          if (a.priority && b.priority) return a.priority - b.priority
          return 0
        })
      }

      return formatted
    } catch (err) {
      console.error('Failed to list learning paths:', err)
      throw toAppError(err, 'Gagal memuat katalog jalur belajar.')
    }
  },

  /**
   * Fetches full detail for a single learning path by its slug, including ordered subjects.
   */
  async getLearningPathBySlug(slug: string): Promise<LearningPathDetail | null> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          id,
          title,
          slug,
          description,
          thumbnail_url,
          difficulty,
          estimated_duration,
          is_active,
          learning_path_subjects (
            display_order,
            subject:subjects (
              id,
              name,
              category,
              description
            )
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      type RawPathSubject = {
        display_order: number
        subject: {
          id: string
          name: string
          category: 'general' | 'religious'
          description: string | null
        } | null
      }

      const rawItems = (data.learning_path_subjects as unknown as RawPathSubject[]) || []
      const subjects = rawItems
        .filter((item) => item.subject !== null)
        .sort((a, b) => a.display_order - b.display_order)
        .map((item) => item.subject!)

      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnailUrl: data.thumbnail_url,
        difficulty: data.difficulty,
        estimatedDuration: data.estimated_duration,
        isActive: data.is_active,
        subjectsCount: subjects.length,
        subjects,
      }
    } catch (err) {
      console.error('Failed to get learning path by slug:', err)
      throw toAppError(err, 'Gagal memuat detail jalur belajar.')
    }
  },
}
