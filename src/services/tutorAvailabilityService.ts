import { requireSupabase } from '@/lib/supabase'
import type { TutorAvailabilityRule, AvailableTimeSlot } from '@/types/tutor'
import { toAppError } from '@/utils/errors'

export const tutorAvailabilityService = {
  /**
   * Fetches active availability rules for a tutor.
   */
  async getTutorAvailability(tutorId: string): Promise<TutorAvailabilityRule[]> {
    const supabase = requireSupabase()

    try {
      const { data, error } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      return (data || []).map((row) => ({
        id: row.id,
        tutorId: row.tutor_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        timezone: row.timezone,
        isActive: row.is_active,
      }))
    } catch (err) {
      console.error('Failed to get tutor availability:', err)
      throw toAppError(err, 'Gagal memuat jadwal ketersediaan tutor.')
    }
  },

  /**
   * Generates available bookable time slots for a specific calendar date and duration.
   * Checks past time, tutor rules, and existing active bookings.
   */
  async getAvailableSlots(
    tutorId: string,
    targetDate: Date | string,
    durationMinutes: number = 60,
    timezone: string = 'Asia/Jakarta'
  ): Promise<AvailableTimeSlot[]> {
    const supabase = requireSupabase()
    const d = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
    if (Number.isNaN(d.getTime())) return []

    const year = d.getFullYear()
    const month = d.getMonth()
    const day = d.getDate()
    const dayOfWeek = d.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    try {
      // 1. Fetch tutor active rules for this day of week
      const { data: rules, error: rulesError } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .order('start_time', { ascending: true })

      if (rulesError) throw rulesError
      if (!rules || rules.length === 0) return []

      // 2. Fetch existing active bookings on this date range to prevent double booking
      const dayStart = new Date(year, month, day, 0, 0, 0).toISOString()
      const dayEnd = new Date(year, month, day, 23, 59, 59).toISOString()

      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('scheduled_start, scheduled_end, status')
        .eq('tutor_id', tutorId)
        .in('status', ['pending', 'confirmed'])
        .gte('scheduled_end', dayStart)
        .lte('scheduled_start', dayEnd)

      if (bookingsError) throw bookingsError

      const activeRanges = (existingBookings || []).map((b) => ({
        start: new Date(b.scheduled_start).getTime(),
        end: new Date(b.scheduled_end).getTime(),
      }))

      // 3. Slice each rule into slots of durationMinutes
      const nowMs = Date.now() + 10 * 60 * 1000 // Must be at least 10 minutes from now
      const slots: AvailableTimeSlot[] = []

      for (const rule of rules) {
        const [startH, startM] = rule.start_time.split(':').map(Number) as [number, number]
        const [endH, endM] = rule.end_time.split(':').map(Number) as [number, number]

        const ruleStartMs = new Date(year, month, day, startH, startM, 0).getTime()
        const ruleEndMs = new Date(year, month, day, endH, endM, 0).getTime()

        const stepMs = durationMinutes * 60 * 1000

        let cursorMs = ruleStartMs
        while (cursorMs + stepMs <= ruleEndMs) {
          const slotStartMs = cursorMs
          const slotEndMs = cursorMs + stepMs

          // Filter out past slots
          if (slotStartMs > nowMs) {
            // Check if overlaps with any active booking
            const isBooked = activeRanges.some(
              (b) => slotStartMs < b.end && slotEndMs > b.start
            )

            const slotStartDate = new Date(slotStartMs)
            const slotEndDate = new Date(slotEndMs)

            const startTimeStr = `${String(slotStartDate.getHours()).padStart(2, '0')}:${String(
              slotStartDate.getMinutes()
            ).padStart(2, '0')}`
            const endTimeStr = `${String(slotEndDate.getHours()).padStart(2, '0')}:${String(
              slotEndDate.getMinutes()
            ).padStart(2, '0')}`

            slots.push({
              slotId: `${rule.id}-${startTimeStr}`,
              scheduledStart: slotStartDate.toISOString(),
              scheduledEnd: slotEndDate.toISOString(),
              dayOfWeek,
              startTimeStr,
              endTimeStr,
              durationMinutes,
              isBooked,
              timezone,
            })
          }

          cursorMs += stepMs
        }
      }

      return slots
    } catch (err) {
      console.error('Failed to calculate available slots:', err)
      throw toAppError(err, 'Gagal menghitung ketersediaan slot waktu.')
    }
  },

  /**
   * Fetches all availability rules for the logged-in tutor.
   */
  async getMyAvailability(tutorUserId?: string): Promise<TutorAvailabilityRule[]> {
    const supabase = requireSupabase()

    try {
      let targetUserId = tutorUserId
      if (!targetUserId) {
        const { data: authData } = await supabase.auth.getUser()
        targetUserId = authData.user?.id
      }
      if (!targetUserId) throw new Error('Pengguna tidak terautentikasi.')

      // Find tutor_profile ID
      const { data: tp, error: tpError } = await supabase
        .from('tutor_profiles')
        .select('id')
        .eq('user_id', targetUserId)
        .single()

      if (tpError || !tp) {
        throw new Error('Akun tutor tidak ditemukan.')
      }

      const { data, error } = await supabase
        .from('tutor_availability')
        .select('*')
        .eq('tutor_id', tp.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      return (data || []).map((row) => ({
        id: row.id,
        tutorId: row.tutor_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time.slice(0, 5),
        endTime: row.end_time.slice(0, 5),
        timezone: row.timezone,
        isActive: row.is_active,
      }))
    } catch (err) {
      console.error('Failed to get my availability:', err)
      throw toAppError(err, 'Gagal memuat jadwal ketersediaan Anda.')
    }
  },

  /**
   * Creates a new availability rule for a tutor.
   */
  async addAvailabilityRule(
    input: {
      dayOfWeek: number
      startTime: string
      endTime: string
      timezone?: string
    },
    tutorUserId?: string
  ): Promise<void> {
    const supabase = requireSupabase()

    try {
      let targetUserId = tutorUserId
      if (!targetUserId) {
        const { data: authData } = await supabase.auth.getUser()
        targetUserId = authData.user?.id
      }
      if (!targetUserId) throw new Error('Pengguna tidak terautentikasi.')

      const { data: tp, error: tpError } = await supabase
        .from('tutor_profiles')
        .select('id')
        .eq('user_id', targetUserId)
        .single()

      if (tpError || !tp) throw new Error('Akun tutor tidak ditemukan.')

      const { error } = await supabase.from('tutor_availability').insert({
        tutor_id: tp.id,
        day_of_week: input.dayOfWeek,
        start_time: input.startTime,
        end_time: input.endTime,
        timezone: input.timezone || 'Asia/Jakarta',
        is_active: true,
      })

      if (error) throw error
    } catch (err) {
      console.error('Failed to add availability rule:', err)
      throw toAppError(err, 'Gagal menambahkan jadwal ketersediaan.')
    }
  },

  /**
   * Deletes an availability rule.
   */
  async deleteAvailabilityRule(ruleId: string): Promise<void> {
    const supabase = requireSupabase()

    try {
      const { error } = await supabase
        .from('tutor_availability')
        .delete()
        .eq('id', ruleId)

      if (error) throw error
    } catch (err) {
      console.error('Failed to delete availability rule:', err)
      throw toAppError(err, 'Gagal menghapus jadwal ketersediaan.')
    }
  },

  /**
   * Toggles an availability rule active state.
   */
  async toggleAvailabilityActive(ruleId: string, isActive: boolean): Promise<void> {
    const supabase = requireSupabase()

    try {
      const { error } = await supabase
        .from('tutor_availability')
        .update({ is_active: isActive })
        .eq('id', ruleId)

      if (error) throw error
    } catch (err) {
      console.error('Failed to toggle availability rule:', err)
      throw toAppError(err, 'Gagal memperbarui status ketersediaan.')
    }
  },
}
