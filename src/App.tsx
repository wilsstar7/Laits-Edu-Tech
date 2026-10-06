import { BrowserRouter } from 'react-router'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthProvider'
import { AppRoutes } from '@/routes/AppRoutes'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster richColors position="top-right" closeButton />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
