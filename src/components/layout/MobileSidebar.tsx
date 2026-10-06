import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-[290px] max-w-[85vw] bg-[#17181C] shadow-2xl flex flex-col z-10 transition-transform duration-300 animate-in slide-in-from-left">
        {/* Close Button Header */}
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#6C5CE7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reusable Sidebar Content */}
        <Sidebar onNavigate={onClose} className="border-r-0" />
      </div>
    </div>
  )
}
