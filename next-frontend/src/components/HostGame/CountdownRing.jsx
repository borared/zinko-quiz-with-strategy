"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function CountdownRing({ timeLeft, total }) {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const dashOffset = circ * (1 - progress);
  const color =
    timeLeft <= 5 ? "#FF4B4B" : timeLeft <= 10 ? "#F39C12" : "#FFCD29";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112">
        <circle
          cx="56" cy="56" r={radius}
          strokeWidth="7" stroke="rgba(0,0,0,0.15)" fill="none"
        />
        <circle
          cx="56" cy="56" r={radius}
          strokeWidth="7" stroke={color} fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <motion.span
        key={timeLeft}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="text-4xl font-black z-10"
        style={{ color }}
      >
        {timeLeft}
      </motion.span>
    </div>
  );
}
