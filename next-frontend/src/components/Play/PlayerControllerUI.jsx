"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import PlayHeader from './PlayHeader';
import QuestionPrompt from './QuestionPrompt';
import AnswerGrid from './AnswerGrid';
import ResultOverlay from './ResultOverlay';
import RabbitRush from './Skills/RabbitRush';
import ButterflyEffect from './Skills/ButterflyEffect';

export default function PlayerControllerUI() {
  const { pin } = useParams();
  const router = useRouter();
  const { getSocket } = useSocket();

  const playerId  = useRef(sessionStorage.getItem('player_id') || 'unknown');
  const nickname  = sessionStorage.getItem('player_nickname') || 'Player';
  const playerSkill = sessionStorage.getItem('player_skill') || null;
  const team        = sessionStorage.getItem('player_team') || 'A';

  const [question, setQuestion]         = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('current_question');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [selectedId, setSelectedId]     = useState(null);
  const [phase, setPhase]               = useState('PLAYING'); // PLAYING | ANSWERED | RESULT
  const [resultData, setResultData]     = useState(null);
  const [timeLeft, setTimeLeft]         = useState(20);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionTotal, setQuestionTotal] = useState(1);

  // Skill states
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
      setQuestion(data);
      setSelectedId(null);
      setPhase('PLAYING');
      setResultData(null);
      setTimeLeft(data.timeSeconds || 20);
      setQuestionIndex(data.index);
      setQuestionTotal(data.total);
      
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

    const onTimerTick = ({ timeLeft: t }) => setTimeLeft(t);

    const onAnswerReceived = ({ answerId }) => {
      setSelectedId(answerId);
      setPhase('ANSWERED');
    };

    const onPlayerResult = (data) => {
      setResultData(data);
      setPhase('RESULT');
    };

    const onLeaderboard = () => {
      // Brief pause on result, then show leaderboard
    };

    const onNextQuestion = (data) => {
      onQuestion(data);
    };

    const onSkillLockout = ({ team: lockoutTeam, playerId: lockoutPlayerId, nickname: lockoutName }) => {
      if (lockoutTeam === team) {
        setIsSkillLockedOut(true);
        if (lockoutPlayerId !== playerId.current) {
          setSkillLockoutMsg(`Active by ${lockoutName}`);
        } else {
          setSkillLockoutMsg(`You activated ${playerSkill}`);
        }
      }
    };

    const onFoxAttack = ({ targetTeam }) => {
      if (targetTeam === team) {
        setFoxSmokescreen(true);
        setTimeout(() => setFoxSmokescreen(false), 10000);
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

    const onFinished = ({ leaderboard }) => {
      const myEntry = leaderboard.find(p => p.id === playerId.current);
      sessionStorage.setItem('leaderboard_data', JSON.stringify({ leaderboard, myEntry }));
      router.push(`/play/result/${pin}`);
    };

    socket.on('game:question', onQuestion);
    socket.on('game:timer-tick', onTimerTick);
    socket.on('player:answer-received', onAnswerReceived);
    socket.on('game:player-result', onPlayerResult);
    socket.on('game:leaderboard', onLeaderboard);
    socket.on('game:finished', onFinished);
    
    socket.on('game:skill-lockout', onSkillLockout);
    socket.on('game:fox-attack', onFoxAttack);
    socket.on('game:butterfly-result', onButterflyResult);
    socket.on('game:rabbit-rush', onRabbitRush);

    // Initial fetch to get the current question state just in case we joined slightly late
    socket.emit('player:get-current-question', { pin });

    return () => {
      socket.off('game:question', onQuestion);
      socket.off('game:timer-tick', onTimerTick);
      socket.off('player:answer-received', onAnswerReceived);
      socket.off('game:player-result', onPlayerResult);
      socket.off('game:leaderboard', onLeaderboard);
      socket.off('game:finished', onFinished);
      
      socket.off('game:skill-lockout', onSkillLockout);
      socket.off('game:fox-attack', onFoxAttack);
      socket.off('game:butterfly-result', onButterflyResult);
      socket.off('game:rabbit-rush', onRabbitRush);
    };
  }, [pin, getSocket, router, team, playerSkill]);

  const handleAnswer = useCallback((answerId) => {
    if (phase !== 'PLAYING' || selectedId || removedAnswers.includes(answerId)) return;
    getSocket().emit('player:submit-answer', {
      pin,
      playerId: playerId.current,
      answerId,
    });
  }, [phase, selectedId, removedAnswers, pin, getSocket]);

  const handleUseSkill = useCallback(() => {
    if (phase !== 'PLAYING' || selectedId || isSkillLockedOut || skillChargesLeft <= 0 || foxSmokescreen) return;
    getSocket().emit('player:use-skill', {
      pin,
      playerId: playerId.current,
      team,
      skillId: playerSkill,
      nickname
    });
  }, [phase, selectedId, isSkillLockedOut, skillChargesLeft, foxSmokescreen, pin, team, playerSkill, nickname, getSocket]);

  // ── RESULT overlay ──
  if (phase === 'RESULT' && resultData) {
    return <ResultOverlay resultData={resultData} />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col overflow-hidden relative transition-colors duration-300"
      style={{
        backgroundImage: `url('/background_battle/city.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#C4962C",
      }}
    >
      <RabbitRush isActive={rabbitRush} />
      <ButterflyEffect isActive={butterflyActive} />

      {/* Warm overlay matching host screen */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none z-0" />
      
      {/* ── Content wrapper to sit above overlay ── */}
      <div className="relative z-10 flex flex-col flex-1 h-full">
        <PlayHeader 
          nickname={nickname}
          question={question}
          timeLeft={timeLeft}
        />

        <QuestionPrompt 
          phase={phase}
          question={question}
          selectedId={selectedId}
          playerSkill={playerSkill}
          isSkillLockedOut={isSkillLockedOut}
          skillLockoutMsg={skillLockoutMsg}
          skillChargesLeft={skillChargesLeft}
          foxSmokescreen={foxSmokescreen}
          handleUseSkill={handleUseSkill}
        />

        <AnswerGrid 
          question={question}
          phase={phase}
          selectedId={selectedId}
          removedAnswers={removedAnswers}
          foxSmokescreen={foxSmokescreen}
          handleAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}
