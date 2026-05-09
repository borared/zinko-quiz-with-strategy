import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/global/Navbar";
import Hero from "./page/landing/Hero";
import Engagement from "./page/landing/Engagement";
import WhyZinko from "./page/landing/WhyZinko";
import Ready from "./page/landing/Ready";
import Footer from "./components/global/Footer";
import EnterPin from "./page/PinJoiningGate/EnterPin";
import EnterNickname from "./page/PinJoiningGate/EnterNickname";
import ChooseTeam from "./page/PinJoiningGate/ChooseTeam";
import TeamWarmUp from "./page/PinJoiningGate/TeamWarmUp";
import Signup from "./components/Authentication/Signup";
import Signin from "./components/Authentication/Signin";
import PricingPanel from "./page/PricingPanel/PricingPanel";
import { TransitionProvider } from "./context/TransitionContext";
import EyeBlinkOverlay from "./components/transition/EyeBlinkOverlay";

const LandingPage = () => (
  <>
    <Hero />
    <Engagement />
    <WhyZinko />
    <Ready />
  </>
);

function AppInner() {
  const location = useLocation();
  const gameFlowPaths = ['/join', '/join-nickname', '/choose-team', '/team-warmup'];
  const showNavbar = !gameFlowPaths.includes(location.pathname);
  const showFooter = !gameFlowPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-zk-yellow flex flex-col font-sans overflow-hidden">
      {/* Full-screen eye blink overlay — sits above everything */}
      <EyeBlinkOverlay />

      {showNavbar && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/join" element={<EnterPin />} />
          <Route path="/join-nickname" element={<EnterNickname />} />
          <Route path="/choose-team" element={<ChooseTeam />} />
          <Route path="/team-warmup" element={<TeamWarmUp />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/pricing" element={<PricingPanel />} />
        </Routes>
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