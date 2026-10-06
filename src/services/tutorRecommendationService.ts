import type { TutorSummary } from '@/types/tutor'
import type { LearningProfileOverview } from '@/types/learning'
import { TUTOR_MATCH_WEIGHTS } from '@/types/tutor'

export interface ScoredTutor extends TutorSummary {
  matchScore: number
  matchReasons: string[]
}

export const tutorRecommendationService = {
  /**
   * Transparent matching engine using configurable weights.
   * Matches tutor attributes against student's personality learning profile.
   */
  rankTutorsForStudent(
    tutors: TutorSummary[],
    studentProfile: LearningProfileOverview | null
  ): ScoredTutor[] {
    if (!studentProfile || !studentProfile.hasResult) {
      return tutors.map((t) => ({
        ...t,
        matchScore: Math.round(((t.rating / 5) * 60) + (t.isVerified ? 40 : 20)),
        matchReasons: t.isVerified
          ? ['Pendidik terverifikasi dengan ulasan positif']
          : ['Tutor aktif dengan kualifikasi bimbingan teruji'],
      }))
    }

    const {
      recommendedTutorStyles = [],
      learningStyle = '',
    } = studentProfile

    return tutors
      .map((tutor) => {
        const reasons: string[] = []

        // 1. Subject match (40% weight)
        let subjectScore = 0.5 // baseline
        // If tutor teaches any subject
        if (tutor.subjects.length > 0) {
          subjectScore = 0.85
          const subjectNames = tutor.subjects.map((s) => s.name).slice(0, 2).join(' & ')
          reasons.push(`Mengampu mata pelajaran spesialisasi (${subjectNames})`)
        }

        // 2. Teaching style heuristic match (30% weight)
        let styleScore: number
        const tutorStyleStr = (
          (tutor.teachingStyle || '') + ' ' + (tutor.bio || '')
        ).toLowerCase()

        let matchedStyleCount = 0
        for (const pref of recommendedTutorStyles) {
          const keywords = pref.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
          for (const kw of keywords) {
            if (tutorStyleStr.includes(kw)) {
              matchedStyleCount += 1
              break
            }
          }
        }

        if (matchedStyleCount > 0 || (learningStyle && tutorStyleStr.includes(learningStyle.toLowerCase().slice(0, 6)))) {
          styleScore = 0.95
          reasons.push('Pendekatan mengajar selaras dengan preferensi gaya belajar Anda')
        } else {
          styleScore = 0.65
        }

        // 3. Availability match (15% weight)
        let availScore = 0.4
        if ((tutor.availabilityCount ?? 0) >= 3) {
          availScore = 1.0
          reasons.push('Memiliki jadwal ketersediaan bimbingan yang fleksibel')
        } else if ((tutor.availabilityCount ?? 0) > 0) {
          availScore = 0.75
        }

        // 4. Rating (10% weight)
        const ratingScore = Math.min(Math.max(tutor.rating / 5, 0), 1)
        if (tutor.rating >= 4.8) {
          reasons.push(`Rating bimbingan sangat tinggi (${tutor.rating.toFixed(1)} dari 5.0)`)
        }

        // 5. Experience (5% weight)
        const expScore = Math.min(tutor.experienceYears / 10, 1)

        // Weighted sum calculation
        const totalScoreRaw =
          subjectScore * TUTOR_MATCH_WEIGHTS.subjectMatch +
          styleScore * TUTOR_MATCH_WEIGHTS.teachingStyleMatch +
          availScore * TUTOR_MATCH_WEIGHTS.availabilityMatch +
          ratingScore * TUTOR_MATCH_WEIGHTS.rating +
          expScore * TUTOR_MATCH_WEIGHTS.experience

        const normalizedScore = Math.min(Math.max(Math.round(totalScoreRaw * 100), 45), 98)

        return {
          ...tutor,
          matchScore: normalizedScore,
          matchReasons: reasons.slice(0, 3),
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  },
}
