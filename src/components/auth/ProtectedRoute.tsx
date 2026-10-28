import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/PageLoader'
import { studentNeedsOnboarding } from '@/utils/profileCompletion'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, profileStatus, role, profile, account } = useAuth()
  const location = useLocation()

  if (status === 'initializing' || (status === 'authenticated' && profileStatus === 'loading')) {
    return <PageLoader message="Memverifikasi akun..." />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  // Profile onboarding guard for students
  if (role === 'student' && profile) {
    const needsOnboarding = studentNeedsOnboarding(profile, account?.studentProfile ?? null)
    const isOnboardingRoute = location.pathname === '/student/complete-profile'

    if (needsOnboarding && !isOnboardingRoute) {
      return <Navigate to="/student/complete-profile" replace />
    }

    if (!needsOnboarding && isOnboardingRoute) {
      return <Navigate to="/student/dashboard" replace />
    }
  }

  return <>{children}</>
}
