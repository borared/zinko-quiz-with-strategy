"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { AnimatePresence } from "framer-motion";

import SkillPickPhase from "./SkillPickPhase";
import QuestionPhase from "./QuestionPhase";
import ResultPhase from "./ResultPhase";
import LeaderboardPhase from "./LeaderboardPhase";
import VaultBreakerHost from "./VaultBreakerHost";
import RewardWheel from "./RewardWheel";

export default function HostGameUI() {
  const { pin } = useParams();
  const router = useRouter();
  const { getSocket, isConnected } = useSocket();

  const TOTAL_TIME = 20;

  const [phase, setPhase] = useState("SKILL_PICK");
  const [question, setQuestion] = useState(null);
  const [skillTimeLeft, setSkillTimeLeft] = useState(20);

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState([]);
  const [correctId, setCorrectId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isFinalLeaderboard, setIsFinalLeaderboard] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Minigame states
  const [minigameData, setMinigameData] = useState({
    tapsA: 0, tapsB: 0, targetA: 100, targetB: 100, winner: null, spinnerName: "",
    playerTaps: {}, players: []
  });
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);

  // Re-register as host if socket reconnects
  useEffect(() => {
    if (isConnected) {
      const socket = getSocket();
      socket?.emit("host:reconnect", { pin });
    }
  }, [isConnected, pin, getSocket]);

  // Skill pick countdown
  useEffect(() => {
    if (phase === "SKILL_PICK") {
      const interval = setInterval(() => {
        setSkillTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "SKILL_PICK") {
      const socket = getSocket();
      if (!socket) return;
      socket.emit("host:skill-timer-sync", { pin, timeLeft: skillTimeLeft });

      if (skillTimeLeft <= 0) {
        socket.emit("game:start", { pin });
      }
    }
  }, [skillTimeLeft, phase, pin, getSocket]);

  // Error listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onError = (err) => alert(`Server Error: ${err.message}`);
    socket.on("error", onError);
    return () => socket.off("error", onError);
  }, [getSocket]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onQuestion = (data) => {
      setQuestion(data);
      setPhase("QUESTION");
      setTimeLeft(data.timeSeconds || TOTAL_TIME);
      setAnswered(0);
      setTotal(0);
      setStats([]);
      setCorrectId(null);
    };

    const onTimerTick = ({ timeLeft: t }) => setTimeLeft(t);

    const onAnswerProgress = ({ answered: a, total: t }) => {
      setAnswered(a);
      setTotal(t);
    };

    const onRevealResults = ({ correctAnswerId, stats: s, leaderboard: lb }) => {
      setCorrectId(correctAnswerId);
      setStats(s);
      setLeaderboard(lb);
      setPhase("RESULT");
    };

    const onLeaderboard = ({ leaderboard: lb, isIntermediate }) => {
      setLeaderboard(lb);
      setIsFinalLeaderboard(!isIntermediate);
      setPhase("LEADERBOARD");
    };

    const onFinished = ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      setIsFinalLeaderboard(true);
      setPhase("LEADERBOARD");
    };

    const onMinigameStarted = ({ vaultsToWin, teamVaults, playerButtons, players }) => {
      setMinigameData({ 
        vaultsToWin, 
        teamVaults, 
        playerButtons, 
        heldColors: { A: [], B: [] },
        winner: null, 
        spinnerName: "", 
        players: players || [] 
      });
      setIsWheelSpinning(false);
      setPhase("MINIGAME_RACING");
    };

    const onMinigameProgress = ({ teamVaults, heldColors }) => {
      setMinigameData(prev => ({ ...prev, teamVaults: teamVaults || prev.teamVaults, heldColors: heldColors || prev.heldColors }));
    };

    const onMinigameVaultCracked = ({ team, teamVaults }) => {
      setMinigameData(prev => ({ ...prev, teamVaults: teamVaults || prev.teamVaults }));
      // Optional: Play sound effect here
    };

    const onMinigameFinished = ({ spinnerId, spinnerName, preSelectedRewardId }) => {
      setMinigameData(prev => ({ ...prev, spinnerName, spinnerId, preSelectedRewardId }));
      setPhase("MINIGAME_REWARD");
    };

    const onWheelSpinning = () => {
      setIsWheelSpinning(true);
    };

    const onRewardClaimed = () => {
      // Resume the game by going to the next question
      getSocket().emit("game:next-question", { pin });
    };

    socket.on("game:question", onQuestion);
    socket.on("game:timer-tick", onTimerTick);
    socket.on("host:answer-progress", onAnswerProgress);
    socket.on("game:reveal-results", onRevealResults);
    socket.on("game:leaderboard", onLeaderboard);
    socket.on("game:finished", onFinished);
    
    socket.on("game:minigame-started", onMinigameStarted);
    socket.on("game:minigame-progress", onMinigameProgress);
    socket.on("game:minigame-vault-cracked", onMinigameVaultCracked);
    socket.on("game:minigame-finished", onMinigameFinished);
    socket.on("game:wheel-spinning", onWheelSpinning);

    return () => {
      socket.off("game:question", onQuestion);
      socket.off("game:timer-tick", onTimerTick);
      socket.off("host:answer-progress", onAnswerProgress);
      socket.off("game:reveal-results", onRevealResults);
      socket.off("game:leaderboard", onLeaderboard);
      socket.off("game:finished", onFinished);
      socket.off("game:minigame-started", onMinigameStarted);
      socket.off("game:minigame-progress", onMinigameProgress);
      socket.off("game:minigame-vault-cracked", onMinigameVaultCracked);
      socket.off("game:minigame-finished", onMinigameFinished);
      socket.off("game:wheel-spinning", onWheelSpinning);
    };
  }, [getSocket, TOTAL_TIME, pin]);

  const handleShowLeaderboard = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    getSocket().emit("host:show-leaderboard", { pin });
  }, [pin, getSocket, isTransitioning]);

  const handleNextQuestion = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // If it's the end of Round 1 (assuming 5 questions per round, next index is 5)
    // question object has 'index'. If question.index == 4, the next is 5.
    if (question?.index === 4) {
      getSocket().emit("host:start-minigame", { pin });
    } else {
      getSocket().emit("game:next-question", { pin });
    }
  }, [pin, getSocket, isTransitioning, question]);

  const handleEndGame = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    getSocket().emit("host:end-game", { pin });
    router.push("/dashboard");
  }, [router, pin, getSocket, isTransitioning]);

  // Reset transitioning state when phase actually changes
  useEffect(() => {
    setIsTransitioning(false);
  }, [phase]);

  // Auto-advance removed so host has full control
  useEffect(() => {
    // No auto-advance
  }, [phase, isFinalLeaderboard, handleShowLeaderboard, handleNextQuestion]);

  // Loading state
  if (!question && phase !== "SKILL_PICK") {
    return (
      <div className="min-h-screen bg-zk-yellow flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-[5px] border-zk-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest text-zk-black/50">
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative font-sans">
      <AnimatePresence mode="wait">
        {phase === "SKILL_PICK" && (
          <SkillPickPhase skillTimeLeft={skillTimeLeft} />
        )}
        
        {phase === "QUESTION" && (
          <QuestionPhase 
            question={question} 
            timeLeft={timeLeft} 
            totalTime={TOTAL_TIME} 
            answered={answered} 
            total={total} 
          />
        )}
        
        {phase === "RESULT" && (
          <ResultPhase 
            question={question}
            stats={stats} 
            leaderboard={leaderboard} 
            handleShowLeaderboard={handleShowLeaderboard} 
            handleNextQuestion={handleNextQuestion} 
          />
        )}
        
        {phase === "LEADERBOARD" && (
          <LeaderboardPhase 
            leaderboard={leaderboard} 
            isFinalLeaderboard={isFinalLeaderboard} 
            handleNextQuestion={handleNextQuestion} 
            handleEndGame={handleEndGame} 
          />
        )}

        {phase === "MINIGAME_RACING" && minigameData.teamVaults && (
          <VaultBreakerHost 
            teamVaults={minigameData.teamVaults}
            heldColors={minigameData.heldColors}
            vaultsToWin={minigameData.vaultsToWin}
            winner={minigameData.winner}
          />
        )}

        {phase === "MINIGAME_REWARD" && (
          <RewardWheel 
            pin={pin}
            winnerTeam={minigameData.winner}
            spinnerName={minigameData.spinnerName}
            isSpinner={false} // Host is never the spinner
            preSelectedRewardId={minigameData.preSelectedRewardId}
            externalSpinTrigger={isWheelSpinning}
            onRewardClaimed={() => {
              getSocket().emit("game:next-question", { pin });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
