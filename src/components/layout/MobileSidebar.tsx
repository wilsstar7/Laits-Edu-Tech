import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
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
      <div
        className="fixed inset-0 bg-black/60 transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 left-0 w-[300px] max-w-[88vw] bg-[#0F1D33] shadow-2xl flex flex-col z-10 transition-transform duration-200 animate-in slide-in-from-left">
        <div className="absolute top-3.5 right-3.5 z-20">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Tutup</span>
          </button>
        </div>

        <Sidebar onNavigate={onClose} className="border-r-0" />
      </div>
    </div>
  )
}
