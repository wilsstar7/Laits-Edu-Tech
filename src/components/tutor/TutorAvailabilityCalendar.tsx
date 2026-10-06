import { useState, useEffect, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import type { AvailableTimeSlot } from '@/types/tutor'
import { BOOKING_DURATIONS, type BookingDurationMinutes } from '@/types/booking'
import { tutorAvailabilityService } from '@/services/tutorAvailabilityService'
import { formatDayName } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TutorAvailabilityCalendarProps {
  tutorId: string
  selectedSlot: AvailableTimeSlot | null
  onSelectSlot: (slot: AvailableTimeSlot) => void
  selectedDuration: BookingDurationMinutes
  onDurationChange: (duration: BookingDurationMinutes) => void
}

export function TutorAvailabilityCalendar({
  tutorId,
  selectedSlot,
  onSelectSlot,
  selectedDuration,
  onDurationChange,
}: TutorAvailabilityCalendarProps) {
  const baseToday = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [dateIndex, setDateIndex] = useState(0)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slots, setSlots] = useState<AvailableTimeSlot[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const selectedDate = useMemo(() => {
    const d = new Date(baseToday)
    d.setDate(baseToday.getDate() + dateIndex)
    return d
  }, [baseToday, dateIndex])

  useEffect(() => {
    let isMounted = true

    async function fetchSlots() {
      try {
        const result = await tutorAvailabilityService.getAvailableSlots(
          tutorId,
          selectedDate,
          selectedDuration
        )
        if (isMounted) {
          setSlots(result)
          setErrorMsg(null)
        }
      } catch (err) {
        console.error('Failed to load slots:', err)
        if (isMounted) {
          setErrorMsg('Gagal memuat slot jadwal. Silakan coba lagi.')
        }
      } finally {
        if (isMounted) setLoadingSlots(false)
      }
    }

    fetchSlots()
    return () => {
      isMounted = false
    }
  }, [tutorId, selectedDate, selectedDuration])

  const handleRetry = () => {
    setLoadingSlots(true)
    setErrorMsg(null)
    tutorAvailabilityService
      .getAvailableSlots(tutorId, selectedDate, selectedDuration)
      .then(setSlots)
      .catch(() => setErrorMsg('Gagal memuat slot jadwal. Silakan coba lagi.'))
      .finally(() => setLoadingSlots(false))
  }

  const daysList = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(baseToday)
      d.setDate(baseToday.getDate() + i)
      return {
        index: i,
        date: d,
        dayName: formatDayName(d.getDay()),
        dateNum: d.getDate(),
        monthName: d.toLocaleDateString('id-ID', { month: 'short' }),
        isToday: i === 0,
      }
    })
  }, [baseToday])

  return (
    <div className="space-y-4">
      {/* Duration Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border">
        <div>
          <span className="text-xs font-semibold text-ink-primary block">
            Pilih Durasi Sesi:
          </span>
          <span className="text-[11px] text-ink-muted">
            Tarif menyesuaikan durasi yang dipilih
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-border">
          {BOOKING_DURATIONS.map((dur) => (
            <button
              key={dur.value}
              type="button"
              onClick={() => onDurationChange(dur.value)}
              className={`min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedDuration === dur.value
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/60'
              }`}
            >
              {dur.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Carousel / Picker */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
            <CalendarIcon className="w-4 h-4 text-brand-primary" />
            <span>
              {selectedDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            {dateIndex === 0 && (
              <Badge variant="outline" className="text-[10px] bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                Hari ini
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={dateIndex <= 0}
              onClick={() => setDateIndex((prev) => Math.max(0, prev - 1))}
              className="w-11 h-11 p-0"
              aria-label="Hari sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={dateIndex >= 13}
              onClick={() => setDateIndex((prev) => Math.min(13, prev + 1))}
              className="w-11 h-11 p-0"
              aria-label="Hari berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Horizontal Date Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {daysList.map((item) => {
            const isSelected = item.index === dateIndex
            return (
              <button
                key={item.index}
                type="button"
                onClick={() => setDateIndex(item.index)}
                className={`flex flex-col items-center justify-center min-w-[70px] min-h-[64px] px-3 py-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                    : 'border-border bg-white hover:border-brand-primary/40 text-ink-primary'
                }`}
              >
                <span
                  className={`text-[11px] font-medium leading-none ${
                    isSelected ? 'text-white/90' : 'text-ink-muted'
                  }`}
                >
                  {item.dayName.slice(0, 3)}
                </span>
                <span className="text-base font-bold my-0.5">{item.dateNum}</span>
                <span
                  className={`text-[10px] leading-none ${
                    isSelected ? 'text-white/80' : 'text-ink-muted'
                  }`}
                >
                  {item.monthName}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Available Slots Grid */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-ink-primary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            Pilihan Jam Belajar (WIB)
          </span>
          {slots.length > 0 && !loadingSlots && (
            <span className="text-[11px] text-ink-muted">
              {slots.filter((s) => !s.isBooked).length} slot tersedia
            </span>
          )}
        </div>

        {loadingSlots ? (
          <div className="flex flex-col items-center justify-center p-8 bg-surface rounded-xl border border-dashed border-border text-center">
            <Loader2 className="w-6 h-6 text-brand-primary animate-spin mb-2" />
            <p className="text-xs text-ink-muted">Memuat slot ketersediaan...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center p-6 bg-danger/5 rounded-xl border border-danger/20 text-center">
            <AlertCircle className="w-6 h-6 text-danger mb-2" />
            <p className="text-xs text-danger mb-3">{errorMsg}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="min-h-[44px]"
            >
              Coba Lagi
            </Button>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-6 bg-surface rounded-xl border border-dashed border-border text-center">
            <p className="text-xs font-medium text-ink-primary mb-1">
              Tidak ada jadwal tersedia pada hari ini
            </p>
            <p className="text-[11px] text-ink-muted max-w-xs mx-auto">
              Tutor tidak membuka sesi pada tanggal ini atau seluruh slot telah penuh. Silakan pilih tanggal lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.slotId === slot.slotId
              const isDisabled = slot.isBooked

              return (
                <button
                  key={slot.slotId}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectSlot(slot)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${
                    isDisabled
                      ? 'bg-muted/40 border-border text-ink-muted/50 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-brand-primary text-white border-brand-primary shadow-sm ring-2 ring-brand-primary/20'
                      : 'bg-white border-border text-ink-primary hover:border-brand-primary/60 hover:bg-brand-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>
                      {slot.startTimeStr} - {slot.endTimeStr}
                    </span>
                  </div>
                  {isDisabled ? (
                    <span className="text-[10px] text-ink-muted font-normal">
                      Terisi
                    </span>
                  ) : isSelected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
