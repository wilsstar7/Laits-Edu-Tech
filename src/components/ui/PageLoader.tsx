import { Layers } from 'lucide-react'

interface PageLoaderProps {
  /**
   * Status text displayed below the brand title.
   * Default: "Menyiapkan halaman..."
   */
  message?: string
  /**
   * Optional secondary subtitle or hint text.
   */
  subtext?: string
  /**
   * If true (default), spans the full viewport height.
   * If false, centers within its container.
   */
  fullScreen?: boolean
  className?: string
}

export function PageLoader({
  message = 'Menyiapkan halaman...',
  subtext,
  fullScreen = true,
  className = '',
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={`w-full flex flex-col items-center justify-center p-6 bg-[#F4F5FB] select-none ${
        fullScreen ? 'min-h-screen' : 'min-h-[420px]'
      } ${className}`}
    >
      <span className="sr-only">Halaman sedang dimuat, mohon tunggu...</span>

      {/* Elegant Card Surface */}
      <div className="bg-white/95 backdrop-blur-sm border border-black/[0.06] rounded-3xl p-8 sm:p-10 shadow-[0_4px_24px_-8px_rgba(23,24,28,0.06)] max-w-xs sm:max-w-sm w-full flex flex-col items-center text-center">
        {/* Animated Brand Mark */}
        <div className="relative flex items-center justify-center mb-5">
          {/* Orbital Spinner Track */}
          <div
            className="w-18 h-18 rounded-full border-2 border-[#6C5CE7]/15 border-t-[#6C5CE7] animate-spin"
            style={{ animationDuration: '2.4s', animationTimingFunction: 'linear' }}
            aria-hidden="true"
          />

          {/* Centered Brand Icon */}
          <div className="absolute w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8F7FF7] text-white flex items-center justify-center shadow-md shadow-[#6C5CE7]/25 ring-1 ring-white/40">
            <Layers className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col items-center">
          <div className="font-bold text-[#17181C] text-base tracking-tight flex items-center gap-1.5">
            PERSONA
            <span className="text-[#6C5CE7] font-semibold text-xs tracking-wider uppercase">
              ACADEMY
            </span>
          </div>
          <p className="mt-1.5 text-xs text-[#676A78] font-medium leading-relaxed">
            {message}
          </p>
          {subtext && (
            <p className="mt-0.5 text-[11px] text-[#8A8D9A]">
              {subtext}
            </p>
          )}
        </div>

        {/* Indeterminate Sleek Progress Bar */}
        <div
          className="mt-6 w-36 sm:w-44 h-1 bg-[#EEF0F8] rounded-full overflow-hidden relative"
          aria-hidden="true"
        >
          <div className="h-full bg-gradient-to-r from-[#6C5CE7] via-[#8F7FF7] to-[#6C5CE7] rounded-full animate-indeterminate-slide" />
        </div>
      </div>
    </div>
  )
}
