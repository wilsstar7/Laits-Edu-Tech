import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router'
import {
  Users,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorState } from '@/components/ui/ErrorState'
import { TutorFilters } from '@/components/tutor/TutorFilters'
import { TutorCard } from '@/components/tutor/TutorCard'
import { TutorListSkeleton } from '@/components/tutor/TutorSkeletons'
import { tutorService } from '@/services/tutorService'
import { subjectService, type SubjectSummary } from '@/services/subjectService'
import { personalizedLearningService } from '@/services/personalizedLearningService'
import {
  tutorRecommendationService,
  type ScoredTutor,
} from '@/services/tutorRecommendationService'
import type {
  TutorSummary,
  TutorFilterState,
  TutorSortOption,
} from '@/types/tutor'
import type { LearningProfileOverview } from '@/types/learning'
import { Button } from '@/components/ui/button'

import { useDebounce } from '@/hooks/useDebounce'

const INITIAL_FILTERS: TutorFilterState = {
  search: '',
  subjectId: '',
  minRating: null,
  maxHourlyRate: null,
  teachingStyle: '',
  minExperienceYears: null,
  availableDay: null,
}

const ITEMS_PER_PAGE = 6

export function TutorDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSubjectParam = searchParams.get('subjectId') || ''

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [allTutors, setAllTutors] = useState<TutorSummary[]>([])
  const [subjects, setSubjects] = useState<SubjectSummary[]>([])
  const [studentProfile, setStudentProfile] = useState<LearningProfileOverview | null>(null)

  // Filter & sort state
  const [filters, setFilters] = useState<TutorFilterState>({
    ...INITIAL_FILTERS,
    subjectId: initialSubjectParam,
  })
  const debouncedSearch = useDebounce(filters.search, 300)
  const [sortOption, setSortOption] = useState<TutorSortOption>('recommended')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const [tutorsData, subjectsData, profileData] = await Promise.all([
          tutorService.listTutors(),
          subjectService.listActiveSubjects(),
          personalizedLearningService.getLearningProfile(),
        ])
        if (isMounted) {
          setAllTutors(tutorsData.tutors)
          setSubjects(subjectsData)
          setStudentProfile(profileData)
        }
      } catch (err: unknown) {
        console.error('Failed to load tutor discovery data:', err)
        if (isMounted) {
          setErrorMsg(
            err instanceof Error ? err.message : 'Gagal memuat katalog tutor. Silakan coba kembali.'
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()
    return () => {
      isMounted = false
    }
  }, [])

  const reloadData = () => {
    setLoading(true)
    setErrorMsg(null)
    Promise.all([
      tutorService.listTutors(),
      subjectService.listActiveSubjects(),
      personalizedLearningService.getLearningProfile(),
    ])
      .then(([tutorsData, subjectsData, profileData]) => {
        setAllTutors(tutorsData.tutors)
        setSubjects(subjectsData)
        setStudentProfile(profileData)
      })
      .catch((err) => {
        setErrorMsg(
          err instanceof Error ? err.message : 'Gagal memuat katalog tutor. Silakan coba kembali.'
        )
      })
      .finally(() => setLoading(false))
  }

  const scoredTutors: ScoredTutor[] = useMemo(() => {
    return tutorRecommendationService.rankTutorsForStudent(allTutors, studentProfile)
  }, [allTutors, studentProfile])

  const filteredTutors = useMemo(() => {
    return scoredTutors.filter((tutor) => {
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim().toLowerCase()
        const matchName = tutor.fullName.toLowerCase().includes(q)
        const matchHeadline = (tutor.headline || '').toLowerCase().includes(q)
        const matchStyle = (tutor.teachingStyle || '').toLowerCase().includes(q)
        const matchBio = (tutor.bio || '').toLowerCase().includes(q)
        const matchSubject = tutor.subjects.some((s) => s.name.toLowerCase().includes(q))
        if (!matchName && !matchHeadline && !matchStyle && !matchBio && !matchSubject) {
          return false
        }
      }

      if (filters.subjectId) {
        const hasSub = tutor.subjects.some((s) => s.id === filters.subjectId)
        if (!hasSub) return false
      }

      if (filters.availableDay !== null && !tutor.availableDays?.includes(filters.availableDay)) {
        return false
      }

      if (filters.minRating !== null && tutor.rating < filters.minRating) {
        return false
      }

      if (
        filters.minExperienceYears !== null &&
        tutor.experienceYears < filters.minExperienceYears
      ) {
        return false
      }

      return true
    })
  }, [scoredTutors, filters, debouncedSearch])

  const sortedTutors = useMemo(() => {
    const list = [...filteredTutors]
    switch (sortOption) {
      case 'recommended':
        return list.sort((a, b) => b.matchScore - a.matchScore)
      case 'rating_desc':
        return list.sort((a, b) => b.rating - a.rating)
      case 'experience_desc':
        return list.sort((a, b) => b.experienceYears - a.experienceYears)
      default:
        return list
    }
  }, [filteredTutors, sortOption])

  const totalPages = Math.ceil(sortedTutors.length / ITEMS_PER_PAGE) || 1
  const paginatedTutors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedTutors.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedTutors, currentPage])

  // Handle filter changes
  const handleFilterChange = (newFilters: TutorFilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    if (newFilters.subjectId) {
      setSearchParams({ subjectId: newFilters.subjectId })
    } else {
      setSearchParams({})
    }
  }

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setCurrentPage(1)
    setSearchParams({})
  }

  return (
    <AppShell>
      <header className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">Tutor Privat</h1>
          <p className="max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Kenali tutor dan mata pelajaran yang mereka ajarkan. Tim ZEINBOX akan menetapkan tutor untuk program les Anda.
          </p>
        </div>
        <Button asChild className="min-h-11 w-fit shrink-0 rounded-lg px-4">
          <Link to="/student/payments">
            Pilih Jumlah Sesi <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </header>

      {loading ? (
        <div className="space-y-6">
          <TutorListSkeleton count={4} />
        </div>
      ) : errorMsg ? (
        <ErrorState
          title="Kendala Memuat Daftar Tutor"
          message={errorMsg}
          onRetry={reloadData}
        />
      ) : (
        <div className="space-y-6">
          <TutorFilters filters={filters} onChange={handleFilterChange} onReset={handleResetFilters}
            subjects={subjects} sort={sortOption} onSortChange={(sort) => {
              setSortOption(sort)
              setCurrentPage(1)
            }} />

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border pb-3">
            <h2 className="font-bold text-ink-primary" aria-live="polite">{sortedTutors.length} tutor</h2>
            <details className="max-w-lg text-sm text-ink-muted">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-brand-primary marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="underline decoration-brand-primary/30 underline-offset-4">Cara menghitung kesesuaian</span>
              </summary>
              <p className="pb-2 leading-relaxed">
                Skor menggabungkan mata pelajaran (40%), gaya mengajar (30%), ketersediaan (15%), penilaian (10%), dan pengalaman (5%).
              </p>
              {studentProfile?.hasResult && <p className="pb-2">Profil belajar Anda · {studentProfile.personalityName}</p>}
            </details>
          </div>

          {paginatedTutors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-border space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto text-ink-muted">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-ink-primary">
                Tidak ada tutor yang sesuai dengan kriteria
              </h3>
              <p className="text-xs text-ink-muted max-w-md mx-auto">
                Coba nama lain atau kurangi filter untuk melihat lebih banyak tutor.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="min-h-[44px] text-xs font-semibold"
              >
                Reset Semua Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedTutors.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  tutor={tutor}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <span className="text-xs text-ink-muted">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="min-h-[44px] gap-1 px-3 text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="min-h-[44px] gap-1 px-3 text-xs"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

    </AppShell>
  )
}
