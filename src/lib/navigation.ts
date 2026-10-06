import {
  LayoutDashboard,
  Brain,
  Compass,
  BookOpen,
  GraduationCap,
  Calendar,
  TrendingUp,
  CreditCard,
  Clock,
  Star,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  Shield,
  Target,
  Award,
  Library,
  Megaphone,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Kursus Belajar', href: '/student/courses', icon: Library },
  { label: 'Target Belajar', href: '/student/goals', icon: Target },
  { label: 'Pencapaian', href: '/student/achievements', icon: Award },
  { label: 'Asesmen Kepribadian', href: '/student/assessment', icon: Brain },
  { label: 'Tipe Kepribadian', href: '/student/personality', icon: Compass },
  { label: 'Belajar Saya', href: '/student/learning', icon: BookOpen },
  { label: 'Tutor Privat', href: '/student/tutors', icon: GraduationCap },
  { label: 'Jadwal Belajar', href: '/student/schedule', icon: Calendar },
  { label: 'Perkembangan', href: '/student/progress', icon: TrendingUp },
  { label: 'Pembayaran', href: '/student/payments', icon: CreditCard },
  { label: 'Riwayat Sesi', href: '/student/sessions', icon: Clock },
  { label: 'Laporan', href: '/student/reports', icon: FileText },
  { label: 'Pesan', href: '/student/messages', icon: MessageSquare, badge: 'Phase 6' },
  { label: 'Notifikasi', href: '/student/notifications', icon: Bell, badge: 'Phase 6' },
  { label: 'Pengaturan', href: '/student/settings', icon: Settings },
]

export const TUTOR_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/tutor/dashboard', icon: LayoutDashboard },
  { label: 'Jam Ketersediaan', href: '/tutor/availability', icon: Calendar },
  { label: 'Riwayat Sesi Belajar', href: '/tutor/sessions', icon: Clock },
  { label: 'Pengaturan Profil', href: '/student/settings', icon: Settings },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Admin Overview', href: '/admin/dashboard', icon: Shield },
  { label: 'Kelola Kursus', href: '/admin/courses', icon: Library },
  { label: 'Pengumuman', href: '/admin/announcements', icon: Megaphone },
  { label: 'Verifikasi Pembayaran', href: '/admin/payments', icon: CreditCard },
  { label: 'Moderasi Ulasan', href: '/admin/reviews', icon: Star },
  { label: 'Kelola Pengguna', href: '/admin/users', icon: GraduationCap, badge: 'Phase 6' },
  { label: 'Katalog Mata Pelajaran', href: '/admin/subjects', icon: BookOpen, badge: 'Phase 6' },
  { label: 'Pengaturan Sistem', href: '/student/settings', icon: Settings },
]

export function getNavItemsForRole(role: UserRole | null): NavItem[] {
  if (role === 'admin' || role === 'super_admin') return ADMIN_NAV_ITEMS
  if (role === 'tutor') return TUTOR_NAV_ITEMS
  return STUDENT_NAV_ITEMS
}
