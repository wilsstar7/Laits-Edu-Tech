import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { DashboardSkeleton } from '@/components/dashboard/LoadingSkeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, profileStatus } = useAuth()
  const location = useLocation()

  if (status === 'initializing' || (status === 'authenticated' && profileStatus === 'loading')) {
    return (
      <div className="min-h-screen bg-[#F4F5FB] p-8 max-w-7xl mx-auto">
        <DashboardSkeleton />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
