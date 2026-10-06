import { requireSupabase } from '@/lib/supabase'
import type { TutorSummary, TutorFilterState, TutorSortOption } from '@/types/tutor'
import type { SubjectSummary } from '@/services/subjectService'
import { toAppError } from '@/utils/errors'

export interface ListTutorsParams {
  filters?: Partial<TutorFilterState>
  sortBy?: TutorSortOption
  page?: number
  limit?: number
}

export interface ListTutorsResponse {
  tutors: TutorSummary[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export const tutorService = {
  /**
   * Lists tutors with batch join for subjects and availability rules (avoids N+1 query problem).
   */
  async listTutors(params: ListTutorsParams = {}): Promise<ListTutorsResponse> {
    const supabase = requireSupabase()
    const { filters = {}, sortBy = 'recommended', page = 1, limit = 20 } = params

    try {
      // 1. Build base query with joined profile & subjects
      let query = supabase
        .from('tutor_profiles')
        .select(`
          id,
          user_id,
          bio,
          headline,
          education_background,
          experience,
          experience_years,
          teaching_style,
          hourly_rate,
          rating,
          total_reviews,
          is_verified,
          is_active,
          created_at,
          profile:profiles!inner (
            full_name,
            email,
            avatar_url
          ),
          tutor_subjects (
            subject:subjects (
              id,
              name,
              category,
              description
            )
          ),
          tutor_availability (
            day_of_week,
            is_active
          )
        `, { count: 'exact' })
        .eq('is_active', true)

      // 2. Filters
      if (filters.minRating && filters.minRating > 0) {
        query = query.gte('rating', filters.minRating)
      }

      if (filters.maxHourlyRate && filters.maxHourlyRate > 0) {
        query = query.lte('hourly_rate', filters.maxHourlyRate)
      }

      if (filters.minExperienceYears && filters.minExperienceYears > 0) {
        query = query.gte('experience_years', filters.minExperienceYears)
      }

      // Sorting
      switch (sortBy) {
        case 'rating_desc':
          query = query.order('rating', { ascending: false }).order('total_reviews', { ascending: false })
          break
        case 'price_asc':
          query = query.order('hourly_rate', { ascending: true })
          break
        case 'price_desc':
          query = query.order('hourly_rate', { ascending: false })
          break
        case 'experience_desc':
          query = query.order('experience_years', { ascending: false })
          break
        case 'recommended':
        default:
          query = query
            .order('is_verified', { ascending: false })
            .order('rating', { ascending: false })
            .order('total_reviews', { ascending: false })
          break
      }

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, count, error } = await query
      if (error) throw error

      type RawTutorRow = {
        id: string
        user_id: string
        bio: string | null
        headline: string | null
        education_background: string | null
        experience: string | null
        experience_years: number
        teaching_style: string | null
        hourly_rate: number | null
        rating: number
        total_reviews: number
        is_verified: boolean
        is_active: boolean
        created_at: string
        profile: {
          full_name: string
          email: string
          avatar_url: string | null
        }
        tutor_subjects: Array<{
          subject: {
            id: string
            name: string
            category: 'general' | 'religious'
            description: string | null
          } | null
        }>
        tutor_availability: Array<{
          day_of_week: number
          is_active: boolean
        }>
      }

      const rawRows = (data as unknown as RawTutorRow[]) || []

      // 3. Transform and apply memory filter for subject / search if needed
      let formatted: TutorSummary[] = rawRows.map((r) => {
        const subjects: SubjectSummary[] = (r.tutor_subjects || [])
          .filter((ts) => ts.subject !== null)
          .map((ts) => ({
            id: ts.subject!.id,
            name: ts.subject!.name,
            category: ts.subject!.category,
            description: ts.subject!.description,
          }))

        const activeAvailCount = (r.tutor_availability || []).filter((a) => a.is_active).length

        return {
          id: r.id,
          userId: r.user_id,
          fullName: r.profile?.full_name || 'Tutor Laits',
          email: r.profile?.email || '',
          avatarUrl: r.profile?.avatar_url || null,
          headline: r.headline,
          bio: r.bio,
          educationBackground: r.education_background,
          experience: r.experience,
          experienceYears: r.experience_years || 0,
          teachingStyle: r.teaching_style,
          hourlyRate: Number(r.hourly_rate || 0),
          rating: Number(r.rating || 0),
          totalReviews: r.total_reviews || 0,
          isVerified: Boolean(r.is_verified),
          subjects,
          availabilityCount: activeAvailCount,
        }
      })

      // Client-side / relation filtering for search and subjectId
      if (filters.subjectId) {
        formatted = formatted.filter((t) =>
          t.subjects.some((s) => s.id === filters.subjectId)
        )
      }

      if (filters.search && filters.search.trim().length > 0) {
        const q = filters.search.toLowerCase().trim()
        formatted = formatted.filter(
          (t) =>
            t.fullName.toLowerCase().includes(q) ||
            (t.headline && t.headline.toLowerCase().includes(q)) ||
            (t.bio && t.bio.toLowerCase().includes(q)) ||
            t.subjects.some((s) => s.name.toLowerCase().includes(q))
        )
      }

      if (filters.availableDay !== undefined && filters.availableDay !== null) {
        formatted = formatted.filter((t) => {
          const original = rawRows.find((r) => r.id === t.id)
          return (original?.tutor_availability || []).some(
            (a) => a.is_active && a.day_of_week === filters.availableDay
          )
        })
      }

      return {
        tutors: formatted,
        total: count ?? formatted.length,
        page,
        limit,
        hasMore: (count ?? 0) > page * limit,
      }
    } catch (err) {
      console.error('Failed to list tutors:', err)
      throw toAppError(err, 'Gagal memuat katalog tutor bimbingan.')
    }
  },

  /**
   * Fetches single tutor details by tutor profile id.
   */
  async getTutorById(tutorId: string): Promise<TutorSummary | null> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select(`
          id,
          user_id,
          bio,
          headline,
          education_background,
          experience,
          experience_years,
          teaching_style,
          hourly_rate,
          rating,
          total_reviews,
          is_verified,
          is_active,
          created_at,
          profile:profiles!inner (
            full_name,
            email,
            avatar_url
          ),
          tutor_subjects (
            subject:subjects (
              id,
              name,
              category,
              description
            )
          ),
          tutor_availability (
            day_of_week,
            is_active
          )
        `)
        .eq('id', tutorId)
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      type RawTutorDetail = {
        id: string
        user_id: string
        bio: string | null
        headline: string | null
        education_background: string | null
        experience: string | null
        experience_years: number
        teaching_style: string | null
        hourly_rate: number | null
        rating: number
        total_reviews: number
        is_verified: boolean
        is_active: boolean
        profile: {
          full_name: string
          email: string
          avatar_url: string | null
        }
        tutor_subjects: Array<{
          subject: {
            id: string
            name: string
            category: 'general' | 'religious'
            description: string | null
          } | null
        }>
        tutor_availability: Array<{
          day_of_week: number
          is_active: boolean
        }>
      }

      const r = data as unknown as RawTutorDetail
      const subjects: SubjectSummary[] = (r.tutor_subjects || [])
        .filter((ts) => ts.subject !== null)
        .map((ts) => ({
          id: ts.subject!.id,
          name: ts.subject!.name,
          category: ts.subject!.category,
          description: ts.subject!.description,
        }))

      const activeAvailCount = (r.tutor_availability || []).filter((a) => a.is_active).length

      return {
        id: r.id,
        userId: r.user_id,
        fullName: r.profile?.full_name || 'Tutor Laits',
        email: r.profile?.email || '',
        avatarUrl: r.profile?.avatar_url || null,
        headline: r.headline,
        bio: r.bio,
        educationBackground: r.education_background,
        experience: r.experience,
        experienceYears: r.experience_years || 0,
        teachingStyle: r.teaching_style,
        hourlyRate: Number(r.hourly_rate || 0),
        rating: Number(r.rating || 0),
        totalReviews: r.total_reviews || 0,
        isVerified: Boolean(r.is_verified),
        subjects,
        availabilityCount: activeAvailCount,
      }
    } catch (err) {
      console.error('Failed to get tutor by id:', err)
      throw toAppError(err, 'Gagal memuat profil tutor.')
    }
  },
}
