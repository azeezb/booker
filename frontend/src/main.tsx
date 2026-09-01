import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Auth0ProviderWithNavigate from './components/auth/Auth0ProviderWithNavigate'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Auth0ProviderWithNavigate>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </Auth0ProviderWithNavigate>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
