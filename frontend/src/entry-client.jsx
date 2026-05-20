import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ToastProvider } from './context/ToastContext.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in your .env file');
}

const AppTree = (
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);

const root = document.getElementById('root');

// If #root already has children it means the server pre-rendered this page (SSG).
// Use hydrateRoot to attach React to the existing HTML — no blank flash, instant paint.
// If #root is empty (auth-gated pages), use createRoot for normal CSR behaviour.
if (root.hasChildNodes()) {
  hydrateRoot(root, AppTree);
} else {
  createRoot(root).render(AppTree);
}
