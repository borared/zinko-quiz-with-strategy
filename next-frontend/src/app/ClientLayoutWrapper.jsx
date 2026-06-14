"use client";
import EyeBlinkOverlay from '@/components/transition/EyeBlinkOverlay';
import SoundToggle from '@/components/global/SoundToggle';
import Navbar from '@/components/global/Navbar';
import Footer from '@/components/global/Footer';
import AuthSync from '@/components/Authentication/AuthSync';
import ToastContainer from '@/components/global/ToastContainer';
import { usePathname } from 'next/navigation';

const NO_NAVBAR_PATHS = [
  "/join-nickname",
  "/choose-team",
  "/team-warmup",
  "/choose-skill",
  "/sso-callback",
];

const GAME_FLOW_PATHS = [
  "/join",
  "/join-nickname",
  "/choose-team",
  "/team-warmup",
  "/choose-skill",
  "/create-game",
  "/dashboard",
  "/host",
  "/play",
];

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  
  const isFullScreen = pathname.startsWith("/host/") || pathname.startsWith("/play/");
  const showNavbar = !NO_NAVBAR_PATHS.includes(pathname) && !isFullScreen;
  const isGameFlow = GAME_FLOW_PATHS.some((p) => pathname.startsWith(p));
  const showFooter = !isGameFlow && !isFullScreen;

  return (
    <>
      <AuthSync />
      <EyeBlinkOverlay />
      <SoundToggle />
      <ToastContainer />
      {showNavbar && <Navbar />}
      <main className={`flex-1 flex flex-col ${showNavbar ? "pt-[76px]" : ""}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}
