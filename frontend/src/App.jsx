import React, { lazy, Suspense, memo, useMemo, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "./services/api";
import { TransitionProvider } from "./context/TransitionContext";
import EyeBlinkOverlay from "./components/Transition/EyeBlinkOverlay";
import SoundToggle from "./components/Global/SoundToggle";
import Navbar from "./components/Global/Navbar";
import Footer from "./components/Global/Footer";

// ─── Eagerly loaded (always needed on first paint) ───────────────────────────
import Hero from "./page/Landing/Hero";
import Engagement from "./page/Landing/Engagement";
import WhyZinko from "./page/Landing/WhyZinko";
import Ready from "./page/Landing/Ready";

// ─── Lazily loaded (each becomes its own JS chunk) ───────────────────────────
const EnterPin = lazy(() => import("./page/PinJoiningGate/EnterPin"));
const EnterNickname = lazy(() => import("./page/PinJoiningGate/EnterNickname"));
const ChooseTeam = lazy(() => import("./page/PinJoiningGate/ChooseTeam"));
const TeamWarmUp = lazy(() => import("./page/PinJoiningGate/TeamWarmUp"));
const ChoosingSkill = lazy(() => import("./page/PinJoiningGate/ChoosingSkill"));
const Signup = lazy(() => import("./components/Authentication/Signup"));
const Signin = lazy(() => import("./components/Authentication/Signin"));
const PricingPanel = lazy(() => import("./page/PricingPanel/PricingPanel"));
const GameCreator = lazy(() => import("./page/GameCreator/GameCreator"));
const Dashboard = lazy(() => import("./page/Dashboard/Dashboard"));
const SSOCallbackView = lazy(
  () => import("./page/Authentication/SSOCallbackView"),
);

// ─── Game Pages ──────────────────────────────────────────────────────────────
const HostLobby = lazy(() => import("./page/Host/HostLobby"));
const HostGame = lazy(() => import("./page/Host/HostGame"));
const PlayerLobby = lazy(() => import("./page/Play/PlayerLobby"));
const PlayerController = lazy(() => import("./page/Play/PlayerController"));
const PlayerResult = lazy(() => import("./page/Play/PlayerResult"));

// ─── Suspense fallback ────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-zk-yellow flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-[4px] border-zk-black border-t-transparent rounded-full animate-spin" />
      <p className="font-black text-zk-black uppercase tracking-widest text-sm">
        Loading...
      </p>
    </div>
  </div>
);

// ─── Landing page (static, no lazy needed) ───────────────────────────────────
const LandingPage = memo(() => (
  <>
    <Hero />
    <Engagement />
    <WhyZinko />
    <Ready />
  </>
));

// ─── Route constants ──────────────────────────────────────────────────────────
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
const NO_NAVBAR_PATHS = [
  "/join-nickname",
  "/choose-team",
  "/team-warmup",
  "/choose-skill",
  "/sso-callback",
];

// Host & Play pages never show navbar/footer
const isGameScreen = (path) =>
  path.startsWith("/host/") || path.startsWith("/play/");

function AppInner() {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  // Sync custom backend JWT when Clerk session changes
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && !localStorage.getItem('zinko_jwt')) {
        api.post('/api/auth/token', {})
          .then(({ token }) => localStorage.setItem('zinko_jwt', token))
          .catch(err => console.error("Failed to fetch custom JWT:", err));
      } else if (!isSignedIn) {
        localStorage.removeItem('zinko_jwt');
      }
    }
  }, [isLoaded, isSignedIn]);

  const isGameFlow = useMemo(
    () => GAME_FLOW_PATHS.some((p) => location.pathname.startsWith(p)),
    [location.pathname],
  );
  const isFullScreen = useMemo(
    () => isGameScreen(location.pathname),
    [location.pathname],
  );
  const showNavbar = useMemo(
    () => !NO_NAVBAR_PATHS.includes(location.pathname) && !isFullScreen,
    [location.pathname, isFullScreen],
  );
  const showFooter = !isGameFlow && !isFullScreen;

  return (
    <div className="min-h-screen bg-zk-yellow flex flex-col font-sans overflow-hidden">
      <EyeBlinkOverlay />
      <SoundToggle />

      {showNavbar && <Navbar />}
      <main className={`flex-1 flex flex-col ${showNavbar ? "pt-[76px]" : ""}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Landing ── */}
            <Route path="/" element={<LandingPage />} />

            {/* ── Auth ── */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/sso-callback" element={<SSOCallbackView />} />
            <Route path="/pricing" element={<PricingPanel />} />

            {/* ── Authenticated ── */}
            <Route path="/create-game" element={<GameCreator />} />
            <Route path="/create-game/:quizId" element={<GameCreator />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* ── Player join flow ── */}
            <Route path="/join" element={<EnterPin />} />
            <Route path="/join-nickname" element={<EnterNickname />} />
            <Route path="/choose-team" element={<ChooseTeam />} />
            <Route path="/team-warmup" element={<TeamWarmUp />} />
            <Route path="/choose-skill" element={<ChoosingSkill />} />

            {/* ── Host screens (big screen / projector) ── */}
            <Route path="/host/lobby/:pin" element={<HostLobby />} />
            <Route path="/host/game/:pin" element={<HostGame />} />

            {/* ── Player screens (mobile controller) ── */}
            <Route path="/play/lobby/:pin" element={<PlayerLobby />} />
            <Route path="/play/game/:pin" element={<PlayerController />} />
            <Route path="/play/result/:pin" element={<PlayerResult />} />
          </Routes>
        </Suspense>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <TransitionProvider>
      <AppInner />
    </TransitionProvider>
  );
}
