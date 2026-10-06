import { describe, it, expect, vi, beforeEach } from 'vitest';
import { monthlyReportService } from './monthlyReportService';
import * as supabaseLib from '@/lib/supabase';

describe('monthlyReportService (Phase 7)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches learning reports for current user', async () => {
    const mockReports = [
      {
        id: 'rep-month-1',
        student_id: 'user-std-123',
        period_month: 10,
        period_year: 2026,
        total_sessions: 8,
        total_hours: 12.5,
        avg_progress_percentage: 85,
        summary: 'Siswa aktif menyelesaikan 8 sesi belajar.',
        status: 'ready',
        file_path: null,
        generated_at: '2026-10-06T12:00:00Z',
        created_at: '2026-10-06T12:00:00Z',
        updated_at: '2026-10-06T12:00:00Z',
      },
    ];

    const queryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    queryMock.order
      .mockReturnValueOnce(queryMock)
      .mockResolvedValueOnce({
        data: mockReports,
        error: null,
      });

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-std-123' } },
        }),
      },
      from: vi.fn().mockReturnValue(queryMock),
    };

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    );

    const reports = await monthlyReportService.getReports();
    expect(reports).toHaveLength(1);
    expect(reports[0]?.periodMonth).toBe(10);
    expect(reports[0]?.totalSessions).toBe(8);
    expect(reports[0]?.status).toBe('ready');
  });

  it('calls RPC generate_monthly_learning_report with correct parameters', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: 'new-report-uuid-456',
      error: null,
    });

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-std-123' } },
        }),
      },
      rpc: mockRpc,
    };

    vi.spyOn(supabaseLib, 'getSupabase').mockReturnValue(
      mockSupabase as unknown as supabaseLib.TypedSupabaseClient
    );

    const reportId = await monthlyReportService.generateMonthlyReport(2026, 10);
    expect(reportId).toBe('new-report-uuid-456');
    expect(mockRpc).toHaveBeenCalledWith('generate_monthly_learning_report', {
      p_student_id: 'user-std-123',
      p_year: 2026,
      p_month: 10,
    });
  });
});
