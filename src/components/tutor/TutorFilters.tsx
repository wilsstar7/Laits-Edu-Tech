import { useState } from 'react'
import {
  Search,
  Filter,
  RotateCcw,
  Star,
  Clock,
  DollarSign,
  Calendar,
  X,
} from 'lucide-react'
import type { TutorFilterState } from '@/types/tutor'
import type { SubjectSummary } from '@/services/subjectService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

interface TutorFiltersProps {
  filters: TutorFilterState
  onChange: (filters: TutorFilterState) => void
  onReset: () => void
  subjects: SubjectSummary[]
  totalResults?: number
}

const DAY_OPTIONS = [
  { value: '', label: 'Semua Hari' },
  { value: '1', label: 'Senin' },
  { value: '2', label: 'Selasa' },
  { value: '3', label: 'Rabu' },
  { value: '4', label: 'Kamis' },
  { value: '5', label: 'Jumat' },
  { value: '6', label: 'Sabtu' },
  { value: '0', label: 'Minggu' },
]

const RATING_OPTIONS = [
  { value: '', label: 'Semua Rating' },
  { value: '4.8', label: '4.8 ke atas' },
  { value: '4.5', label: '4.5 ke atas' },
  { value: '4.0', label: '4.0 ke atas' },
]

const EXP_OPTIONS = [
  { value: '', label: 'Semua Pengalaman' },
  { value: '1', label: '1+ tahun' },
  { value: '3', label: '3+ tahun' },
  { value: '5', label: '5+ tahun' },
]

const RATE_OPTIONS = [
  { value: '', label: 'Semua Tarif' },
  { value: '50000', label: 'Hingga Rp 50.000 / jam' },
  { value: '75000', label: 'Hingga Rp 75.000 / jam' },
  { value: '100000', label: 'Hingga Rp 100.000 / jam' },
  { value: '150000', label: 'Hingga Rp 150.000 / jam' },
]

