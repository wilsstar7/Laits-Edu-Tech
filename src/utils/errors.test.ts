import { describe, it, expect } from 'vitest';
import { toAppError, getErrorMessage, MESSAGES } from './errors';
import { AuthError } from '@supabase/supabase-js';

describe('Error Handling and Redaction (Phase 7)', () => {
  it('maps Supabase Auth invalid_credentials to friendly Indonesian message', () => {
    const authErr = new AuthError('Invalid login credentials', 400, 'invalid_credentials');
    const appErr = toAppError(authErr);

    expect(appErr.code).toBe('invalid_credentials');
    expect(appErr.category).toBe('AUTH_ERROR');
    expect(appErr.message).toBe('Email atau password salah.');
  });

  it('maps 429 rate limit errors to RATE_LIMITED category', () => {
    const rateLimitErr = new AuthError('Too many requests', 429, 'over_request_rate_limit');
    const appErr = toAppError(rateLimitErr);

    expect(appErr.code).toBe('rate_limited');
    expect(appErr.category).toBe('RATE_LIMITED');
    expect(appErr.message).toContain('Terlalu banyak percobaan');
  });

  it('masks raw PostgreSQL 23505 duplicate key errors into safe conflict message', () => {
    const pgErr = {
      code: '23505',
      message: 'duplicate key value violates unique constraint "monthly_learning_reports_pkey"',
      details: 'Key (id)=(123) already exists.',
      hint: '',
    };

    const appErr = toAppError(pgErr);
    expect(appErr.code).toBe('conflict');
    expect(appErr.category).toBe('CONFLICT');
    expect(appErr.message).toBe('Data tersebut sudah terdaftar dalam sistem.');
    // Must never leak table or key names in message
    expect(appErr.message).not.toContain('monthly_learning_reports');
    expect(appErr.message).not.toContain('unique constraint');
  });

  it('masks unknown PostgreSQL schema/syntax errors into generic server error', () => {
    const rawPgInternalErr = {
      code: '42P01',
      message: 'relation "secret_table" does not exist',
      details: 'Table secret_table in schema public does not exist.',
      hint: '',
    };

    const appErr = toAppError(rawPgInternalErr);
    expect(appErr.code).toBe('server_error');
    expect(appErr.category).toBe('SERVER_ERROR');
    expect(appErr.message).toBe(MESSAGES.generic);
    expect(appErr.message).not.toContain('secret_table');
  });

  it('maps network fetch failures to NETWORK_ERROR', () => {
    const netErr = new TypeError('Failed to fetch');
    const appErr = toAppError(netErr);

    expect(appErr.code).toBe('network');
    expect(appErr.category).toBe('NETWORK_ERROR');
    expect(appErr.message).toBe(MESSAGES.network);
  });

  it('getErrorMessage extracts the safe user message directly', () => {
    const err = new Error('Unknown catastrophic failure');
    const msg = getErrorMessage(err, 'Kendala kustom');
    expect(msg).toBe('Kendala kustom');
  });
});
