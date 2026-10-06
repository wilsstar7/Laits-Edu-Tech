import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ReportHistory } from '@/components/report/ReportHistory'

export function ReportHistoryPage() {
  return (
    <AppShell>
      <PageHeader
        title="Dokumen Laporan Belajar"
        subtitle="Arsip resmi dokumen Personality & Learning Profile Report yang dapat Anda tinjau dan unduh kapan saja."
        badge="Laporan"
      />
      <div className="mt-6">
        <ReportHistory />
      </div>
    </AppShell>
  )
}
