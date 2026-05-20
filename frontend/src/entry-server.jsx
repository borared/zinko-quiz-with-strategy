// entry-server.jsx
// Server-side render entry — used by scripts/prerender.mjs at build time.
// Does NOT include ClerkProvider (Clerk uses window/document which don't exist in Node.js).
// The landing page components (Hero, Engagement, WhyZinko, Ready) have zero auth dependencies.
// After hydration in the browser, entry-client.jsx wraps everything with ClerkProvider normally.

import React from 'react';
import { renderToString } from 'react-dom/server';
// Use MemoryRouter (main package export) instead of StaticRouter from react-router-dom/server.
// react-router-dom v7 changed the ./server export conditions — MemoryRouter is SSR-safe
// and fully compatible with renderToString. initialEntries simulates the request URL.
import { MemoryRouter } from 'react-router-dom';

// ── Public page components (no auth dependency) ───────────────────────────────
import Hero       from './page/Landing/Hero.jsx';
import Engagement from './page/Landing/Engagement.jsx';
import WhyZinko   from './page/Landing/WhyZinko.jsx';
import Ready      from './page/Landing/Ready.jsx';

// ── Layout wrapper matching the client-side App shell ─────────────────────────
const LandingShell = () => (
  <div className="min-h-screen bg-zk-yellow flex flex-col font-sans overflow-hidden">
    <Hero />
    <Engagement />
    <WhyZinko />
    <Ready />
  </div>
);

// ── Route map: url → component ────────────────────────────────────────────────
const ROUTES = {
  '/': <LandingShell />,
};

/**
 * render(url)
 * Called by the prerender script for each public route.
 * Returns a full HTML string ready to be injected into the #root element.
 */
export function render(url) {
  const component = ROUTES[url];

  if (!component) {
    throw new Error(`No SSG route configured for "${url}". Add it to ROUTES in entry-server.jsx.`);
  }

  return renderToString(
    <MemoryRouter initialEntries={[url]}>
      {component}
    </MemoryRouter>
  );
}
