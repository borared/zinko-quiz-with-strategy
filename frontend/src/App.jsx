import React from "react";
import Navbar from "./components/global/Navbar";
import Hero from "./page/landing/Hero";
import Engagement from "./page/landing/Engagement";
import WhyZinko from "./page/landing/WhyZinko";
import Ready from "./page/landing/Ready";
import Footer from "./components/global/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-zk-yellow flex flex-col font-sans">
      <Navbar />
      <Hero />
      <Engagement />
      <WhyZinko />
      <Ready />
      <Footer />
    </div>
  )
}