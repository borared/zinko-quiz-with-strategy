import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sword, Shield, HelpCircle, VenetianMask } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
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
    id: "sapper",
    name: "Sapper",
    icon: Sword,
    skillDescription: "50% ATK on 1 Enemy",
    color: "#FF4B4B"
  },
  {
    id: "guardian",
    name: "Guardian",
    icon: Shield,
    skillDescription: "Block All Enemy Skills",
    color: "#3B68FF"
  },
  {
    id: "trickster",
    name: "Trickster",
    icon: HelpCircle,
    skillDescription: "Swap Skill with Enemy",
    color: "#9b59b6"
  },
  {
    id: "illusionist",
    name: "Illusionist",
    icon: VenetianMask,
    skillDescription: "Swap Avatar (Trick Enemy)",
    color: "#27AE60"
  },
];

const ChoosingSkillSection = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [teamSkills, setTeamSkills] = useState({});
  
  const navigate = useNavigate();
  const { getSocket } = useSocket();
  const pin = sessionStorage.getItem('game_pin') || '';
  const playerId = sessionStorage.getItem('player_id') || '';
  const team = sessionStorage.getItem('player_team') || 'A';
  const nickname = sessionStorage.getItem('player_nickname') || '';
  const avatar = sessionStorage.getItem('player_avatar') || 'pizza';

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('lobby:request-skills', { pin });

    const onSkillsUpdate = (data) => {
      setTeamSkills(data.teamSkills || {});
    };

    const onQuestion = (data) => {
      if (selectedSkill) {
        sessionStorage.setItem('player_skill', selectedSkill);
      }
      navigate(`/play/game/${pin}`, { state: { question: data } });
    };

    socket.on('lobby:skills-update', onSkillsUpdate);
    socket.on('game:question', onQuestion);

    return () => {
      socket.off('lobby:skills-update', onSkillsUpdate);
      socket.off('game:question', onQuestion);
    };
  }, [getSocket, navigate, pin, selectedSkill]);

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
      style={{ backgroundImage: `url('/background_battle/city.jpg')` }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <SkillHeader {...bounceIn()} />



      {/* Cards Container - Occupies the middle section filling full width */}
      <div className="relative z-10 flex flex-col w-full h-[65vh] md:h-[70vh] overflow-y-auto px-6 py-4 custom-scrollbar items-center justify-center">
        <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-4 h-full lg:items-stretch lg:justify-center">
          {skills.map((skill, index) => {
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
