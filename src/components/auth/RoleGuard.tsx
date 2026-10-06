import { Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, status } = useAuth()

  // In unconfigured demo mode, allow access for testing
  if (status === 'unconfigured') {
    return <>{children}</>
  }

  // If user has a role and it's not in allowed roles, redirect to /unauthorized
  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
