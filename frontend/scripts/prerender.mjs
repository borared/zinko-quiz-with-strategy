/**
 * scripts/prerender.mjs
 *
 * Zinko SSG Pre-render Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs AFTER `vite build` and `vite build --ssr` complete.
 *
 * What it does:
 *   1. Reads the built dist/index.html (the HTML shell from Vite)
 *   2. Imports the SSR bundle (dist-ssr/entry-server.js)
 *   3. Calls render(url) for each public route
 *   4. Replaces <!--ssr-outlet--> with the pre-rendered HTML
 *   5. Writes the final static HTML to dist/
 *
 * Result:
 *   dist/index.html → pre-rendered landing page (instant first paint)
 *
 * Auth-gated routes (Dashboard, GameCreator, etc.) are NOT pre-rendered.
 * They remain CSR — entry-client.jsx detects #root is empty and uses createRoot.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir   = join(__dirname, '..');
const distDir   = join(rootDir, 'dist');
const ssrDir    = join(rootDir, 'dist-ssr');

// Routes to pre-render (must match ROUTES in entry-server.jsx)
const PRERENDER_ROUTES = ['/'];

async function prerender() {
  console.log('\n🚀 Zinko SSG Pre-render Starting...\n');

  // Load the SSR bundle — use pathToFileURL for Windows compatibility
  // (Node.js ESM loader requires file:// URLs on Windows, not raw C:\ paths)
  const serverEntry = pathToFileURL(join(ssrDir, 'entry-server.js')).href;
  const { render } = await import(serverEntry);

  // Load the HTML shell (with <!--ssr-outlet--> placeholder)
  const template = readFileSync(join(distDir, 'index.html'), 'utf-8');

  for (const route of PRERENDER_ROUTES) {
    try {
      console.log(`  ⚡ Pre-rendering: ${route}`);

      // Render the route to an HTML string
      const appHtml = render(route);

      // Inject into the HTML shell
      const html = template.replace('<!--ssr-outlet-->', appHtml);

      // Determine output path
      const isRoot  = route === '/';
      const outPath = isRoot
        ? join(distDir, 'index.html')
        : join(distDir, ...route.slice(1).split('/'), 'index.html');

      // Create directory if needed (for nested routes)
      if (!isRoot) {
        mkdirSync(dirname(outPath), { recursive: true });
      }

      writeFileSync(outPath, html);
      console.log(`  ✅ Written: ${outPath.replace(rootDir, '')}`);
    } catch (err) {
      // If a route fails, log but don't crash — CSR fallback still works
      console.warn(`  ⚠️  Pre-render failed for ${route}:`, err.message);
      console.warn('     Falling back to CSR for this route.\n');
    }
  }

  console.log('\n✨ SSG Pre-render Complete!\n');
}

prerender().catch((err) => {
  console.error('❌ Prerender script crashed:', err);
  process.exit(1);
});
