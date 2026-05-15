import React, { useState } from "react";
import { motion } from "framer-motion";
import SkillHeader from "./SkillHeader";
import SkillCard from "./SkillCard";
import SkillTimer from "./SkillTimer";

const bounceIn = () => ({
  initial: { scale: 0.8, opacity: 0, y: 30 },
  animate: { scale: 1, opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 1200, damping: 12, mass: 0.2 },
});

const skills = [
  {
    id: "rabbit",
    name: "Rabbit",
    imageUrl:
      "https://res.cloudinary.com/dicrvjstp/image/upload/v1778752131/Gemini_Generated_Image_9u48gx9u48gx9u48_o1sfzh.png",
    skillDescription: "Blocks & Counters All Attacks",
  },
  {
    id: "frog",
    name: "Frog",
    imageUrl:
      "https://res.cloudinary.com/dicrvjstp/image/upload/v1778752125/Gemini_Generated_Image_f6m0juf6m0juf6m0_ckftjf.png",
    skillDescription: "Destroys 50% of Enemy Points",
  },
  {
    id: "fox",
    name: "Fox",
    imageUrl:
      "https://res.cloudinary.com/dicrvjstp/image/upload/v1778752126/Gemini_Generated_Image_r62tolr62tolr62t_aktq15.png",
    skillDescription: "Steals 30% of Enemy Points",
  },
  {
    id: "butterfly",
    name: "Butterfly",
    imageUrl:
      "https://res.cloudinary.com/dicrvjstp/image/upload/v1778752122/Gemini_Generated_Image_nwn3pnwn3pnwn3pn_vwj9de.png",
    skillDescription: "Boosts Team Points by +20%",
  },
];

const ChoosingSkillSection = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);

  return (
    <div
      className="relative w-full h-screen max-h-screen overflow-hidden flex flex-col items-center justify-center font-sans bg-cover bg-center"
      style={{ backgroundImage: `url('/background_battle/city.jpg')` }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <SkillHeader {...bounceIn()} />



      {/* Cards Container - Occupies the middle section filling full width */}
      <div className="relative z-10 flex w-full h-[65vh] md:h-[70vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-zk-black">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            {...skill}
            isSelected={selectedSkill === skill.id}
            isLocked={selectedSkill !== null && selectedSkill !== skill.id}
            onClick={() => {
              if (!selectedSkill) setSelectedSkill(skill.id);
            }}
            onCancel={(e) => {
              e.stopPropagation();
              setSelectedSkill(null);
            }}
            {...bounceIn()}
          />
        ))}
      </div>

      <SkillTimer />
    </div>
  );
};

export default ChoosingSkillSection;
