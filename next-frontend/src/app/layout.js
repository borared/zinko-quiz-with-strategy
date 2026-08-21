import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import { ThemeProvider } from '@/components/global/ThemeProvider';
import { Inter, Outfit, Permanent_Marker, Gasoek_One, Kantumruy_Pro, Amatic_SC } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const permanentMarker = Permanent_Marker({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-permanent-marker',
});

const gasoekOne = Gasoek_One({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gasoek-one',
});

const kantumruyPro = Kantumruy_Pro({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  subsets: ['khmer', 'latin'],
  display: 'swap',
  variable: '--font-kantumruy-pro',
});

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
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://content-panda-63.clerk.accounts.dev" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://content-panda-63.clerk.accounts.dev" />
          <link rel="preload" href="/lottie/hero.lottie" as="fetch" type="application/json" crossOrigin="anonymous" />
        </head>
        <body className={`min-h-screen bg-zk-bg flex flex-col font-sans transition-colors duration-300 ${inter.variable} ${outfit.variable} ${permanentMarker.variable} ${gasoekOne.variable} ${kantumruyPro.variable} ${amaticSC.variable}`}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
