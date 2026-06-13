import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import AppProviders from './AppProviders.jsx'

// Load Clerk publishable key from env
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Determine if the key is a real value (not the placeholder)
const isValidClerkKey = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isValidClerkKey ? (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <AppProviders />
        </ClerkProvider>
      ) : (
        <AppProviders />
      )}
  </StrictMode>,
)
