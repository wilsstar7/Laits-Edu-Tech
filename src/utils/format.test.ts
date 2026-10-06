import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDayName,
  formatTimeRange,
  formatDateTime,
  getFirstName,
  getInitials,
} from './format'

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('formats number to IDR currency representation', () => {
      const res = formatCurrency(75000)
      expect(res).toContain('75.000')
      expect(res).toContain('Rp')
    })

    it('handles 0 and invalid numbers safely', () => {
      expect(formatCurrency(0)).toContain('0')
      expect(formatCurrency(NaN)).toBe('Rp 0')
    })
  })

  describe('formatDayName', () => {
    it('maps indices 0 through 6 to Indonesian day names', () => {
      expect(formatDayName(0)).toBe('Minggu')
      expect(formatDayName(1)).toBe('Senin')
      expect(formatDayName(2)).toBe('Selasa')
      expect(formatDayName(3)).toBe('Rabu')
      expect(formatDayName(4)).toBe('Kamis')
      expect(formatDayName(5)).toBe('Jumat')
      expect(formatDayName(6)).toBe('Sabtu')
    })
  })

  describe('formatTimeRange', () => {
    it('formats start and end times with WIB timezone label', () => {
      const start = '2026-10-10T09:00:00Z'
      const end = '2026-10-10T10:00:00Z'
      const res = formatTimeRange(start, end, 'Asia/Jakarta')
      expect(res).toContain('WIB')
      expect(res).toContain('-')
    })

    it('returns "-" for invalid dates', () => {
      expect(formatTimeRange('invalid', 'invalid')).toBe('-')
    })
  })

  describe('formatDateTime', () => {
    it('formats ISO date to long Indonesian datetime format', () => {
      const date = '2026-10-12T10:00:00Z'
      const res = formatDateTime(date, 'Asia/Jakarta')
      expect(res).toContain('2026')
      expect(res).toContain('Oktober')
    })

    it('returns "-" for invalid date', () => {
      expect(formatDateTime('invalid')).toBe('-')
    })
  })

  describe('getFirstName & getInitials', () => {
    it('extracts first name correctly', () => {
      expect(getFirstName('Farhan Ramadhan')).toBe('Farhan')
      expect(getFirstName('Sarah')).toBe('Sarah')
      expect(getFirstName(null)).toBe('')
    })

    it('computes uppercase initials', () => {
      expect(getInitials('Farhan Ramadhan')).toBe('FR')
      expect(getInitials('Sarah')).toBe('S')
      expect(getInitials(null)).toBe('?')
    })
  })
})
