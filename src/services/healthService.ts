import { env, validateEnvironment } from '@/lib/env'
import { getSupabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface ServiceHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    frontend: {
      status: 'pass' | 'fail'
      message: string
    }
    configuration: {
      status: 'pass' | 'fail'
      issues?: string[]
    }
    supabaseReachable: {
      status: 'pass' | 'fail' | 'skipped'
      latencyMs?: number
      message?: string
    }
    databaseQuery: {
      status: 'pass' | 'fail' | 'skipped'
      latencyMs?: number
      message?: string
    }
  }
}

export const healthService = {
  /**
   * Runs non-destructive health checks against frontend, configuration, and database connectivity.
   * Never leaks secrets or connection strings.
   */
  async checkHealth(): Promise<ServiceHealthStatus> {
    const startOverall = performance.now()
    const envValidation = validateEnvironment()

    const checks: ServiceHealthStatus['checks'] = {
      frontend: {
        status: 'pass',
        message: 'Frontend bundle loaded and running.',
      },
      configuration: {
        status: envValidation.isValid ? 'pass' : 'fail',
        issues: envValidation.issues.length > 0 ? envValidation.issues : undefined,
      },
      supabaseReachable: {
        status: 'skipped',
        message: 'Supabase URL not configured.',
      },
      databaseQuery: {
        status: 'skipped',
        message: 'Database check skipped because Supabase is not configured.',
      },
    }

    if (env.isSupabaseConfigured) {
      const supabase = getSupabase()

      if (supabase) {
        // 1. Check network ping / reachability
        const pingStart = performance.now()
        try {
          const authHealth = await fetch(`${env.supabaseUrl}/auth/v1/health`, {
            method: 'GET',
            headers: { apikey: env.supabaseAnonKey },
          })
          const pingLatency = Math.round(performance.now() - pingStart)

          checks.supabaseReachable = {
            status: authHealth.ok ? 'pass' : 'fail',
            latencyMs: pingLatency,
            message: authHealth.ok ? 'Auth gateway responsive.' : `HTTP ${authHealth.status}`,
          }
        } catch {
          checks.supabaseReachable = {
            status: 'fail',
            latencyMs: Math.round(performance.now() - pingStart),
            message: 'Unable to connect to Supabase gateway.',
          }
        }

        // 2. Check Database query responsiveness via active subjects public table
        const dbStart = performance.now()
        try {
          const { error } = await supabase
            .from('subjects')
            .select('id')
            .limit(1)

          const dbLatency = Math.round(performance.now() - dbStart)

          if (error) {
            checks.databaseQuery = {
              status: 'fail',
              latencyMs: dbLatency,
              message: 'Database returned query error.',
            }
          } else {
            checks.databaseQuery = {
              status: 'pass',
              latencyMs: dbLatency,
              message: 'Database read query successful.',
            }
          }
        } catch {
          checks.databaseQuery = {
            status: 'fail',
            latencyMs: Math.round(performance.now() - dbStart),
            message: 'Exception while performing database probe.',
          }
        }
      }
    }

    let overallStatus: ServiceHealthStatus['status'] = 'healthy'
    if (
      checks.configuration.status === 'fail' ||
      checks.supabaseReachable.status === 'fail' ||
      checks.databaseQuery.status === 'fail'
    ) {
      overallStatus = 'degraded'
    }

    const result: ServiceHealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0-phase7',
      checks,
    }

    logger.info('System health check evaluated:', {
      status: overallStatus,
      totalDurationMs: Math.round(performance.now() - startOverall),
    })

    return result
  },
}
