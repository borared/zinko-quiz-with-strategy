import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import ClientLayoutWrapper from './ClientLayoutWrapper';

export const metadata = {
  title: 'Zinko Quiz',
  description: 'Interactive real-time quiz game',
  icons: {
    icon: '/Zinkofavicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Gasoek+One&family=Inter:wght@400;700&family=Outfit:wght@400;700&family=Permanent+Marker&display=swap" rel="stylesheet" />
        </head>
        <body className="min-h-screen bg-zk-yellow flex flex-col font-sans">
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
