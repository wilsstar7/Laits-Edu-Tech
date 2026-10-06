import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router'
import {
  Users,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/ui/ErrorState'
import { TutorFilters } from '@/components/tutor/TutorFilters'
import { TutorCard } from '@/components/tutor/TutorCard'
import { TutorListSkeleton } from '@/components/tutor/TutorSkeletons'
import { BookingDialog } from '@/components/booking/BookingDialog'
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
import type { Booking } from '@/types/booking'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { toast } from 'sonner'

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

  // Booking modal state
  const [bookingModalTutor, setBookingModalTutor] = useState<TutorSummary | null>(null)

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

  // 1. Calculate recommendation scores for all tutors
  const scoredTutors: ScoredTutor[] = useMemo(() => {
    return tutorRecommendationService.rankTutorsForStudent(allTutors, studentProfile)
  }, [allTutors, studentProfile])

  // 2. Client-side filtering with debounced search
  const filteredTutors = useMemo(() => {
    return scoredTutors.filter((tutor) => {
      // Search term
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase()
        const matchName = tutor.fullName.toLowerCase().includes(q)
        const matchHeadline = (tutor.headline || '').toLowerCase().includes(q)
        const matchBio = (tutor.bio || '').toLowerCase().includes(q)
        const matchSubject = tutor.subjects.some((s) => s.name.toLowerCase().includes(q))
        if (!matchName && !matchHeadline && !matchBio && !matchSubject) {
          return false
        }
      }

      // Subject filter
      if (filters.subjectId) {
        const hasSub = tutor.subjects.some((s) => s.id === filters.subjectId)
        if (!hasSub) return false
      }

      // Rating filter
      if (filters.minRating !== null && tutor.rating < filters.minRating) {
        return false
      }

      // Max hourly rate
      if (filters.maxHourlyRate !== null && tutor.hourlyRate > filters.maxHourlyRate) {
        return false
      }

      // Min experience
      if (
        filters.minExperienceYears !== null &&
        tutor.experienceYears < filters.minExperienceYears
      ) {
        return false
      }

      return true
    })
  }, [scoredTutors, filters, debouncedSearch])

  // 3. Client-side sorting
  const sortedTutors = useMemo(() => {
    const list = [...filteredTutors]
    switch (sortOption) {
      case 'recommended':
        return list.sort((a, b) => b.matchScore - a.matchScore)
      case 'rating_desc':
        return list.sort((a, b) => b.rating - a.rating)
      case 'price_asc':
        return list.sort((a, b) => a.hourlyRate - b.hourlyRate)
      case 'price_desc':
        return list.sort((a, b) => b.hourlyRate - a.hourlyRate)
      case 'experience_desc':
        return list.sort((a, b) => b.experienceYears - a.experienceYears)
      default:
        return list
    }
  }, [filteredTutors, sortOption])

  // 4. Pagination
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

  const handleBookingSuccess = (newBooking: Booking) => {
    toast.success('Pemesanan Sesi Berhasil Diajukan!', {
      description: `Sesi dengan ${newBooking.tutorName} untuk mapel ${newBooking.subjectName} berhasil dijadwalkan.`,
    })
  }

  return (
    <AppShell>
      <PageHeader
        title="Temukan Tutor Terpercaya"
        subtitle="Eksplorasi tutor privat berlisensi yang disesuaikan dengan arketipe kepribadian dan gaya belajar Anda."
        badge="Tutor Marketplace"
        action={
          <Link
            to="/student/schedule"
            className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl border border-border bg-white text-ink-primary hover:bg-surface text-xs font-bold transition-colors gap-2 min-h-[44px]"
          >
            <Calendar className="w-4 h-4 text-brand-primary" />
            <span>Lihat Jadwal Saya</span>
          </Link>
        }
      />

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
          {/* Transparency Info Banner */}
          <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-ink-secondary">
              <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-ink-primary">
                  Sistem Pencocokan Transparan:
                </span>{' '}
                Skor rekomendasi dihitung secara objektif berdasarkan kesesuaian mata pelajaran
                (40%), keselarasan gaya mengajar (30%), ketersediaan jadwal (15%), rating (10%),
                dan pengalaman tutor (5%).
              </div>
            </div>
            {studentProfile?.hasResult && (
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-[11px]">
                Arketipe: {studentProfile.personalityName}
              </span>
            )}
          </div>

          {/* Search & Filters Controls */}
          <TutorFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            subjects={subjects}
            totalResults={sortedTutors.length}
          />

          {/* Sort bar + count */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-ink-muted">
              Menampilkan {sortedTutors.length} tutor terdaftar
            </span>

            <div className="flex items-center gap-2">
              <label
                htmlFor="tutor-sort-select"
                className="text-xs text-ink-muted hidden sm:inline"
              >
                Urutkan:
              </label>
              <NativeSelect
                id="tutor-sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as TutorSortOption)}
                className="text-xs min-h-[40px] bg-white w-48"
              >
                <option value="recommended">Rekomendasi Terbaik</option>
                <option value="rating_desc">Rating Tertinggi</option>
                <option value="price_asc">Tarif Terendah</option>
                <option value="price_desc">Tarif Tertinggi</option>
                <option value="experience_desc">Pengalaman Terbanyak</option>
              </NativeSelect>
            </div>
          </div>

          {/* Tutor Cards List */}
          {paginatedTutors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-border space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto text-ink-muted">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-ink-primary">
                Tidak ada tutor yang sesuai dengan kriteria
              </h3>
              <p className="text-xs text-ink-muted max-w-md mx-auto">
                Coba sesuaikan batas tarif, kurangi filter hari, atau gunakan pencarian nama umum untuk melihat lebih banyak pilihan.
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
            <div className="space-y-4">
              {paginatedTutors.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  tutor={tutor}
                  onBook={(t) => setBookingModalTutor(t)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
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

      {/* Booking Dialog Modal */}
      {bookingModalTutor && (
        <BookingDialog
          tutor={bookingModalTutor}
          initialSubjectId={filters.subjectId}
          isOpen={true}
          onClose={() => setBookingModalTutor(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </AppShell>
  )
}
