import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSocketStore } from '@/store/useSocketStore';

export function usePlayerCoreGame({ pin, playerId, team, playerSkill }) {
  const router = useRouter();
  const { getSocket } = useSocketStore();

  const [question, setQuestion] = useState(null);
  const [selectedId, setSelectedId]     = useState(null);
  const [phase, setPhase]               = useState('PLAYING'); // PLAYING | ANSWERED | RESULT
  const [resultData, setResultData]     = useState(null);
  const [timeLeft, setTimeLeft]         = useState(20);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionTotal, setQuestionTotal] = useState(1);

  useEffect(() => {
    const stored = sessionStorage.getItem('current_question');
    if (stored) {
      try {
        setQuestion(JSON.parse(stored));
      } catch {
        // Ignore invalid cached question payload
      }
    }
  }, []);

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

    const onFinished = ({ leaderboard }) => {
      const myEntry = leaderboard.find(p => p.id === playerId);
      sessionStorage.setItem('leaderboard_data', JSON.stringify({ leaderboard, myEntry }));
      router.push(`/play/${pin}/result`);
    };

    const onSyncStateResponse = (data) => {
      const clientPhase = data.phase === 'QUESTION' ? 'PLAYING' : data.phase;
      setPhase(clientPhase);
      
      if (data.currentQuestion) {
        setQuestion(data.currentQuestion);
        setTimeLeft(data.timeLeft || 20);
        setQuestionIndex(data.currentQuestion.index);
        setQuestionTotal(data.currentQuestion.total);
      }
      
      if (data.hasAnswered) {
        setSelectedId('synced-answer'); // Block answering again
        if (clientPhase === 'PLAYING') setPhase('ANSWERED');
      }
    };

    socket.on('game:question', onQuestion);
    socket.on('game:timer-tick', onTimerTick);
    socket.on('player:answer-received', onAnswerReceived);
    socket.on('game:player-result', onPlayerResult);
    socket.on('game:finished', onFinished);
    // sync state response is also listened to here for core state
    socket.on('player:sync-state-response', onSyncStateResponse);

    return () => {
      socket.off('game:question', onQuestion);
      socket.off('game:timer-tick', onTimerTick);
      socket.off('player:answer-received', onAnswerReceived);
      socket.off('game:player-result', onPlayerResult);
      socket.off('game:finished', onFinished);
      socket.off('player:sync-state-response', onSyncStateResponse);
    };
  }, [getSocket, router, pin, playerId]);

  const handleAnswer = useCallback((answerId, removedAnswers) => {
    if (phase !== 'PLAYING' || selectedId || removedAnswers.includes(answerId)) return;
    getSocket().emit('player:submit-answer', {
      pin,
      playerId,
      answerId,
    });
  }, [phase, selectedId, pin, playerId, getSocket]);

  return {
    question, setQuestion,
    selectedId, setSelectedId,
    phase, setPhase,
    resultData,
    timeLeft,
    questionIndex,
    questionTotal,
    handleAnswer
  };
}
