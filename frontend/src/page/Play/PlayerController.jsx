import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

// 4 Kahoot-style answer buttons
const ANSWER_BUTTONS = [
  { shape: '▲', bg: 'bg-[#E74C3C]', activeBg: 'bg-[#C0392B]', border: 'border-[#C0392B]', shadow: '#C0392B' },
  { shape: '◆', bg: 'bg-[#3B68FF]', activeBg: 'bg-[#2850CC]', border: 'border-[#2850CC]', shadow: '#2850CC' },
  { shape: '●', bg: 'bg-[#F39C12]', activeBg: 'bg-[#D68910]', border: 'border-[#D68910]', shadow: '#D68910' },
  { shape: '■', bg: 'bg-[#27AE60]', activeBg: 'bg-[#1E8449]', border: 'border-[#1E8449]', shadow: '#1E8449' },
];

export default function PlayerController() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getSocket } = useSocket();

  const playerId  = useRef(sessionStorage.getItem('player_id') || 'unknown');
  const nickname  = sessionStorage.getItem('player_nickname') || 'Player';
  const playerSkill = sessionStorage.getItem('player_skill') || null;
  const team        = sessionStorage.getItem('player_team') || 'A';

  const [question, setQuestion]         = useState(location.state?.question || null);
  const [selectedId, setSelectedId]     = useState(null);
  const [phase, setPhase]               = useState('PLAYING'); // PLAYING | ANSWERED | RESULT
  const [resultData, setResultData]     = useState(null);
  const [timeLeft, setTimeLeft]         = useState(20);
  const [questionIndex, setQuestionIndex] = useState(question?.index ?? 0);
  const [questionTotal, setQuestionTotal] = useState(question?.total ?? 1);

  // Skill states
  const [skillChargesLeft, setSkillChargesLeft] = useState(0);
  const [isSkillLockedOut, setIsSkillLockedOut] = useState(false);
  const [skillLockoutMsg, setSkillLockoutMsg] = useState("");
  const [removedAnswers, setRemovedAnswers] = useState([]);
  const [foxSmokescreen, setFoxSmokescreen] = useState(false);
  const [rabbitRush, setRabbitRush] = useState(false);

  useEffect(() => {
    const socket = getSocket();

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
        setTimeout(() => setFoxSmokescreen(false), 3000);
      }
    };

    const onButterflyResult = ({ team: bTeam, removedAnswers: rAnswers }) => {
      if (bTeam === team) {
        setRemovedAnswers(rAnswers);
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
      navigate(`/play/result/${pin}`, { state: { leaderboard, myEntry } });
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
  }, [pin, getSocket, navigate, team, playerSkill]);

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
    return (
      <div className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="text-center"
        >
          <div className="text-8xl mb-6">
            {resultData.isCorrect ? '✅' : '❌'}
          </div>
          <h2 className={`text-4xl font-black mb-2 ${resultData.isCorrect ? 'text-[#27AE60]' : 'text-[#E74C3C]'}`}>
            {resultData.isCorrect ? 'Correct!' : 'Incorrect'}
          </h2>
          
          {resultData.isCorrect && (
            <div className="flex flex-col items-center">
              {resultData.rabbitBonusApplied && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="bg-[#F39C12] text-black text-xs font-black px-2 py-1 rounded mb-1 uppercase tracking-widest"
                >
                  Rabbit Bonus 2x!
                </motion.span>
              )}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[#FFCD29] font-black text-4xl mb-1"
              >
                +{resultData.pointsEarned?.toLocaleString()}
              </motion.p>
            </div>
          )}

          {/* Frog Stolen Points UI */}
          {resultData.stolenPoints !== 0 && resultData.stolenPoints !== undefined && (
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
              className={`mt-4 px-4 py-2 rounded-xl border-2 font-black tracking-wider ${
                resultData.stolenPoints > 0 
                  ? 'bg-[#27AE60]/20 border-[#27AE60] text-[#27AE60]'
                  : 'bg-[#E74C3C]/20 border-[#E74C3C] text-[#E74C3C]'
              }`}
            >
              {resultData.stolenPoints > 0 ? (
                <>🐸 Stole +{resultData.stolenPoints.toLocaleString()} pts!</>
              ) : (
                <>👅 Enemy Frog stole {resultData.stolenPoints.toLocaleString()} pts!</>
              )}
            </motion.div>
          )}

          <p className="text-white/50 text-lg font-bold mt-4">
            Total: <span className="text-white">{resultData.totalScore?.toLocaleString()}</span>
          </p>

          <div className="mt-8 flex items-center gap-2 text-white/30 justify-center">
            <div className="w-2 h-2 rounded-full bg-[#FFCD29] animate-pulse" />
            <p className="text-sm uppercase tracking-widest font-bold">Next question coming up...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0D0D1A] flex flex-col overflow-hidden relative transition-colors duration-300 ${rabbitRush ? 'ring-[16px] ring-[#F39C12] ring-inset' : ''}`}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Player</p>
          <p className="text-white font-black text-base">{nickname}</p>
        </div>

        {/* Progress */}
        <div className="text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Question</p>
          <p className="text-white font-black text-base">
            {questionIndex + 1} <span className="text-white/30">/ {questionTotal}</span>
          </p>
        </div>

        {/* Timer pill */}
        <div className={`rounded-full px-4 py-2 font-black text-xl border-2 ${
          timeLeft <= 5 ? 'bg-[#E74C3C] border-[#C0392B] text-white' :
          timeLeft <= 10 ? 'bg-[#F39C12] border-[#D68910] text-white' :
          'bg-white/10 border-white/20 text-white'
        }`}>
          {timeLeft}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="px-5 mb-4">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-[#FFCD29] rounded-full"
            animate={{ width: `${(timeLeft / 20) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* ── Center prompt ── */}
      <div className="flex-1 flex items-center justify-center px-5">
        <AnimatePresence mode="wait">
          {phase === 'PLAYING' && !selectedId && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {playerSkill ? (
                <button 
                  onClick={handleUseSkill}
                  disabled={isSkillLockedOut || skillChargesLeft <= 0 || foxSmokescreen}
                  className={`px-8 py-3 rounded-full font-black uppercase border-b-4 text-xl tracking-widest transition-transform ${
                    isSkillLockedOut || skillChargesLeft <= 0 || foxSmokescreen
                      ? 'bg-gray-700 border-gray-900 text-white/50 cursor-not-allowed'
                      : 'bg-[#9B59B6] border-[#8E44AD] text-white active:translate-y-1 active:border-b-0 hover:scale-105'
                  }`}
                  style={(!isSkillLockedOut && skillChargesLeft > 0 && !foxSmokescreen) ? { boxShadow: '0 0 20px #9B59B6' } : {}}
                >
                  {isSkillLockedOut ? skillLockoutMsg : `USE ${playerSkill.toUpperCase()} (${skillChargesLeft})`}
                </button>
              ) : (
                <p className="text-white/30 text-sm font-bold uppercase tracking-[0.2em]">
                  Tap your answer below 👇
                </p>
              )}
            </motion.div>
          )}
          {phase === 'ANSWERED' && (
            <motion.div
              key="answered"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-5xl mb-3">⏳</div>
              <p className="text-white font-black text-xl">Answer locked in!</p>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">Waiting for results...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Answer buttons (2x2 grid) ── */}
      <div className="grid grid-cols-2 gap-3 p-4 pb-8 relative">
        {/* Fox Smokescreen Overlay */}
        <AnimatePresence>
          {foxSmokescreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 backdrop-blur-3xl bg-black/80 rounded-t-3xl flex items-center justify-center pointer-events-auto"
            >
              <div className="text-center">
                <span className="text-6xl mb-4 block">🦊💨</span>
                <p className="text-white font-black text-2xl uppercase tracking-widest">Smokescreen!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {question?.answers?.map((answer, i) => {
          const btn = ANSWER_BUTTONS[i] || ANSWER_BUTTONS[0];
          const isSelected = selectedId === answer.id;
          const isRemoved = removedAnswers.includes(answer.id);
          const isDisabled = phase !== 'PLAYING' || isRemoved || foxSmokescreen;

          return (
            <motion.button
              key={answer.id}
              id={`answer-btn-${answer.id}`}
              whileTap={!isDisabled ? { scale: 0.94 } : {}}
              onClick={() => handleAnswer(answer.id)}
              disabled={isDisabled}
              className={`
                relative rounded-3xl px-4 py-6 flex flex-col items-center justify-center gap-3
                border-b-4 transition-all duration-150 min-h-[140px]
                ${isSelected
                  ? `${btn.activeBg} ${btn.border} shadow-none translate-y-1 opacity-100`
                  : isDisabled
                    ? `${btn.bg} ${btn.border} opacity-20 cursor-not-allowed filter grayscale`
                    : `${btn.bg} ${btn.border} shadow-[0_6px_0_0_${btn.shadow}] active:translate-y-[3px] active:shadow-[0_3px_0_0_${btn.shadow}]`
                }
              `}
            >
              <span className="text-white text-3xl font-black opacity-80">{btn.shape}</span>
              <span className="text-white font-black text-sm text-center leading-tight">{answer.text}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}

        {/* Skeleton if no question yet */}
        {!question?.answers && [0, 1, 2, 3].map(i => (
          <div key={i} className={`rounded-3xl min-h-[140px] ${ANSWER_BUTTONS[i].bg} opacity-20 animate-pulse`} />
        ))}
      </div>
    </div>
  );
}
