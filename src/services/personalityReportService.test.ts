import { describe, it, expect, vi, beforeEach } from 'vitest'
import { personalityReportService } from './personalityReportService'
import * as supabaseLib from '@/lib/supabase'
import { personalityService } from './personalityService'
import { sanitizeReportFilename, formatReportDate, formatScorePercentage, formatFileSize } from '@/utils/format'

describe('personalityReportService', () => {
  const mockUser = {
    id: 'user-aaa-111',
    email: 'student@example.com',
  }

  const mockAssessmentResult = {
    id: 'result-bbb-222',
    session_id: 'session-001',
    user_id: 'user-aaa-111',
    assessment_id: 'assessment-001',
    personality_type_id: 'pt-001',
    overall_score: 82,
    completed_at: '2026-10-06T12:00:00Z',
    created_at: '2026-10-06T12:00:00Z',
    personality_type: {
      id: 'pt-001',
      assessment_id: 'assessment-001',
      name: 'Penjelajah Konseptual (Explorer)',
      code: 'EXPLORER',
      description: 'Menyukai eksplorasi konsep baru dan pemikiran kritis.',
      strengths: ['Cepat memahami materi abstrak', 'Kreatif memecahkan masalah'],
      challenges: ['Mudah jenuh dengan rutinitas repetitif'],
      learning_style: 'Eksploratif dan Berbasis Masalah',
      communication_style: 'Komunikatif dan dialogis',
      motivation: 'Memahami esensi materi di dunia nyata',
      recommended_study_method: ['Diskusi konsep', 'Mind mapping'],
      recommended_subjects: ['Fisika Konseptual', 'Bahasa Inggris'],
      recommended_tutor_style: ['Dinamis dan terbuka berdiskusi'],
      created_at: '2026-10-06T12:00:00Z',
      updated_at: '2026-10-06T12:00:00Z',
    },
    dimensions: [
      {
        id: 'dim-res-1',
        result_id: 'result-bbb-222',
        dimension_id: 'dim-1',
        raw_score: 22,
        normalized_score: 75,
        percentile: null,
        dimension: {
          id: 'dim-1',
          assessment_id: 'assessment-001',
          name: 'Interaksi Sosial Belajar',
          code: 'EXTRAVERSION',
          description: 'Mengukur kecenderungan belajar kolaboratif.',
          min_score: 0,
          max_score: 100,
          display_order: 1,
          created_at: '2026-10-06T12:00:00Z',
          updated_at: '2026-10-06T12:00:00Z',
        },
      },
      {
        id: 'dim-res-2',
        result_id: 'result-bbb-222',
        dimension_id: 'dim-2',
        raw_score: 26,
        normalized_score: 88,
        percentile: null,
        dimension: {
          id: 'dim-2',
          assessment_id: 'assessment-001',
          name: 'Eksplorasi Konseptual',
          code: 'OPENNESS',
          description: 'Mengukur keterbukaan terhadap ide baru.',
          min_score: 0,
          max_score: 100,
          display_order: 2,
          created_at: '2026-10-06T12:00:00Z',
          updated_at: '2026-10-06T12:00:00Z',
        },
      },
    ],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('correctly sanitizes report filenames for safe storage and download', () => {
    expect(sanitizeReportFilename('Ahmad Fulan', '2026-10-06')).toBe(
      'personality-report-ahmad-fulan-2026-10-06.pdf'
    )
    expect(sanitizeReportFilename('Siti Rahma, S.Pd!', '2026-10-06')).toBe(
      'personality-report-siti-rahma-s-pd-2026-10-06.pdf'
    )
    expect(sanitizeReportFilename('', '2026-10-06')).toBe(
      'personality-report-siswa-2026-10-06.pdf'
    )
  })

  it('formats dates, scores, and file sizes accurately without locale glitches', () => {
    expect(formatScorePercentage(72.4981)).toBe('72%')
    expect(formatScorePercentage(85.8)).toBe('86%')
    expect(formatFileSize(1024 * 350)).toBe('350 KB')
    expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB')

    const formattedDate = formatReportDate('2026-10-06T00:00:00Z')
    expect(formattedDate).toContain('2026')
    expect(formattedDate).toContain('Oktober')
  })

  it('enforces authentication check before generating report', async () => {
    vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as unknown as ReturnType<typeof supabaseLib.requireSupabase>)

    await expect(personalityReportService.generateReport('result-123')).rejects.toThrow(
      'Silakan masuk (login) terlebih dahulu'
    )
  })

  it('handles idempotency by returning existing ready report without duplicate generation', async () => {
    const existingReadyReport = {
      id: 'rep-existing-999',
      user_id: mockUser.id,
      assessment_result_id: 'result-bbb-222',
      file_path: `${mockUser.id}/result-bbb-222/rep-existing-999.pdf`,
      file_name: 'personality-report-ahmad-fulan-2026-10-06.pdf',
      file_size: 45000,
      mime_type: 'application/pdf',
      report_version: '1.0',
      status: 'ready',
      generated_at: '2026-10-06T12:05:00Z',
      created_at: '2026-10-06T12:05:00Z',
      updated_at: '2026-10-06T12:05:00Z',
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'personality_reports') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: existingReadyReport, error: null }),
          }
        }
        return {}
      }),
      storage: {
        from: vi.fn().mockReturnValue({
          createSignedUrl: vi.fn().mockResolvedValue({
            data: { signedUrl: 'https://supabase.co/storage/v1/signed/test.pdf' },
            error: null,
          }),
        }),
      },
    }

    vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof supabaseLib.requireSupabase>
    )

    const response = await personalityReportService.generateReport('result-bbb-222')

    expect(response.success).toBe(true)
    expect(response.isNew).toBe(false)
    expect(response.report.id).toBe('rep-existing-999')
  })

  it('rejects generation if result does not belong to the authenticated user', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'personality_reports') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        if (table === 'assessments') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { name: 'Learning Personality Assessment' } }),
          }
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { full_name: 'Other Student', email: 'other@example.com' } }),
          }
        }
        if (table === 'student_profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          }
        }
        return {}
      }),
    }

    vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof supabaseLib.requireSupabase>
    )

    // Assessment belonging to a different user
    vi.spyOn(personalityService, 'getResultById').mockResolvedValue({
      ...mockAssessmentResult,
      user_id: 'other-user-999',
    })

    await expect(personalityReportService.generateReport('alien-result-999')).rejects.toThrow(
      'Hasil asesmen tidak ditemukan atau Anda tidak memiliki akses'
    )
  })

  it('rejects generation if required assessment result data is incomplete', async () => {
    const incompleteResult = {
      id: mockAssessmentResult.id,
      session_id: 'session-1',
      user_id: mockUser.id,
      assessment_id: 'assessment-001',
      personality_type_id: 'pt-001',
      overall_score: 80,
      completed_at: '2026-10-06T12:00:00Z',
      created_at: '2026-10-06T12:00:00Z',
      personality_type: undefined,
      dimensions: [],
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'personality_reports') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        if (table === 'assessments') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { name: 'Learning Personality Assessment' } }),
          }
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { full_name: 'Ahmad Fulan', email: 'ahmad@example.com' } }),
          }
        }
        if (table === 'student_profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
          }
        }
        return {}
      }),
    }

    vi.spyOn(supabaseLib, 'requireSupabase').mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof supabaseLib.requireSupabase>
    )

    vi.spyOn(personalityService, 'getResultById').mockResolvedValue(incompleteResult)

    await expect(personalityReportService.generateReport(mockAssessmentResult.id)).rejects.toThrow(
      'REPORT_DATA_INCOMPLETE'
    )
  })
})
