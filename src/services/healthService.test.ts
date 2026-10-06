import { describe, it, expect } from 'vitest';
import { healthService } from './healthService';

describe('healthService (Phase 7 Observability & Diagnostics)', () => {
  it('runs health checks and returns structured status without leaking secrets', async () => {
    const report = await healthService.checkHealth();

    expect(report).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(report.status);
    expect(report.checks.frontend.status).toBe('pass');
    expect(report.version).toBe('1.0.0-phase7');
    expect(new Date(report.timestamp).getTime()).not.toBeNaN();

    // Verify no secret leak in health report JSON
    const reportStr = JSON.stringify(report);
    expect(reportStr).not.toContain('sbp_');
    expect(reportStr).not.toContain('secret');
  });
});
