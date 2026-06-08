"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
;
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
  const router = useRouter();
  const location = usePathname();
  const { getSocket } = useSocket();

  const playerId  = useRef(sessionStorage.getItem('player_id') || 'unknown');
  const nickname  = sessionStorage.getItem('player_nickname') || 'Player';

  const [question, setQuestion]         = useState(location.state?.question || null);
  const [selectedId, setSelectedId]     = useState(null);
  const [phase, setPhase]               = useState('PLAYING'); // PLAYING | ANSWERED | RESULT
  const [resultData, setResultData]     = useState(null);
  const [timeLeft, setTimeLeft]         = useState(20);
  const [questionIndex, setQuestionIndex] = useState(question?.index ?? 0);
  const [questionTotal, setQuestionTotal] = useState(question?.total ?? 1);

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
    };

    const onFinished = ({ leaderboard }) => {
      const myEntry = leaderboard.find(p => p.id === playerId.current);
      router.push(`/play/result/${pin}`, { state: { leaderboard, myEntry } });
    };

    socket.on('game:question', onQuestion);
    socket.on('game:timer-tick', onTimerTick);
    socket.on('player:answer-received', onAnswerReceived);
    socket.on('game:player-result', onPlayerResult);
    socket.on('game:leaderboard', onLeaderboard);
    socket.on('game:finished', onFinished);

    return () => {
      socket.off('game:question', onQuestion);
      socket.off('game:timer-tick', onTimerTick);
      socket.off('player:answer-received', onAnswerReceived);
      socket.off('game:player-result', onPlayerResult);
      socket.off('game:leaderboard', onLeaderboard);
      socket.off('game:finished', onFinished);
    };
  }, [pin, getSocket, router]);

  const handleAnswer = useCallback((answerId) => {
    if (phase !== 'PLAYING' || selectedId) return;
    getSocket().emit('player:submit-answer', {
      pin,
      playerId: playerId.current,
      answerId,
    });
  }, [phase, selectedId, pin, getSocket]);

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
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[#FFCD29] font-black text-3xl mb-1"
            >
              +{resultData.pointsEarned.toLocaleString()}
            </motion.p>
          )}
          <p className="text-white/50 text-lg font-bold">
            Total: <span className="text-white">{resultData.totalScore.toLocaleString()}</span>
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
    <div className="min-h-screen bg-[#0D0D1A] flex flex-col overflow-hidden">
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
              <p className="text-white/30 text-sm font-bold uppercase tracking-[0.2em]">
                Tap your answer below 👇
              </p>
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
      <div className="grid grid-cols-2 gap-3 p-4 pb-8">
        {question?.answers?.map((answer, i) => {
          const btn = ANSWER_BUTTONS[i] || ANSWER_BUTTONS[0];
          const isSelected = selectedId === answer.id;
          const isDisabled = phase !== 'PLAYING';

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
                    ? `${btn.bg} ${btn.border} opacity-40 cursor-not-allowed`
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

