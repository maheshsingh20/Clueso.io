import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'sonner'
import { ScreenRecordingProvider } from './contexts/ScreenRecordingContext'
import ScreenRecordingIndicator from './components/ScreenRecordingIndicator'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ScreenRecordingProvider>
          <App />
          <ScreenRecordingIndicator />
          <Toaster 
            position="top-right"
            richColors
            closeButton
          />
        </ScreenRecordingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)