export function TutorFilters({
  filters,
  onChange,
  onReset,
  subjects,
  totalResults,
}: TutorFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Count active filters (excluding search)
  const activeFilterCount = [
    filters.subjectId !== '',
    filters.minRating !== null,
    filters.maxHourlyRate !== null,
    filters.teachingStyle !== '',
    filters.minExperienceYears !== null,
    filters.availableDay !== null,
  ].filter(Boolean).length

  const handleSearchChange = (val: string) => {
    onChange({ ...filters, search: val })
  }

  const handleSubjectChange = (val: string) => {
    onChange({ ...filters, subjectId: val })
  }

  const handleRatingChange = (val: string) => {
    onChange({
      ...filters,
      minRating: val ? parseFloat(val) : null,
    })
  }

  const handleRateChange = (val: string) => {
    onChange({
      ...filters,
      maxHourlyRate: val ? parseInt(val, 10) : null,
    })
  }

  const handleExpChange = (val: string) => {
    onChange({
      ...filters,
      minExperienceYears: val ? parseInt(val, 10) : null,
    })
  }

  const handleDayChange = (val: string) => {
    onChange({
      ...filters,
      availableDay: val !== '' ? parseInt(val, 10) : null,
    })
  }

  const selectedSubject = subjects.find((s) => s.id === filters.subjectId)

  const filterControls = (
    <div className="space-y-4">
      {/* Subject Filter */}
      <div>
        <label
          htmlFor="subject-filter"
          className="block text-xs font-semibold text-ink-primary mb-1.5"
        >
          Mata Pelajaran
        </label>
        <NativeSelect
          id="subject-filter"
          value={filters.subjectId}
          onChange={(e) => handleSubjectChange(e.target.value)}
          className="w-full min-h-[44px]"
        >
          <option value="">Semua Mata Pelajaran</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name} ({sub.category})
            </option>
          ))}
        </NativeSelect>
      </div>

      {/* Available Day */}
      <div>
        <label
          htmlFor="day-filter"
          className="block text-xs font-semibold text-ink-primary mb-1.5"
        >
          Hari Ketersediaan
        </label>
        <NativeSelect
          id="day-filter"
          value={filters.availableDay !== null ? filters.availableDay.toString() : ''}
          onChange={(e) => handleDayChange(e.target.value)}
          className="w-full min-h-[44px]"
        >
          {DAY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      {/* Minimum Rating */}
      <div>
        <label
          htmlFor="rating-filter"
          className="block text-xs font-semibold text-ink-primary mb-1.5"
        >
          Rating Tutor
        </label>
        <NativeSelect
          id="rating-filter"
          value={filters.minRating !== null ? filters.minRating.toString() : ''}
          onChange={(e) => handleRatingChange(e.target.value)}
          className="w-full min-h-[44px]"
        >
          {RATING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      {/* Max Hourly Rate */}
      <div>
        <label
          htmlFor="rate-filter"
          className="block text-xs font-semibold text-ink-primary mb-1.5"
        >
          Batas Tarif Per Jam
        </label>
        <NativeSelect
          id="rate-filter"
          value={filters.maxHourlyRate !== null ? filters.maxHourlyRate.toString() : ''}
          onChange={(e) => handleRateChange(e.target.value)}
          className="w-full min-h-[44px]"
        >
          {RATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      {/* Minimum Experience */}
      <div>
        <label
          htmlFor="exp-filter"
          className="block text-xs font-semibold text-ink-primary mb-1.5"
        >
          Pengalaman Mengajar
        </label>
        <NativeSelect
          id="exp-filter"
          value={filters.minExperienceYears !== null ? filters.minExperienceYears.toString() : ''}
          onChange={(e) => handleExpChange(e.target.value)}
          className="w-full min-h-[44px]"
        >
          {EXP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onReset()
            setMobileOpen(false)
          }}
          className="w-full min-h-[44px] text-ink-muted hover:text-ink-primary gap-2 mt-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Semua Filter ({activeFilterCount})
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Search Bar + Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <Input
            id="tutor-search-input"
            type="search"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari tutor berdasarkan nama, keahlian, atau gaya mengajar..."
            className="pl-10 min-h-[44px] bg-white border-border"
          />
        </div>

        {/* Mobile Filter Button */}
        <div className="sm:hidden flex gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full min-h-[44px] gap-2 border-border font-medium"
              >
                <Filter className="w-4 h-4" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-brand-primary text-white text-xs px-1.5 py-0.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto p-6">
              <SheetHeader className="text-left mb-4">
                <SheetTitle className="text-lg font-bold text-ink-primary">
                  Filter Pencarian Tutor
                </SheetTitle>
                <SheetDescription className="text-xs text-ink-muted">
                  Saring tutor berdasarkan mata pelajaran, ketersediaan jadwal, tarif, dan pengalaman.
                </SheetDescription>
              </SheetHeader>
              {filterControls}
              <div className="mt-6 pt-4 border-t border-border">
                <Button
                  className="w-full min-h-[44px] bg-brand-primary text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Terapkan Filter
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Filter Bar (Horizontal Quick Selectors) */}
      <div className="hidden sm:flex flex-wrap items-center gap-3 p-3 bg-surface rounded-xl border border-border">
        {/* Subject */}
        <div className="w-48">
          <NativeSelect
            value={filters.subjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full min-h-[40px] text-xs bg-white"
          >
            <option value="">Semua Mapel</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Day */}
        <div className="w-36">
          <NativeSelect
            value={filters.availableDay !== null ? filters.availableDay.toString() : ''}
            onChange={(e) => handleDayChange(e.target.value)}
            className="w-full min-h-[40px] text-xs bg-white"
          >
            {DAY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Rating */}
        <div className="w-36">
          <NativeSelect
            value={filters.minRating !== null ? filters.minRating.toString() : ''}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-full min-h-[40px] text-xs bg-white"
          >
            {RATING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Hourly Rate */}
        <div className="w-44">
          <NativeSelect
            value={filters.maxHourlyRate !== null ? filters.maxHourlyRate.toString() : ''}
            onChange={(e) => handleRateChange(e.target.value)}
            className="w-full min-h-[40px] text-xs bg-white"
          >
            {RATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Experience */}
        <div className="w-36">
          <NativeSelect
            value={filters.minExperienceYears !== null ? filters.minExperienceYears.toString() : ''}
            onChange={(e) => handleExpChange(e.target.value)}
            className="w-full min-h-[40px] text-xs bg-white"
          >
            {EXP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-ink-muted hover:text-ink-primary gap-1.5 h-10 px-2.5 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-ink-muted">Filter aktif:</span>
          {selectedSubject && (
            <Badge variant="outline" className="gap-1 bg-brand-primary/5 border-brand-primary/20 text-brand-primary text-xs">
              Mapel: {selectedSubject.name}
              <button
                type="button"
                onClick={() => handleSubjectChange('')}
                className="hover:opacity-75 focus:outline-none"
                aria-label="Hapus filter mapel"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.availableDay !== null && (
            <Badge variant="outline" className="gap-1 bg-surface border-border text-ink-secondary text-xs">
              <Calendar className="w-3 h-3" />
              Hari: {DAY_OPTIONS.find((d) => d.value === filters.availableDay?.toString())?.label}
              <button
                type="button"
                onClick={() => handleDayChange('')}
                className="hover:opacity-75 focus:outline-none"
                aria-label="Hapus filter hari"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.minRating !== null && (
            <Badge variant="outline" className="gap-1 bg-surface border-border text-ink-secondary text-xs">
              <Star className="w-3 h-3 text-warning fill-warning" />
              Rating {filters.minRating}+
              <button
                type="button"
                onClick={() => handleRatingChange('')}
                className="hover:opacity-75 focus:outline-none"
                aria-label="Hapus filter rating"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.maxHourlyRate !== null && (
            <Badge variant="outline" className="gap-1 bg-surface border-border text-ink-secondary text-xs">
              <DollarSign className="w-3 h-3" />
              Maks: Rp {filters.maxHourlyRate.toLocaleString('id-ID')}
              <button
                type="button"
                onClick={() => handleRateChange('')}
                className="hover:opacity-75 focus:outline-none"
                aria-label="Hapus filter tarif"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.minExperienceYears !== null && (
            <Badge variant="outline" className="gap-1 bg-surface border-border text-ink-secondary text-xs">
              <Clock className="w-3 h-3" />
              Pengalaman {filters.minExperienceYears}+ thn
              <button
                type="button"
                onClick={() => handleExpChange('')}
                className="hover:opacity-75 focus:outline-none"
                aria-label="Hapus filter pengalaman"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Result Count Feedback */}
      {typeof totalResults === 'number' && (
        <div className="flex items-center justify-between text-xs text-ink-muted px-1">
          <span>
            Menampilkan <strong className="text-ink-primary font-semibold">{totalResults}</strong> tutor
            {activeFilterCount > 0 ? ' sesuai kriteria' : ' tersedia'}
          </span>
        </div>
      )}
    </div>
  )
}
