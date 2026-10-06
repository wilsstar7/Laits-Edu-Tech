import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'
import { Header } from './Header'
import { env } from '@/lib/env'
import { AlertCircle } from 'lucide-react'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F4F5FB] flex flex-row antialiased text-[#1D1D24]">
      {/* Desktop Sidebar (Fixed 270px width) */}
      <div className="hidden lg:block lg:w-[270px] lg:shrink-0 h-screen sticky top-0 z-40">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Supabase Unconfigured Notice Banner (Only if env is not set) */}
        {!env.isSupabaseConfigured && (
          <div className="bg-[#FDF4E2] border-b border-[#F2B84B]/30 px-4 py-2.5 text-xs text-[#92580E] flex items-center justify-between z-40">
            <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F2B84B]" />
              <span>
                <strong>Mode Pratinjau Lokal / Setup Supabase:</strong> Variabel lingkungan{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/5 font-mono">VITE_SUPABASE_URL</code> dan{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/5 font-mono">VITE_SUPABASE_ANON_KEY</code> belum dikonfigurasi. Hubungkan project Supabase Anda untuk fungsionalitas penuh.
              </span>
            </div>
          </div>
        )}

        {/* Global Application Header */}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
