import { useParams, Navigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { ReportPreview } from '@/components/report/ReportPreview'

export function ReportPreviewPage() {
  const { reportId } = useParams<{ reportId: string }>()

  if (!reportId) {
    return <Navigate to="/student/reports" replace />
  }

  return (
    <AppShell>
      <div className="py-2">
        <ReportPreview reportId={reportId} />
      </div>
    </AppShell>
  )
}
