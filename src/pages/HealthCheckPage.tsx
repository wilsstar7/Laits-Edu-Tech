import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, RefreshCw, Server, Database, Shield, Globe } from 'lucide-react'
import { healthService, type ServiceHealthStatus } from '@/services/healthService'
import { Button } from '@/components/ui/button'

export function HealthCheckPage() {
  const [health, setHealth] = useState<ServiceHealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const res = await healthService.checkHealth()
      setHealth(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    healthService
      .checkHealth()
      .then((res) => {
        if (isMounted) setHealth(res)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F5FB] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-border/80 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#17181C]">System Health & Status</h1>
              <p className="text-xs text-[#676A78]">Phase 7 Operational Readiness Probe</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-xl text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Perbarui</span>
          </Button>
        </div>

        {health && (
          <div className="space-y-4">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-xl flex items-center justify-between ${
                health.status === 'healthy'
                  ? 'bg-[#EBFBF2] text-[#22864C] border border-[#A5E8BE]'
                  : 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {health.status === 'healthy' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide">
                    {health.status === 'healthy' ? 'Semua Sistem Beroperasi Normal' : 'Sistem Terdegradasi'}
                  </p>
                  <p className="text-xs opacity-90">Versi: {health.version} • {new Date(health.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            {/* Checks list */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F4F5FB] border border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#6C5CE7]" />
                  <span className="font-medium text-[#17181C]">Frontend Client</span>
                </div>
                <span className="font-bold text-[#22864C]">PASS</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F5FB] border border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#6C5CE7]" />
                  <span className="font-medium text-[#17181C]">Environment Configuration</span>
                </div>
                <span className={`font-bold ${health.checks.configuration.status === 'pass' ? 'text-[#22864C]' : 'text-[#C2410C]'}`}>
                  {health.checks.configuration.status.toUpperCase()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F5FB] border border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-[#6C5CE7]" />
                  <div>
                    <span className="font-medium text-[#17181C]">Supabase Gateway Reachable</span>
                    {health.checks.supabaseReachable.latencyMs !== undefined && (
                      <span className="text-[11px] text-[#676A78] ml-2">({health.checks.supabaseReachable.latencyMs}ms)</span>
                    )}
                  </div>
                </div>
                <span className={`font-bold ${health.checks.supabaseReachable.status === 'pass' ? 'text-[#22864C]' : 'text-[#C2410C]'}`}>
                  {health.checks.supabaseReachable.status.toUpperCase()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F5FB] border border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-[#6C5CE7]" />
                  <div>
                    <span className="font-medium text-[#17181C]">PostgreSQL Database Query</span>
                    {health.checks.databaseQuery.latencyMs !== undefined && (
                      <span className="text-[11px] text-[#676A78] ml-2">({health.checks.databaseQuery.latencyMs}ms)</span>
                    )}
                  </div>
                </div>
                <span className={`font-bold ${health.checks.databaseQuery.status === 'pass' ? 'text-[#22864C]' : 'text-[#C2410C]'}`}>
                  {health.checks.databaseQuery.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
