"use client";
import React from "react";
import { motion } from "framer-motion";

const SkillHeader = ({ initial, animate, transition }) => {
  return (
    <motion.div
      initial={initial} animate={animate} transition={transition}
      className="absolute top-10 left-0 w-full z-20 flex justify-center pointer-events-none"
    >
      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight gasoek-one-regular"
        style={{
          textShadow: "3px 3px 0 #1a1a1a, 5px 5px 0px rgba(0,0,0,0.5)",
        }}
      >
        Choose Your Skill
      </h1>
    </motion.div>
  );
};

export default SkillHeader;
