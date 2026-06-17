import { useState, useEffect, useCallback } from 'react';
import { useSocketStore } from '@/store/useSocketStore';

export function usePlayerSkills({ pin, playerId, team, playerSkill, nickname, phase, selectedId }) {
  const { getSocket } = useSocketStore();

  const [skillChargesLeft, setSkillChargesLeft] = useState(0);
  const [isSkillLockedOut, setIsSkillLockedOut] = useState(false);
  const [skillLockoutMsg, setSkillLockoutMsg] = useState("");
  const [removedAnswers, setRemovedAnswers] = useState([]);
  const [foxSmokescreen, setFoxSmokescreen] = useState(false);
  const [rabbitRush, setRabbitRush] = useState(false);
  const [butterflyActive, setButterflyActive] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onQuestion = (data) => {
      if (data.skillCharges && data.skillCharges[team] && playerSkill) {
        setSkillChargesLeft(data.skillCharges[team][playerSkill]);
      }
      setIsSkillLockedOut(false);
      setSkillLockoutMsg("");
      setRemovedAnswers([]);
      setFoxSmokescreen(false);
      setRabbitRush(false);
      setButterflyActive(false);
    };

    const onSkillLockout = ({ team: lockoutTeam, playerId: lockoutPlayerId, nickname: lockoutName }) => {
      if (lockoutTeam === team) {
        setIsSkillLockedOut(true);
        if (lockoutPlayerId !== playerId) {
          setSkillLockoutMsg(`Active by ${lockoutName}`);
        } else {
          setSkillLockoutMsg(`You activated ${playerSkill}`);
        }
      }
    };

    const onFoxAttack = ({ targetTeam }) => {
      if (targetTeam === team) {
        setFoxSmokescreen(true);
        setTimeout(() => setFoxSmokescreen(false), 5000);
      }
    };

    const onButterflyResult = ({ team: bTeam, removedAnswers: rAnswers }) => {
      if (bTeam === team) {
        setRemovedAnswers(rAnswers);
        setButterflyActive(true);
        setTimeout(() => setButterflyActive(false), 3000);
      }
    };

    const onRabbitRush = ({ team: rTeam }) => {
      if (rTeam === team) {
        setRabbitRush(true);
        setTimeout(() => setRabbitRush(false), 5000);
      }
    };

    const onSyncStateResponse = (data) => {
      if (data.currentQuestion && data.currentQuestion.skillCharges && data.currentQuestion.skillCharges[team] && playerSkill) {
        setSkillChargesLeft(data.currentQuestion.skillCharges[team][playerSkill]);
      }
    };

    socket.on('game:question', onQuestion);
    socket.on('game:skill-lockout', onSkillLockout);
    socket.on('game:fox-attack', onFoxAttack);
    socket.on('game:butterfly-result', onButterflyResult);
    socket.on('game:rabbit-rush', onRabbitRush);
    socket.on('player:sync-state-response', onSyncStateResponse);

    return () => {
      socket.off('game:question', onQuestion);
      socket.off('game:skill-lockout', onSkillLockout);
      socket.off('game:fox-attack', onFoxAttack);
      socket.off('game:butterfly-result', onButterflyResult);
      socket.off('game:rabbit-rush', onRabbitRush);
      socket.off('player:sync-state-response', onSyncStateResponse);
    };
  }, [getSocket, team, playerSkill, playerId]);

  const handleUseSkill = useCallback(() => {
    if (phase !== 'PLAYING' || selectedId || isSkillLockedOut || skillChargesLeft <= 0 || foxSmokescreen) return;
    getSocket().emit('player:use-skill', {
      pin,
      playerId,
      team,
      skillId: playerSkill,
      nickname
    });
  }, [phase, selectedId, isSkillLockedOut, skillChargesLeft, foxSmokescreen, pin, team, playerSkill, nickname, getSocket, playerId]);

  return {
    skillChargesLeft,
    isSkillLockedOut,
    skillLockoutMsg,
    removedAnswers,
    foxSmokescreen,
    rabbitRush,
    butterflyActive,
    handleUseSkill
  };
}
