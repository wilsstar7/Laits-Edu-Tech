import { requireSupabase } from '@/lib/supabase'
import { personalityService } from '@/services/personalityService'
import type {
  LearningProfileOverview,
  RecommendedSubject,
} from '@/types/learning'
import { toAppError } from '@/utils/errors'

export const personalizedLearningService = {
  /**
   * Fetches the student's learning profile overview based on their latest assessment result.
   */
  async getLearningProfile(userId?: string): Promise<LearningProfileOverview> {
    const supabase = requireSupabase()
    try {
      let targetUserId = userId
      if (!targetUserId) {
        const { data: authData } = await supabase.auth.getUser()
        targetUserId = authData.user?.id
      }

      if (!targetUserId) {
        return {
          hasResult: false,
          strengths: [],
          challenges: [],
          recommendedStudyMethods: [],
          recommendedTutorStyles: [],
        }
      }

      const result = await personalityService.getLatestResult(targetUserId)
      if (!result || !result.personality_type) {
        return {
          hasResult: false,
          strengths: [],
          challenges: [],
          recommendedStudyMethods: [],
          recommendedTutorStyles: [],
        }
      }

      const p = result.personality_type
      return {
        hasResult: true,
        personalityTypeId: p.id,
        personalityCode: p.code,
        personalityName: p.name,
        description: p.description,
        learningStyle: p.learning_style,
        motivation: p.motivation,
        communicationStyle: p.communication_style,
        strengths: Array.isArray(p.strengths) ? p.strengths : [],
        challenges: Array.isArray(p.challenges) ? p.challenges : [],
        recommendedStudyMethods: Array.isArray(p.recommended_study_method)
          ? p.recommended_study_method
          : [],
        recommendedTutorStyles: Array.isArray(p.recommended_tutor_style)
          ? p.recommended_tutor_style
          : [],
      }
    } catch (err) {
      console.error('Failed to get learning profile:', err)
      throw toAppError(err, 'Gagal memuat profil belajar siswa.')
    }
  },

  /**
   * Fetches subjects recommended for a specific personality type or defaults to top subjects.
   */
  async getRecommendedSubjects(
    personalityTypeId?: string
  ): Promise<RecommendedSubject[]> {
    const supabase = requireSupabase()

    try {
      if (personalityTypeId) {
        const { data: mappingData, error: mappingError } = await supabase
          .from('personality_type_subjects')
          .select('id, subject_id, priority, reason')
          .eq('personality_type_id', personalityTypeId)
          .order('priority', { ascending: true })

        if (mappingError) throw mappingError

        if (mappingData && mappingData.length > 0) {
          const subjectIds = mappingData.map((m) => m.subject_id)
          const { data: subjectList, error: subjErr } = await supabase
            .from('subjects')
            .select('id, name, category, description')
            .in('id', subjectIds)

          if (subjErr) throw subjErr

          const subjectMap = new Map((subjectList || []).map((s) => [s.id, s]))

          return mappingData
            .filter((item) => subjectMap.has(item.subject_id))
            .map((item) => {
              const sub = subjectMap.get(item.subject_id)!
              return {
                id: item.id,
                subjectId: sub.id,
                name: sub.name,
                category: sub.category,
                description: sub.description,
                priority: item.priority,
                reason: item.reason,
              }
            })
        }
      }

      // Fallback: Return active subjects with general recommendation
      const { data: defaultSubjects, error: subError } = await supabase
        .from('subjects')
        .select('id, name, category, description')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(6)

      if (subError) throw subError

      return (defaultSubjects || []).map((sub, index) => ({
        id: sub.id,
        subjectId: sub.id,
        name: sub.name,
        category: sub.category,
        description: sub.description,
        priority: index + 1,
        reason: 'Pilihan mata pelajaran inti untuk penguatan fondasi belajar Anda.',
      }))
    } catch (err) {
      console.error('Failed to get recommended subjects:', err)
      throw toAppError(err, 'Gagal memuat rekomendasi mata pelajaran.')
    }
  },
}
