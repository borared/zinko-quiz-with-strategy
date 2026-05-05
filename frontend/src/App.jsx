import React from "react";
import Navbar from "./components/global/Navbar";
import Hero from "./page/landing/Hero";
import Engagement from "./page/landing/Engagement";

export default function App() {
  return (
    <div className="min-h-screen bg-zk-yellow flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <Engagement />
    </div>
  )
}