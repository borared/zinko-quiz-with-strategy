"use client";

import { motion } from 'framer-motion';
import PricingHeader from '../../components/Pricing/PricingHeader';
import PricingCard from '../../components/Pricing/PricingCard';
import Testimonial from '../../components/Pricing/Testimonial';
import FAQ from '../../components/Pricing/FAQ';

const PricingPanel = () => {
  const plans = [
    {
      title: "Basic",
      price: "Free",
      subtitle: "Perfect for starting your game journey.",
      buttonText: "GET STARTED",
      theme: "basic",
      isPopular: false,
      features: [
        { icon: "check", text: "Basic Game Modes" },
        { icon: "check", text: "Up to 30 Students" },
        { icon: "check", text: "Public Game Library" },
        { icon: "cross", text: "Live Analytics" },
      ]
    },
    {
      title: "Zamba Pro",
      price: "$6.99",
      subtitle: "Unlock the full power of play.",
      buttonText: "GO PRO NOW",
      theme: "pro",
      isPopular: true,
      features: [
        { icon: "star", text: "Unlimited Private Games" },
        { icon: "star", text: "Advanced Live Analytics" },
        { icon: "star", text: "Team Battle Modes" },
        { icon: "star", text: "Import from Quizlet/Spreadsheets" },
        { icon: "star", text: "No Advertisements" },
      ]
    },
    {
      title: "Zamba Prime",
      price: "$14.99",
      originalPrice: "$19.99",
      subtitle: "Empower your entire department.",
      buttonText: "CONTACT US",
      theme: "school",
      isPopular: false,
      features: [
        { icon: "building", text: "Unlimited Flashcard Sets" },
        { icon: "building", text: "Unlimited Guess Picture Races" },
        { icon: "building", text: "Custom Branding & Themes" },
        { icon: "building", text: "Advanced Live Analytics" },
        { icon: "building", text: "Priority Support" },
      ]
    }
  ];

  return (
    <div className="flex-1 w-full bg-zk-panel-bg relative overflow-hidden pt-16 pb-12 font-sans">
      
      {/* Floating Background Objects */}
      <motion.div 
        animate={{ y: [-15, 15, -15], rotate: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[2%] left-[5%] md:top-[6%] md:left-[10%] w-24 h-24 md:w-32 md:h-32 z-20 pointer-events-none"
      >
        <img src="/heart.png" alt="Kawaii Heart" className="w-full h-full object-contain" />
      </motion.div>

      <motion.div 
        animate={{ y: [20, -20, 20], rotate: 360 }}
        transition={{ y: { duration: 7, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
        className="absolute bottom-[20%] right-[5%] md:bottom-[30%] md:right-[10%] w-16 h-16 md:w-20 md:h-20 bg-[#FF6B4A] border-2 border-zk-border rounded-full pointer-events-none"
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <PricingHeader />

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 items-stretch mb-12">
          {plans.map((plan, idx) => (
            <PricingCard key={idx} {...plan} />
          ))}
        </div>

        <Testimonial />
        <FAQ />

      </div>
    </div>
  );
};

export default PricingPanel;
