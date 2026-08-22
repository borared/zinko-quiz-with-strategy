"use client";
import React, { useState } from "react";
import SkillHeader from "@/components/ChoosingSkill/SkillHeader";
import SkillTimer from "@/components/ChoosingSkill/SkillTimer";
import { SKILLS } from "@/config/skills";

export default function TestChooseSkill() {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [previewedSkillId, setPreviewedSkillId] = useState(SKILLS[0].id);
  
  // Mock teammates picking skills
  const [teamSkills] = useState({
    A: {
      rabbit: { playerId: "teammate1", nickname: "Alex", avatar: "/avatars/fox.png" } // mock avatar
    }
  });

  const playerId = "player1";
  const team = "A";
  const myTeamSkills = teamSkills[team] || {};

  const handleSelectSkill = (skillId) => {
    setSelectedSkill(skillId);
    setPreviewedSkillId(skillId);
  };

  const handleCancelSkill = (skillId) => {
    setSelectedSkill(null);
  };

  const currentPreviewedSkill = SKILLS.find(s => s.id === previewedSkillId) || SKILLS[0];

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

      {/* Split Screen Container */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-[1100px] h-[65vh] md:h-[70vh] gap-6 px-6 mt-16 md:mt-24">
        
        {/* LEFT PANEL - Detail View */}
        <div className="flex-1 lg:self-center bg-zk-panel-bg/95 border border-black/30 rounded-xl p-6 md:p-8 flex flex-col-reverse md:flex-row items-center md:items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="flex-1 flex flex-col justify-center text-center md:text-left">
            <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">Selected Skill Details</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wide mb-4 zinko-font drop-shadow-sm whitespace-nowrap">
              {currentPreviewedSkill.name}
            </h2>
            <div className="bg-black/25 px-4 py-3 rounded-lg border border-black/25 mb-4 text-[#FFE600] font-semibold text-base leading-relaxed inline-block mx-auto md:mx-0">
              {currentPreviewedSkill.skillDescription}
            </div>
            
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              {currentPreviewedSkill.id === 'rabbit' && "Use the Rabbit skill to double your earned points if your team answers correctly in under 5 seconds. Perfect for high confidence questions!"}
              {currentPreviewedSkill.id === 'fox' && "Deploy the Fox smokescreen to blind the enemy team's leader with a cover of smoke for 5 seconds, causing disruption to their view."}
              {currentPreviewedSkill.id === 'butterfly' && "Activate the Oracle to reveal and remove two incorrect answer choices immediately, leaving you with a clean 50/50 choice."}
              {currentPreviewedSkill.id === 'frog' && "Lash out with the Sticky Tongue to steal 50% of the fastest enemy's round points if they answer correctly."}
            </p>

            {/* Selection CTAs */}
            <div className="mt-4 w-full">
              {selectedSkill === currentPreviewedSkill.id ? (
                <button
                  onClick={() => handleCancelSkill(currentPreviewedSkill.id)}
                  className="w-full bg-[#FF4B4B] text-white font-black px-6 py-3 border border-black/30 rounded-md hover:brightness-105 active:translate-y-0.5 transition-all tracking-wide text-sm"
                >
                  Cancel Selection
                </button>
              ) : (
                <button
                  onClick={() => {
                    const locker = myTeamSkills[currentPreviewedSkill.id];
                    const isLockedByTeammate = locker && locker.playerId !== playerId;
                    if (!isLockedByTeammate) handleSelectSkill(currentPreviewedSkill.id);
                  }}
                  disabled={selectedSkill !== null || (myTeamSkills[currentPreviewedSkill.id] && myTeamSkills[currentPreviewedSkill.id].playerId !== playerId)}
                  className="w-full bg-zk-blue disabled:bg-gray-600 disabled:opacity-40 text-white font-black px-6 py-3 border border-black/30 rounded-md hover:brightness-105 active:translate-y-0.5 transition-all tracking-wide text-sm"
                >
                  {myTeamSkills[currentPreviewedSkill.id] && myTeamSkills[currentPreviewedSkill.id].playerId !== playerId
                    ? "Locked by Teammate"
                    : selectedSkill !== null
                    ? "Already Selected Another Skill"
                    : "Confirm Selection"}
                </button>
              )}
            </div>
          </div>

          {/* Icon/Color Representation */}
          <div className="w-full md:w-64 flex flex-col items-center justify-center flex-shrink-0 relative">
            <div
              className="w-40 h-40 md:w-48 md:h-48 rounded-tl-[32px] rounded-br-[32px] rounded-tr-[4px] rounded-bl-[4px] border-[4px] border-black overflow-hidden shadow-lg relative transform rotate-3"
              style={{ backgroundColor: currentPreviewedSkill.color }}
            >
              <img
                src={`/images/skills/${currentPreviewedSkill.id}.png`}
                alt={currentPreviewedSkill.name}
                className="w-full h-full object-contain p-2"
              />
            </div>
            
            {myTeamSkills[currentPreviewedSkill.id] && (
              <div className="mt-4 flex items-center gap-2 bg-black/30 border border-black/20 rounded-md px-3 py-1.5">
                <span className="text-white text-xs font-bold">
                  Chosen by {myTeamSkills[currentPreviewedSkill.id].playerId === playerId ? "You" : myTeamSkills[currentPreviewedSkill.id].nickname}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Sidebar Selector */}
        <div className="w-full lg:w-[350px] flex flex-col gap-3 justify-center">
          {SKILLS.map((skill) => {
            const Icon = skill.icon;
            const locker = myTeamSkills[skill.id];
            const isLockedByTeammate = locker && locker.playerId !== playerId;
            const isSkillSelected = selectedSkill === skill.id;

            return (
              <div
                key={skill.id}
                onClick={() => setPreviewedSkillId(skill.id)}
                className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-all duration-150 relative overflow-hidden
                  ${previewedSkillId === skill.id 
                    ? 'border-zk-blue bg-[#222222]/90 scale-[1.02] shadow-md' 
                    : 'border-black/30 bg-[#1a1a1a]/80 hover:bg-[#1a1a1a]/95'
                  }`}
              >
                {/* Skill Icon */}
                <div 
                  className="w-12 h-12 rounded-tl-xl rounded-br-xl rounded-tr-[2px] rounded-bl-[2px] border border-black/30 flex flex-shrink-0 items-center justify-center"
                  style={{ backgroundColor: skill.color }}
                >
                  {Icon && <Icon size={24} className="text-white" strokeWidth={2.5} />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-base truncate">{skill.name}</h4>
                  <p className="text-gray-400 text-xs truncate">{skill.skillDescription.split(':')[0]}</p>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isSkillSelected && (
                    <span className="bg-[#FFE600] text-black border border-black/20 text-[10px] font-black px-2 py-0.5 rounded-md">
                      Selected
                    </span>
                  )}
                  {isLockedByTeammate && (
                    <div className="flex items-center gap-1 bg-black/40 border border-black/20 rounded px-1.5 py-0.5" title={`Chosen by ${locker.nickname}`}>
                      <span className="text-white text-[9px] font-bold max-w-[40px] truncate">{locker.nickname}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <SkillTimer />
    </div>
  );
}
