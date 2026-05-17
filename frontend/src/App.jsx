import React, { lazy, Suspense, memo, useMemo } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
const EnterPin        = lazy(() => import("./page/PinJoiningGate/EnterPin"));
const EnterNickname   = lazy(() => import("./page/PinJoiningGate/EnterNickname"));
const ChooseTeam      = lazy(() => import("./page/PinJoiningGate/ChooseTeam"));
const TeamWarmUp      = lazy(() => import("./page/PinJoiningGate/TeamWarmUp"));
const ChoosingSkill   = lazy(() => import("./page/PinJoiningGate/ChoosingSkill"));
const Signup          = lazy(() => import("./components/Authentication/Signup"));
const Signin          = lazy(() => import("./components/Authentication/Signin"));
const PricingPanel    = lazy(() => import("./page/PricingPanel/PricingPanel"));
const GameCreator     = lazy(() => import("./page/GameCreator/GameCreator"));
const Dashboard       = lazy(() => import("./page/Dashboard/Dashboard"));
const SSOCallbackView = lazy(() => import("./page/Authentication/SSOCallbackView"));

// ─── Suspense fallback ────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-zk-yellow flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-[4px] border-zk-black border-t-transparent rounded-full animate-spin" />
      <p className="font-black text-zk-black uppercase tracking-widest text-sm">Loading...</p>
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

// ─── Route constants (prevents re-creation on every render) ──────────────────
const GAME_FLOW_PATHS    = ['/join', '/join-nickname', '/choose-team', '/team-warmup', '/choose-skill', '/create-game', '/dashboard'];
const NO_NAVBAR_PATHS    = ['/join-nickname', '/choose-team', '/team-warmup', '/choose-skill', '/sso-callback'];

function AppInner() {
  const location = useLocation();

  const isGameFlow  = useMemo(() => GAME_FLOW_PATHS.some(p => location.pathname.startsWith(p)), [location.pathname]);
  const showNavbar  = useMemo(() => !NO_NAVBAR_PATHS.includes(location.pathname), [location.pathname]);
  const showFooter  = !isGameFlow;

  return (
    <div className="min-h-screen bg-zk-yellow flex flex-col font-sans overflow-hidden">
      <EyeBlinkOverlay />
      <SoundToggle />

      {showNavbar && <Navbar />}
      <main className={`flex-1 flex flex-col ${showNavbar ? 'pt-[76px]' : ''}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                    element={<LandingPage />} />
            <Route path="/join"                element={<EnterPin />} />
            <Route path="/join-nickname"       element={<EnterNickname />} />
            <Route path="/choose-team"         element={<ChooseTeam />} />
            <Route path="/team-warmup"         element={<TeamWarmUp />} />
            <Route path="/choose-skill"        element={<ChoosingSkill />} />
            <Route path="/signup"              element={<Signup />} />
            <Route path="/signin"              element={<Signin />} />
            <Route path="/pricing"             element={<PricingPanel />} />
            <Route path="/sso-callback"        element={<SSOCallbackView />} />
            <Route path="/create-game"         element={<GameCreator />} />
            <Route path="/create-game/:quizId" element={<GameCreator />} />
            <Route path="/dashboard"           element={<Dashboard />} />
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