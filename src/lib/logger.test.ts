import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, generateCorrelationId } from './logger';

describe('Logger (Phase 7 Observability & Sanitization)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a unique correlation ID with prefix', () => {
    const id1 = generateCorrelationId();
    const id2 = generateCorrelationId();
    expect(id1).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/);
    expect(id2).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('redacts sensitive fields in metadata automatically', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    logger.info('User authentication event', {
      email: 'student@example.com',
      password: 'SuperSecretPassword123!',
      token: 'jwt.token.secret',
      service_role_key: 'sbp_secret_key_12345',
      authorization: 'Bearer secret_auth_token',
      nested: {
        access_token: 'secret_nested_token',
        regular_field: 'safe_data',
      },
    });

    expect(consoleSpy).toHaveBeenCalled();
    const callArgs = consoleSpy.mock.calls[0];
    expect(callArgs).toBeDefined();
    const loggedMeta = callArgs?.[1] as {
      password?: string;
      token?: string;
      service_role_key?: string;
      authorization?: string;
      nested?: { access_token?: string; regular_field?: string };
      email?: string;
    };

    expect(loggedMeta.password).toBe('[REDACTED]');
    expect(loggedMeta.token).toBe('[REDACTED]');
    expect(loggedMeta.service_role_key).toBe('[REDACTED]');
    expect(loggedMeta.authorization).toBe('[REDACTED]');
    expect(loggedMeta.nested?.access_token).toBe('[REDACTED]');
    expect(loggedMeta.nested?.regular_field).toBe('safe_data');
    expect(loggedMeta.email).toBe('student@example.com');
  });

  it('logs warn and error messages appropriately', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.warn('Rate limit approaching', { count: 45 });
    expect(warnSpy).toHaveBeenCalled();

    logger.error('Database connection timeout', { timeoutMs: 5000 });
    expect(errorSpy).toHaveBeenCalled();
  });
});
