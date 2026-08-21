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
  const [teamCounterBlindCharges, setTeamCounterBlindCharges] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onQuestion = (data) => {
      if (data.skillCharges && data.skillCharges[team] && playerSkill) {
        setSkillChargesLeft(data.skillCharges[team][playerSkill]);
      }
      if (data.teamCounterBlindCharges && data.teamCounterBlindCharges[team] !== undefined) {
        setTeamCounterBlindCharges(data.teamCounterBlindCharges[team]);
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

    const onFoxAttack = ({ targetTeam, duration }) => {
      if (targetTeam === team) {
        setFoxSmokescreen(true);
        setTimeout(() => setFoxSmokescreen(false), duration || 5000);
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

    const onCounterBlindSuccess = ({ team: cbTeam }) => {
      if (cbTeam === team) {
        setFoxSmokescreen(false);
        setTeamCounterBlindCharges(prev => Math.max(0, prev - 1));
      }
    };

    const onSyncStateResponse = (data) => {
      if (data.currentQuestion && data.currentQuestion.skillCharges && data.currentQuestion.skillCharges[team] && playerSkill) {
        setSkillChargesLeft(data.currentQuestion.skillCharges[team][playerSkill]);
      }
      if (data.currentQuestion && data.currentQuestion.teamCounterBlindCharges && data.currentQuestion.teamCounterBlindCharges[team] !== undefined) {
        setTeamCounterBlindCharges(data.currentQuestion.teamCounterBlindCharges[team]);
      }
    };

    socket.on('game:question', onQuestion);
    socket.on('game:skill-lockout', onSkillLockout);
    socket.on('game:fox-attack', onFoxAttack);
    socket.on('game:butterfly-result', onButterflyResult);
    socket.on('game:rabbit-rush', onRabbitRush);
    socket.on('game:counter-blind-success', onCounterBlindSuccess);
    socket.on('player:sync-state-response', onSyncStateResponse);

    return () => {
      socket.off('game:question', onQuestion);
      socket.off('game:skill-lockout', onSkillLockout);
      socket.off('game:fox-attack', onFoxAttack);
      socket.off('game:butterfly-result', onButterflyResult);
      socket.off('game:rabbit-rush', onRabbitRush);
      socket.off('game:counter-blind-success', onCounterBlindSuccess);
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

  const handleCounterBlind = useCallback(() => {
    if (teamCounterBlindCharges <= 0) return;
    getSocket().emit('player:use-counter-blind', {
      pin,
      playerId,
      team
    });
  }, [teamCounterBlindCharges, pin, playerId, team, getSocket]);

  return {
    skillChargesLeft,
    isSkillLockedOut,
    skillLockoutMsg,
    removedAnswers,
    foxSmokescreen,
    rabbitRush,
    butterflyActive,
    teamCounterBlindCharges,
    handleUseSkill,
    handleCounterBlind
  };
}
