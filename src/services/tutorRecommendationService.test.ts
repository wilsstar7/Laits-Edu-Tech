import { describe, it, expect } from 'vitest'
import { tutorRecommendationService } from './tutorRecommendationService'
import type { TutorSummary } from '@/types/tutor'
import type { LearningProfileOverview } from '@/types/learning'

const MOCK_TUTORS: TutorSummary[] = [
  {
    id: 'tutor-1',
    userId: 'user-1',
    fullName: 'Farhan Ramadhan, M.Pd.',
    email: 'farhan@example.com',
    avatarUrl: null,
    headline: 'Spesialis Matematika & Penalaran Logis',
    bio: 'Berpengalaman membimbing konsep matematika analitis.',
    educationBackground: 'S2 Pendidikan Matematika',
    experience: '8 tahun mengajar',
    experienceYears: 8,
    teachingStyle: 'Analitis, terstruktur, sistematis berbasis pembuktian konsep',
    hourlyRate: 85000,
    rating: 4.9,
    totalReviews: 24,
    isVerified: true,
    subjects: [
      { id: 'sub-matematika', name: 'Matematika', category: 'general', description: null },
      { id: 'sub-fisika', name: 'Fisika', category: 'general', description: null },
    ],
    availabilityCount: 5,
  },
  {
    id: 'tutor-2',
    userId: 'user-2',
    fullName: 'Sarah Amalia, S.Pd.',
    email: 'sarah@example.com',
    avatarUrl: null,
    headline: 'Guru Bahasa & Komunikasi Interaktif',
    bio: 'Menekankan dialog interaktif, diskusi kelompok, dan simulasi.',
    educationBackground: 'S1 Sastra Inggris',
    experience: '3 tahun mengajar',
    experienceYears: 3,
    teachingStyle: 'Komunikatif, interaktif, diskusi santai dan aplikatif',
    hourlyRate: 65000,
    rating: 4.7,
    totalReviews: 14,
    isVerified: true,
    subjects: [
      { id: 'sub-inggris', name: 'Bahasa Inggris', category: 'general', description: null },
    ],
    availabilityCount: 2,
  },
]

describe('tutorRecommendationService', () => {
  it('ranks tutors with baseline verified scoring when student has no personality result', () => {
    const unassessedProfile: LearningProfileOverview = {
      hasResult: false,
      strengths: [],
      challenges: [],
      recommendedStudyMethods: [],
      recommendedTutorStyles: [],
    }

    const ranked = tutorRecommendationService.rankTutorsForStudent(MOCK_TUTORS, unassessedProfile)
    expect(ranked).toHaveLength(2)
    const firstUnassessed = ranked[0]!
    expect(firstUnassessed.matchScore).toBeGreaterThanOrEqual(40)
    expect(firstUnassessed.matchReasons.length).toBeGreaterThan(0)
  })

  it('prioritizes tutors whose teaching style matches student personality profile', () => {
    const analystStudentProfile: LearningProfileOverview = {
      hasResult: true,
      personalityCode: 'ANALYST',
      personalityName: 'The Analyst',
      learningStyle: 'Analitis dan Logis',
      strengths: ['Pemecahan Masalah', 'Logika Berpikir'],
      challenges: ['Ragu saat asumsi tidak jelas'],
      recommendedStudyMethods: ['Latihan Pembuktian', 'Pemetaan Konsep'],
      recommendedTutorStyles: ['Sistematis dan terstruktur', 'Penjelasan berbasis data dan logika'],
    }

    const ranked = tutorRecommendationService.rankTutorsForStudent(MOCK_TUTORS, analystStudentProfile)

    // Farhan has teaching style "Analitis, terstruktur, sistematis" -> should score highest
    const firstTutor = ranked[0]!
    const secondTutor = ranked[1]!
    expect(firstTutor.id).toBe('tutor-1')
    expect(firstTutor.matchScore).toBeGreaterThan(secondTutor.matchScore)
    expect(firstTutor.matchReasons.some((r) => r.includes('gaya belajar'))).toBe(true)
  })

  it('clamps match score between 45 and 98 to avoid deceptive 100% determinism claims', () => {
    const profile: LearningProfileOverview = {
      hasResult: true,
      personalityCode: 'EXPLORER',
      personalityName: 'The Explorer',
      learningStyle: 'Eksploratif',
      strengths: ['Kreatif'],
      challenges: ['Mudah Bosan'],
      recommendedStudyMethods: ['Diskusi Terbuka'],
      recommendedTutorStyles: ['Komunikatif dan santai'],
    }

    const ranked = tutorRecommendationService.rankTutorsForStudent(MOCK_TUTORS, profile)
    for (const tutor of ranked) {
      expect(tutor.matchScore).toBeGreaterThanOrEqual(45)
      expect(tutor.matchScore).toBeLessThanOrEqual(98)
    }
  })
})
