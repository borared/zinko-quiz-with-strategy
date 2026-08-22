"use client";
import React, { useState } from "react";
import SkillHeader from "@/components/ChoosingSkill/SkillHeader";
import SkillCard from "@/components/ChoosingSkill/SkillCard";
import SkillTimer from "@/components/ChoosingSkill/SkillTimer";
import { SKILLS } from "@/config/skills";

export default function TestChooseSkill() {
  const [selectedSkill, setSelectedSkill] = useState(null);
  
  // Mock teammates picking skills
  const [teamSkills] = useState({
    A: {
      rabbit: { playerId: "teammate1", nickname: "Alex", avatar: "pizza" }
    }
  });

  const playerId = "player1";
  const team = "A";
  const myTeamSkills = teamSkills[team] || {};

  const handleSelectSkill = (skillId) => {
    setSelectedSkill(skillId);
  };

  const handleCancelSkill = (skillId) => {
    setSelectedSkill(null);
  };

  return (
    <div
      className="relative w-full h-screen max-h-screen overflow-hidden flex flex-col items-center justify-center font-sans bg-cover bg-center bg-zk-blue"
      style={{
        backgroundImage: `url('/background_battle/city.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <SkillHeader />

      {/* Cards Container - Occupies the middle section filling full width */}
      <div className="relative z-10 flex flex-col w-full h-[65vh] md:h-[70vh] overflow-y-auto px-6 py-4 custom-scrollbar items-center justify-center">
        <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-4 h-full lg:items-stretch lg:justify-center">
          {SKILLS.map((skill, index) => {
            const locker = myTeamSkills[skill.id];
            const isLockedByTeammate = locker && locker.playerId !== playerId;

            return (
              <SkillCard
                key={skill.id}
                {...skill}
                index={index}
                isSelected={selectedSkill === skill.id}
                isLocked={isLockedByTeammate || (selectedSkill !== null && selectedSkill !== skill.id)}
                locker={isLockedByTeammate ? locker : null}
                onClick={() => {
                  if (!selectedSkill && !isLockedByTeammate) handleSelectSkill(skill.id);
                }}
                onCancel={(e) => {
                  e.stopPropagation();
                  handleCancelSkill(skill.id);
                }}
              />
            );
          })}
        </div>
      </div>

      <SkillTimer />
    </div>
  );
}
