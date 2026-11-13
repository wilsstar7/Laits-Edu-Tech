import {
  LayoutDashboard,
  Compass,
  BookOpen,
  GraduationCap,
  Calendar,
  CreditCard,
  Clock,
  Star,
  MessageSquare,
  Settings,
  Shield,
  Library,
  Megaphone,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  sectionPaths?: string[]
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  {
    label: 'Kepribadian',
    href: '/student/personality',
    icon: Compass,
    sectionPaths: ['/student/personality', '/student/assessment'],
  },
  { label: 'Belajar Saya', href: '/student/learning', icon: BookOpen },
  { label: 'Tutor Privat', href: '/student/tutors', icon: GraduationCap },
  { label: 'Pembayaran', href: '/student/payments', icon: CreditCard },
  { label: 'Pesan', href: '/student/messages', icon: MessageSquare },
  { label: 'Pengaturan', href: '/student/settings', icon: Settings },
]

export const TUTOR_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/tutor/dashboard', icon: LayoutDashboard },
  { label: 'Pesan Murid', href: '/tutor/messages', icon: MessageSquare },
  { label: 'Jam Ketersediaan', href: '/tutor/availability', icon: Calendar },
  { label: 'Riwayat Sesi Belajar', href: '/tutor/sessions', icon: Clock },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Admin Overview', href: '/admin/dashboard', icon: Shield },
  { label: 'Kelola Asesmen & Soal', href: '/admin/assessments', icon: ClipboardList },
  { label: 'Kelola Kursus', href: '/admin/courses', icon: Library },
  { label: 'Pengumuman', href: '/admin/announcements', icon: Megaphone },
  { label: 'Program Les Privat', href: '/admin/private-tutoring', icon: GraduationCap },
  { label: 'Verifikasi Pembayaran', href: '/admin/payments', icon: CreditCard },
  { label: 'Moderasi Ulasan', href: '/admin/reviews', icon: Star },
  { label: 'Kelola Pengguna', href: '/admin/users', icon: GraduationCap },
  { label: 'Katalog Mata Pelajaran', href: '/admin/subjects', icon: BookOpen },
  { label: 'Pengaturan Sistem', href: '/student/settings', icon: Settings },
]

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return pathname === item.href || (item.sectionPaths?.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  ) ?? false)
}

export function getNavItemsForRole(role: UserRole | null): NavItem[] {
  if (role === 'super_admin') return ADMIN_NAV_ITEMS
  if (role === 'admin') return ADMIN_NAV_ITEMS.filter((item) => item.href !== '/admin/payments')
  if (role === 'tutor') return TUTOR_NAV_ITEMS
  return STUDENT_NAV_ITEMS
}
