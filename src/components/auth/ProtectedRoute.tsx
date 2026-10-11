import { Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/PageLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, profileStatus } = useAuth()

  if (status === 'initializing' || (status === 'authenticated' && profileStatus === 'loading')) {
    return <PageLoader message="Memverifikasi akun..." />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
