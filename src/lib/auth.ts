import type { UserRole } from '@/types'

/**
 * Role helpers for UX only (routing, menus).
 * Actual authorization is enforced by Supabase RLS + database functions.
 */

export const ROLE_HOME: Record<UserRole, string> = {
  student: '/student/dashboard',
  tutor: '/tutor/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/admin/dashboard',
}

export const ROLE_LABEL: Record<UserRole, string> = {
  student: 'Siswa',
  tutor: 'Tutor',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

export const ADMIN_ROLES: readonly UserRole[] = ['admin', 'super_admin']

export function getRoleHomePath(role: UserRole | null | undefined): string {
  return role ? ROLE_HOME[role] : '/login'
}

export function hasRole(role: UserRole | null | undefined, allowed: readonly UserRole[]): boolean {
  return role != null && allowed.includes(role)
}

/**
 * Only allow redirecting to internal paths (prevents open-redirect via
 * `?redirect=https://evil.example`).
 */
export function sanitizeRedirectPath(path: string | null | undefined): string | null {
  if (!path) return null
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return null
  return path
}
