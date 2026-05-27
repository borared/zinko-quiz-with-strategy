import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ToastProvider } from './context/ToastContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Determine if the key is a real value (not the placeholder)
const isValidClerkKey = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here');

const AppTree = (
  <StrictMode>
    {isValidClerkKey ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <BrowserRouter>
          <SocketProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </SocketProvider>
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      // Clerk key missing or placeholder – render app without Clerk
      <BrowserRouter>
        <SocketProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SocketProvider>
      </BrowserRouter>
    )}
  </StrictMode>
);

const root = document.getElementById('root');

// If #root has element children it means the server pre-rendered this page (SSG).
// Use hydrateRoot to attach React to the existing HTML — no blank flash, instant paint.
// If #root is empty (or only has the ssr-outlet comment), use createRoot for normal CSR behaviour.
if (root.children.length > 0) {
  hydrateRoot(root, AppTree);
} else {
  createRoot(root).render(AppTree);
}
