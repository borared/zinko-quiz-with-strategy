"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Cloud, Eye, Target } from "lucide-react";
import { useRouter, useParams } from 'next/navigation';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { useSocketStore } from '@/store/useSocketStore';
import SkillHeader from "./SkillHeader";
import SkillCard from "./SkillCard";
import SkillTimer from "./SkillTimer";

const bounceIn = () => ({
  initial: { scale: 0.8, opacity: 0, y: 30 },
  animate: { scale: 1, opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 1200, damping: 12, mass: 0.2 },
});

import { SKILLS } from "../../config/skills";
import { useGameBackground } from '@/hooks/useGameBackground';
import { battleBackgroundStyle } from '@/lib/lobbyScenery';

const ChoosingSkillSection = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [teamSkills, setTeamSkills] = useState({});
  
  const [previewedSkillId, setPreviewedSkillId] = useState(SKILLS[0].id);
  
  const router = useRouter();
  const { pin } = useParams();
  const { getSocket, isConnected } = useSocketStore();
  const { playerId, nickname, team, avatar, isLoaded } = usePlayerSession();
  const background = useGameBackground(pin);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('last_intro_shown_qid');
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isLoaded || !isConnected) return;

    socket.emit('player:sync-state', { pin, playerId });
    socket.emit('lobby:request-skills', { pin });

    const onSkillsUpdate = (data) => {
      setTeamSkills(data.teamSkills || {});
    };

    const onQuestionIntro = (data) => {
      let finalSkill = selectedSkill;
      if (!finalSkill && data.question?.teamSkills && data.question.teamSkills[team]) {
        for (const [sId, info] of Object.entries(data.question.teamSkills[team])) {
          if (info.playerId === playerId) {
            finalSkill = sId;
            break;
          }
        }
      }

      if (finalSkill) {
        sessionStorage.setItem('player_skill', finalSkill);
      } else {
        sessionStorage.removeItem('player_skill');
      }
      
      sessionStorage.setItem('current_question', JSON.stringify(data.question));
      router.push(`/play/${pin}/game`);
    };

    const onSyncStateResponse = (data) => {
      if (data.error) {
        sessionStorage.clear();
        router.push('/');
        return;
      }
      if (data.phase === 'LOBBY') {
        router.push(`/play/${pin}/lobby`);
      } else if (data.phase !== 'SKILL_PICK' && data.phase !== 'FINISHED') {
        router.push(`/play/${pin}/game`);
      } else if (data.phase === 'FINISHED') {
        router.push(`/play/${pin}/result`);
      }
    };

    socket.on('lobby:skills-update', onSkillsUpdate);
    socket.on('game:question-intro', onQuestionIntro);
    socket.on('player:sync-state-response', onSyncStateResponse);

    return () => {
      socket.off('lobby:skills-update', onSkillsUpdate);
      socket.off('game:question-intro', onQuestionIntro);
      socket.off('player:sync-state-response', onSyncStateResponse);
    };
  }, [getSocket, isConnected, isLoaded, router, pin, playerId, team, avatar, selectedSkill]);

  const handleSelectSkill = (skillId) => {
    // Check if teammate took it
    const myTeamSkills = teamSkills[team] || {};
    if (myTeamSkills[skillId] && myTeamSkills[skillId].playerId !== playerId) {
      return; // Locked by teammate
    }

    setSelectedSkill(skillId);
    setPreviewedSkillId(skillId);
    getSocket()?.emit('player:select-skill', {
      pin,
      playerId,
      skillId,
      team,
      nickname,
      avatar
    });
  };

  const handleCancelSkill = (skillId) => {
    setSelectedSkill(null);
    getSocket()?.emit('player:cancel-skill', {
      pin,
      skillId,
      team,
      playerId
    });
  };

  const myTeamSkills = teamSkills[team] || {};
  const currentPreviewedSkill = SKILLS.find(s => s.id === previewedSkillId) || SKILLS[0];

  return (
    <div
      className="relative w-full h-screen max-h-screen overflow-hidden flex flex-col items-center justify-center font-sans bg-cover bg-center"
      style={battleBackgroundStyle(background)}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <SkillHeader {...bounceIn()} />

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
                <img 
                  src={myTeamSkills[currentPreviewedSkill.id].avatar} 
                  alt={myTeamSkills[currentPreviewedSkill.id].nickname} 
                  className="w-6 h-6 rounded object-cover" 
                />
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
                      <img src={locker.avatar} alt={locker.nickname} className="w-4 h-4 rounded object-cover" />
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
};

export default ChoosingSkillSection;
