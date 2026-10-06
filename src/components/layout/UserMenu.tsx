import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { Settings, HelpCircle, LogOut, ChevronDown, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/utils/format'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { profile, role, signOut } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fullName = profile?.full_name || 'Pengguna'
  const email = profile?.email || ''
  const initials = getInitials(fullName)

  const handleSignOut = async () => {
    setIsOpen(false)
    try {
      await signOut()
    } catch {
      // handled
    }
  }

  const roleLabel =
    role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : role === 'tutor' ? 'Tutor' : 'Siswa'

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu Pengguna"
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl bg-white border border-border/80 hover:bg-[#EEF0F8] transition-colors focus-visible:outline-2 focus-visible:outline-[#6C5CE7]"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8F7FF7] text-white flex items-center justify-center font-bold text-xs shadow-sm">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{fullName}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{roleLabel}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-border shadow-xl p-2 z-50 animate-in fade-up">
          {/* User Info Header */}
          <div className="px-3 py-2.5 border-b border-border/60">
            <p className="text-sm font-bold text-foreground truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EFEDFD] text-[#6C5CE7]">
              <ShieldCheck className="w-3 h-3" />
              <span>{roleLabel}</span>
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              to="/student/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-[#EEF0F8] transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Pengaturan Akun</span>
            </Link>
            <Link
              to="/student/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-[#EEF0F8] transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              <span>Pusat Bantuan</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="pt-1 border-t border-border/60">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
