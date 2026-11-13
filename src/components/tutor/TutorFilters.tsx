import { Search } from 'lucide-react'
import type { TutorFilterState, TutorSortOption } from '@/types/tutor'
import type { SubjectSummary } from '@/services/subjectService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'

interface TutorFiltersProps {
  filters: TutorFilterState
  onChange: (filters: TutorFilterState) => void
  onReset: () => void
  subjects: SubjectSummary[]
  sort: TutorSortOption
  onSortChange: (sort: TutorSortOption) => void
}

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function optionalNumber(value: string) {
  return value === '' ? null : Number(value)
}

export function TutorFilters({ filters, onChange, onReset, subjects, sort, onSortChange }: TutorFiltersProps) {
  const hasFilters = Boolean(filters.search || filters.subjectId || filters.minRating !== null ||
    filters.minExperienceYears !== null || filters.availableDay !== null)

  return (
    <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)]">
        <label className="min-w-0 space-y-1.5 text-xs font-semibold text-ink-secondary">
          <span>Cari tutor</span>
          <span className="relative block">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <Input type="search" value={filters.search} placeholder="Nama, mata pelajaran, atau gaya mengajar"
              className="min-h-11 rounded-lg pl-10"
              onChange={(event) => onChange({ ...filters, search: event.target.value })} />
          </span>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-semibold text-ink-secondary">
          <span>Urutkan</span>
          <NativeSelect value={sort} className="rounded-lg" onChange={(event) => onSortChange(event.target.value as TutorSortOption)}>
            <option value="recommended">Kesesuaian tertinggi</option>
            <option value="rating_desc">Penilaian tertinggi</option>
            <option value="experience_desc">Pengalaman terbanyak</option>
          </NativeSelect>
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] xl:items-end">
        <label className="min-w-0 space-y-1.5 text-xs font-semibold text-ink-secondary">
          <span>Mata pelajaran</span>
          <NativeSelect value={filters.subjectId} className="rounded-lg" onChange={(event) => onChange({ ...filters, subjectId: event.target.value })}>
            <option value="">Semua pelajaran</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </NativeSelect>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-semibold text-ink-secondary">
          <span>Hari mengajar</span>
          <NativeSelect value={filters.availableDay ?? ''} className="rounded-lg" onChange={(event) => onChange({ ...filters, availableDay: optionalNumber(event.target.value) })}>
            <option value="">Semua hari</option>
            {DAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}
          </NativeSelect>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-semibold text-ink-secondary">
          <span>Penilaian</span>
          <NativeSelect value={filters.minRating ?? ''} className="rounded-lg" onChange={(event) => onChange({ ...filters, minRating: optionalNumber(event.target.value) })}>
            <option value="">Semua nilai</option>
            {[4.8, 4.5, 4].map((rating) => <option key={rating} value={rating}>{rating} ke atas</option>)}
          </NativeSelect>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-semibold text-ink-secondary">
          <span>Pengalaman</span>
          <NativeSelect value={filters.minExperienceYears ?? ''} className="rounded-lg" onChange={(event) => onChange({ ...filters, minExperienceYears: optionalNumber(event.target.value) })}>
            <option value="">Semua</option>
            {[1, 3, 5].map((years) => <option key={years} value={years}>{years}+ tahun</option>)}
          </NativeSelect>
        </label>
        <Button type="button" variant="ghost" className="col-span-2 min-h-11 justify-self-start xl:col-span-1"
          disabled={!hasFilters} onClick={onReset}>Atur ulang</Button>
      </div>
    </div>
  )
}
