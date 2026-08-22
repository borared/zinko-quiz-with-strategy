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

  return (
    <div
      className="relative w-full h-screen max-h-screen overflow-hidden flex flex-col items-center justify-center font-sans bg-cover bg-center"
      style={battleBackgroundStyle(background)}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <SkillHeader {...bounceIn()} />



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
                {...bounceIn()}
              />
            );
          })}
        </div>
      </div>

      <SkillTimer />
    </div>
  );
};

export default ChoosingSkillSection;
