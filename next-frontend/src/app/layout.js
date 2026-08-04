import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import { Amatic_SC } from 'next/font/google';

const amaticSC = Amatic_SC({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-amatic-sc',
});

export const metadata = {
  title: 'Zinko Quiz',
  description: 'Interactive real-time quiz game',
  icons: {
    icon: '/Zinkofavicon.png',
  },
};

export default function RootLayout({ children }) {
  // DEBUG: confirm env var is loaded server-side
  console.log('[Layout] CLERK KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'FOUND ✓' : 'MISSING ✗');
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://content-panda-63.clerk.accounts.dev" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://content-panda-63.clerk.accounts.dev" />
          <link href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Gasoek+One&family=Inter:wght@400;700&family=Outfit:wght@400;700&family=Permanent+Marker&family=Kantumruy+Pro:wght@100..700&display=swap" rel="stylesheet" />
        </head>
        <body className={`min-h-screen bg-zk-yellow flex flex-col font-sans ${amaticSC.variable}`}>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
