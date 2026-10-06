import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Unhandled React Render Error in ErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[#F4F5FB] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-border/80 shadow-lg p-6 sm:p-8 text-center space-y-5 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-[#17181C] tracking-tight">
                Terjadi Kendala Teknis
              </h1>
              <p className="text-xs text-[#676A78] leading-relaxed max-w-sm mx-auto">
                Aplikasi mengalami masalah saat memuat komponen ini. Silakan muat ulang halaman atau coba lagi beberapa saat lagi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto text-xs min-h-[44px] rounded-xl flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4 text-[#676A78]" />
                <span>Ke Beranda</span>
              </Button>
              <Button
                variant="default"
                onClick={this.handleReset}
                className="w-full sm:w-auto text-xs min-h-[44px] rounded-xl flex items-center justify-center gap-2 bg-[#6C5CE7] hover:bg-[#5B4CD7] text-white font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
