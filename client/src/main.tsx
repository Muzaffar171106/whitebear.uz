import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { LangProvider } from '@/langs/lang'
import { ClerkProvider } from '@clerk/react'
import { SWRConfig } from 'swr'
import { ThemeProvider } from '@/theme/theme-provider'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <LangProvider>
      <SWRConfig
        value={{
          dedupingInterval: 60_000,
          focusThrottleInterval: 120_000,
          revalidateOnFocus: false,
          revalidateIfStale: false,
          errorRetryCount: 2,
          errorRetryInterval: 5_000,
          keepPreviousData: true,
        }}
      >
        <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ClerkProvider>
      </SWRConfig>
    </LangProvider>
  </ThemeProvider>
)
