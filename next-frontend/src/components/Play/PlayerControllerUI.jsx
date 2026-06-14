"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSocketStore } from '@/store/useSocketStore';
import PlayHeader from './PlayHeader';
import QuestionPrompt from './QuestionPrompt';
import AnswerGrid from './AnswerGrid';
import ResultOverlay from './ResultOverlay';
import RabbitRush from './Skills/RabbitRush';
import ButterflyEffect from './Skills/ButterflyEffect';
import VaultBreakerPlayer from './VaultBreakerPlayer';
import RewardWheel from '../HostGame/RewardWheel';

export default function PlayerControllerUI() {
  const { pin } = useParams();
  const router = useRouter();
  const { getSocket } = useSocketStore();

  const playerId  = useRef(typeof window !== 'undefined' ? sessionStorage.getItem('player_id') || 'unknown' : 'unknown');
  const nickname  = typeof window !== 'undefined' ? sessionStorage.getItem('player_nickname') || 'Player' : 'Player';
  const playerSkill = typeof window !== 'undefined' ? sessionStorage.getItem('player_skill') || null : null;
  const team        = typeof window !== 'undefined' ? sessionStorage.getItem('player_team') || 'A' : 'A';

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

  const [minigameSpinner, setMinigameSpinner] = useState({ id: null, name: "", preSelectedRewardId: null });
  const [minigameData, setMinigameData] = useState({
    vaultsToWin: 3, teamVaults: {}, playerButtons: {}, heldColors: { A: [], B: [] }, winner: null, players: []
  });
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);

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

    const onMinigameStarted = ({ vaultsToWin, teamVaults, playerButtons, players }) => {
      setPhase('MINIGAME_RACING');
      setQuestion(null);
      setMinigameData({ vaultsToWin, teamVaults, playerButtons, heldColors: { A: [], B: [] }, winner: null, players: players || [] });
    };

    const onMinigameProgress = ({ teamVaults, heldColors }) => {
      setMinigameData(prev => ({ 
        ...prev, 
        teamVaults: teamVaults || prev.teamVaults, 
        heldColors: heldColors || prev.heldColors 
      }));
    };

    const onMinigameVaultCracked = ({ team, teamVaults }) => {
      setMinigameData(prev => ({ ...prev, teamVaults: teamVaults || prev.teamVaults }));
    };

    const onMinigameFinished = ({ spinnerId, spinnerName, preSelectedRewardId }) => {
      setMinigameSpinner({ id: spinnerId, name: spinnerName, preSelectedRewardId });
      setPhase('MINIGAME_REWARD');
    };

    const onWheelSpinning = () => {
      setIsWheelSpinning(true);
    };

    const onSyncState = (data) => {
      const clientPhase = data.phase === 'QUESTION' ? 'PLAYING' : data.phase;
      setPhase(clientPhase);
      
      if (data.currentQuestion) {
        setQuestion(data.currentQuestion);
        setTimeLeft(data.timeLeft || 20);
        setQuestionIndex(data.currentQuestion.index);
        setQuestionTotal(data.currentQuestion.total);
        
        if (data.currentQuestion.skillCharges && data.currentQuestion.skillCharges[team] && playerSkill) {
          setSkillChargesLeft(data.currentQuestion.skillCharges[team][playerSkill]);
        }
      }
      
      if (data.hasAnswered) {
        setSelectedId('synced-answer'); // Block answering again
        if (clientPhase === 'PLAYING') setPhase('ANSWERED');
      }
      
      if (data.minigameData) {
        setMinigameData(prev => ({ ...prev, ...data.minigameData }));
      }
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

    socket.on('game:minigame-started', onMinigameStarted);
    socket.on('game:minigame-progress', onMinigameProgress);
    socket.on('game:minigame-finished', onMinigameFinished);
    socket.on('game:wheel-spinning', onWheelSpinning);
    socket.on('player:sync-state-response', onSyncState);

    // Initial fetch to get the current game state in case of late join or browser refresh
    socket.emit('player:sync-state', { pin, playerId: playerId.current });

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
      
      socket.off('game:minigame-started', onMinigameStarted);
      socket.off('game:minigame-vault-cracked', onMinigameVaultCracked);
      socket.off('game:minigame-finished', onMinigameFinished);
      socket.off('game:wheel-spinning', onWheelSpinning);
      socket.off('player:sync-state-response', onSyncState);
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

  // ── MINIGAME ──
  if (phase === 'MINIGAME_RACING') {
    const assignedColors = minigameData.playerButtons[playerId.current] || [];
    return (
      <VaultBreakerPlayer 
        assignedColors={assignedColors}
        onHold={(color) => {
          const socket = getSocket();
          if (socket) socket.emit('player:hold-button', { pin, playerId: playerId.current, color });
        }}
        onRelease={(color) => {
          const socket = getSocket();
          if (socket) socket.emit('player:release-button', { pin, playerId: playerId.current, color });
        }}
      />
    );
  }

  if (phase === 'MINIGAME_REWARD') {
    const isMe = minigameSpinner.id === playerId.current;
    
    return (
      <RewardWheel 
        pin={pin}
        winnerTeam={minigameData.winner}
        spinnerName={minigameSpinner.name}
        isSpinner={isMe}
        preSelectedRewardId={minigameSpinner.preSelectedRewardId}
        externalSpinTrigger={isWheelSpinning}
        onRewardClaimed={() => {}} // Host handles server transition
        playerId={playerId.current}
        isHost={false}
      />
    );
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
