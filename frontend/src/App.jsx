import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/global/Navbar";
import Hero from "./page/landing/Hero";
import Engagement from "./page/landing/Engagement";
import WhyZinko from "./page/landing/WhyZinko";
import Ready from "./page/landing/Ready";
import Footer from "./components/global/Footer";
import EnterPin from "./page/PinJoiningGate/EnterPin";
import Signup from "./components/Authentication/Signup";
import Signin from "./components/Authentication/Signin";

const LandingPage = () => (
  <>
    <Hero />
    <Engagement />
    <WhyZinko />
    <Ready />
  </>
);

export default function App() {
  return (
    <div className="min-h-screen bg-zk-yellow flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/join" element={<EnterPin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}