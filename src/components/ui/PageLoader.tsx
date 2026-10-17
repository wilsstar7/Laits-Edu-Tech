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
      className={`w-full flex flex-col items-center justify-center p-6 bg-[#F4F6FA] select-none ${
        fullScreen ? 'min-h-screen' : 'min-h-[420px]'
      } ${className}`}
    >
      <span className="sr-only">Halaman sedang dimuat, mohon tunggu...</span>

      {/* Elegant Card Surface */}
      <div className="bg-white/95 backdrop-blur-sm border border-black/[0.06] rounded-3xl p-8 sm:p-10 shadow-[0_4px_24px_-8px_rgba(15,29,51,0.08)] max-w-xs sm:max-w-sm w-full flex flex-col items-center text-center">
        {/* Animated Brand Mark */}
        <div className="relative flex items-center justify-center mb-5">
          {/* Orbital Spinner Track */}
          <div
            className="w-20 h-20 rounded-full border-2 border-[#183058]/15 border-t-[#183058] animate-spin"
            style={{ animationDuration: '2.4s', animationTimingFunction: 'linear' }}
            aria-hidden="true"
          />

          {/* Centered Brand Icon */}
          <div className="absolute w-13 h-13 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md shadow-[#183058]/15 ring-1 ring-[#183058]/10">
            <img
              src="/logo-mark.png"
              alt="Logo Persona Academy"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col items-center">
          <div className="font-bold text-[#0F1D33] text-base tracking-tight flex items-center gap-1.5">
            PERSONA
            <span className="text-[#183058] font-semibold text-xs tracking-wider uppercase">
              ACADEMY
            </span>
          </div>
          <span className="text-[10px] text-[#676A78] font-semibold uppercase tracking-wider mt-0.5">
            Learning by Intelligence Type
          </span>
          <p className="mt-2 text-xs text-[#676A78] font-medium leading-relaxed">
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
          className="mt-6 w-36 sm:w-44 h-1 bg-[#E8ECF6] rounded-full overflow-hidden relative"
          aria-hidden="true"
        >
          <div className="h-full bg-gradient-to-r from-[#183058] via-[#B0B4E0] to-[#183058] rounded-full animate-indeterminate-slide" />
        </div>
      </div>
    </div>
  )
}
