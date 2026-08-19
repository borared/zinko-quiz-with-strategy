"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocketStore } from '@/store/useSocketStore';
import { AnimatePresence } from "framer-motion";

import SkillPickPhase from "./SkillPickPhase";
import QuestionPhase from "./QuestionPhase";
import DragLayersPhase from "./DragLayersPhase";
import LineMatchingPhase from "./LineMatchingPhase";
import { isDragLayersQuestion, isLineMatchingQuestion } from '@/lib/questionTypes';
import ResultPhase from "./ResultPhase";
import LeaderboardPhase from "./LeaderboardPhase";
import VaultBreakerHost from "./VaultBreakerHost";
import HigherLowerHost from "./HigherLowerHost";
import ImposterHost from "./ImposterHost";
import WordleHost from "./WordleHost";
import WordleCategoryPicker from "./WordleCategoryPicker";
import RewardWheel from "./RewardWheel";
import MinigamePicker from "./MinigamePicker";
import DrawItHost from "./DrawItHost";
import ScenerySoundToggle from '@/components/Host/ScenerySoundToggle';
import { useHalloweenSceneryAudio } from '@/hooks/useHalloweenSceneryAudio';
import { useGameBackground } from '@/hooks/useGameBackground';
import { battleBackgroundStyle, getSceneryAudioSlugFromImage } from '@/lib/lobbyScenery';
import { DEFAULT_TIME_LIMIT } from '@/lib/timeLimit';

export default function HostGameUI() {
  const { pin } = useParams();
  const router = useRouter();
  const { getSocket, isConnected } = useSocketStore();

  const [phase, setPhase] = useState("SKILL_PICK");
  const [question, setQuestion] = useState(null);
  const [skillTimeLeft, setSkillTimeLeft] = useState(20);

  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_LIMIT);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(DEFAULT_TIME_LIMIT);
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState([]);
  const [correctId, setCorrectId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isFinalLeaderboard, setIsFinalLeaderboard] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoAdvance, setAutoAdvanceState] = useState(true);
  const autoAdvanceRef = React.useRef(true);
  const setAutoAdvance = (val) => {
    autoAdvanceRef.current = val;
    setAutoAdvanceState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zinko_auto_play', String(val));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zinko_auto_play');
      if (stored !== null) {
        setAutoAdvance(stored === 'true');
      }
    }
  }, []);

  // Minigame states
  const [minigameData, setMinigameData] = useState({
    vaultsToWin: 0,
    teamVaults: { A: { cracked: 0 }, B: { cracked: 0 } },
    heldColors: { A: [], B: [] },
    winner: null,
    spinnerName: "",
    players: []
  });

  const [higherLowerData, setHigherLowerData] = useState({
    subPhase: 'INTRO', // INTRO -> PICK -> COUNTDOWN -> GUESS
    teamA: { guess: null, status: null, lockedIn: false },
    teamB: { guess: null, status: null, lockedIn: false },
    winner: null,
    spinnerName: "",
    preSelectedRewardId: null,
    currentTurn: null
  });

  const [imposterData, setImposterData] = useState({
    subPhase: 'INTRO',
    round: 1,
    teams: [],
    teamNames: {},
    clues: { 1: {}, 2: {}, 3: {} },
    votes: {},
    correctTeams: [],
    imposterTeam: null,
    secret: null,
    currentTeamTurn: null
  });

  const [isWheelSpinning, setIsWheelSpinning] = useState(false);

  const background = useGameBackground(pin);
  useHalloweenSceneryAudio(background, pin);

  // Re-register as host if socket reconnects
  useEffect(() => {
    if (isConnected) {
      const socket = getSocket();
      const token = localStorage.getItem('zinko_jwt');
      socket?.emit("host:reconnect", { pin, token });
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

    const onError = (err) => {
      if (err.message === 'Unauthorized host') {
        router.replace('/unauthorized');
      } else {
        alert(`Server Error: ${err.message}`);
      }
    };
    socket.on("error", onError);
    return () => socket.off("error", onError);
  }, [getSocket, router]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onQuestion = (data) => {
      setQuestion(data);
      setPhase("QUESTION");
      const limit = data.timeSeconds || DEFAULT_TIME_LIMIT;
      setQuestionTimeLimit(limit);
      setTimeLeft(limit);
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

    const onMinigameFinished = ({ winnerTeam, spinnerId, spinnerName, preSelectedRewardId }) => {
      // If it's Higher/Lower, set winner there too
      setHigherLowerData(prev => ({ ...prev, winner: winnerTeam, spinnerName, preSelectedRewardId }));
      setMinigameData(prev => ({ ...prev, winner: winnerTeam, spinnerName, spinnerId, preSelectedRewardId }));

      // Ensure the wheel doesn't auto-spin from a previous game
      setIsWheelSpinning(false);

      if (!winnerTeam) {
        // Nobody won (both eliminated). Skip reward phase and proceed.
        setTimeout(() => {
          getSocket().emit("game:next-question", { pin });
        }, 3000);
      } else {
        // Delay transitioning to the Reward Wheel so the popup has time to display
        setTimeout(() => {
          setPhase("MINIGAME_REWARD");
        }, 4000);
      }
    };

    const onMinigameHigherLowerStarted = () => {
      setHigherLowerData({
        subPhase: 'INTRO',
        teamA: { guess: null, status: null, lockedIn: false },
        teamB: { guess: null, status: null, lockedIn: false },
        winner: null,
        spinnerName: "",
        preSelectedRewardId: null,
        currentTurn: null
      });
      setIsWheelSpinning(false);
      setPhase("MINIGAME_HIGHER_LOWER");

      setTimeout(() => {
        setHigherLowerData(prev => ({ ...prev, subPhase: 'PICK' }));
      }, 3000);
    };

    const onHigherLowerLockedIn = ({ team }) => {
      setHigherLowerData(prev => ({
        ...prev,
        [`team${team}`]: { ...prev[`team${team}`], lockedIn: true }
      }));
    };

    const onHigherLowerCountdownStarted = () => {
      setHigherLowerData(prev => ({ ...prev, subPhase: 'COUNTDOWN' }));
    };

    const onMinigameHigherLowerGuessingStarted = ({ startingTeam }) => {
      setHigherLowerData(prev => ({ ...prev, subPhase: 'GUESS', currentTurn: startingTeam }));
    };

    const onHigherLowerFeedback = ({ team, guess, status, nextTurn }) => {
      setHigherLowerData(prev => ({
        ...prev,
        [`team${team}`]: { ...prev[`team${team}`], guess, status },
        currentTurn: nextTurn || prev.currentTurn
      }));
    };

    const onWheelSpinning = () => {
      setIsWheelSpinning(true);
    };

    const onMinigameWordleCategoryPick = () => {
      setPhase("MINIGAME_WORDLE_CATEGORY_PICK");
    };

    const onMinigameImposterStarted = ({ round, teams, teamNames, currentTeamTurn }) => {
      setImposterData(prev => ({
        ...prev,
        subPhase: 'CLUE_PHASE',
        round,
        teams: teams || [],
        teamNames: teamNames || {},
        currentTeamTurn
      }));
      setIsWheelSpinning(false);
      setPhase("MINIGAME_IMPOSTER");
    };

    const onImposterClueReceived = ({ team, round, clue }) => {
      setImposterData(prev => ({
        ...prev,
        clues: {
          ...prev.clues,
          [round]: {
            ...prev.clues[round],
            [team]: clue
          }
        }
      }));
    };

    const onImposterNextRound = ({ round, currentTeamTurn }) => {
      setImposterData(prev => ({ ...prev, round, currentTeamTurn }));
    };

    const onImposterTurnChanged = ({ round, currentTeamTurn }) => {
      setImposterData(prev => ({ ...prev, round, currentTeamTurn }));
    };

    const onImposterVotingPhase = () => {
      setImposterData(prev => ({ ...prev, subPhase: 'VOTING_PHASE' }));
    };

    const onImposterVoteReceived = ({ team }) => {
      setImposterData(prev => ({
        ...prev,
        votes: {
          ...prev.votes,
          [team]: true
        }
      }));
    };

    const onImposterReveal = ({ imposterTeam, secret, votes, correctTeams }) => {
      setImposterData(prev => ({
        ...prev,
        subPhase: 'REVEAL_PHASE',
        imposterTeam,
        secret,
        votes,
        correctTeams
      }));
    };

    const onRewardQueueEmpty = () => {
      getSocket().emit("game:next-question", { pin });
    };

    const onMinigameWordleStarted = ({ wordLength, hint, category, state }) => {
      setMinigameData(prev => ({ ...prev, wordLength, hint, category, state, winner: null }));
      setIsWheelSpinning(false);
      setPhase("MINIGAME_WORDLE");
    };

    const onMinigameDrawItStarted = ({ word, teamNames }) => {
      setMinigameData(prev => ({ ...prev, word, teamNames, winner: null }));
      setIsWheelSpinning(false);
      setPhase("MINIGAME_DRAW_IT");
    };

    const onWordleProgress = ({ team, lives, guesses, isEliminated }) => {
      setMinigameData(prev => ({
        ...prev,
        state: {
          ...prev.state,
          [team]: { lives, guesses, isEliminated }
        }
      }));
    };

    const onMinigameRewardClaimed = () => {
      // Wait 3 seconds so players can see the reward before moving on automatically
      setTimeout(() => {
        getSocket().emit("game:next-question", { pin });
      }, 3000);
    };

    const onHostSyncState = (data) => {
      // If backend is in LOBBY, we are in the initial SKILL_PICK screen, so don't override phase.
      if (data.phase && data.phase !== 'LOBBY') setPhase(data.phase);
      if (data.question) {
        setQuestion(data.question);
        const limit = data.question.timeSeconds || DEFAULT_TIME_LIMIT;
        setQuestionTimeLimit(limit);
      }
      if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
      if (data.answered !== undefined) setAnswered(data.answered);
      if (data.total !== undefined) setTotal(data.total);
      if (data.stats) setStats(data.stats);
      if (data.correctId) setCorrectId(data.correctId);
      if (data.leaderboard) setLeaderboard(data.leaderboard);
      if (data.isFinalLeaderboard !== undefined) setIsFinalLeaderboard(data.isFinalLeaderboard);
      if (data.minigameData) setMinigameData(prev => ({ ...prev, ...data.minigameData }));
    };

    socket.on("host:sync-state-response", onHostSyncState);
    socket.on("game:question", onQuestion);
    socket.on("game:timer-tick", onTimerTick);
    socket.on("host:answer-progress", onAnswerProgress);
    socket.on("game:reveal-results", onRevealResults);
    socket.on("game:leaderboard", onLeaderboard);
    socket.on("game:finished", onFinished);

    socket.on("game:minigame-started", onMinigameStarted);
    socket.on("game:minigame-progress", onMinigameProgress);
    socket.on("game:minigame-vault-cracked", onMinigameVaultCracked);
    socket.on("game:minigame-higher-lower-started", onMinigameHigherLowerStarted);
    socket.on("game:higher-lower-locked-in", onHigherLowerLockedIn);
    socket.on("game:minigame-higher-lower-countdown-started", onHigherLowerCountdownStarted);
    socket.on("game:minigame-higher-lower-guessing-started", onMinigameHigherLowerGuessingStarted);
    socket.on("game:higher-lower-feedback", onHigherLowerFeedback);

    socket.on("game:minigame-imposter-started", onMinigameImposterStarted);
    socket.on("game:imposter-clue-received", onImposterClueReceived);
    socket.on("game:imposter-next-round", onImposterNextRound);
    socket.on("game:imposter-turn-changed", onImposterTurnChanged);
    socket.on("game:imposter-voting-phase", onImposterVotingPhase);
    socket.on("game:imposter-vote-received", onImposterVoteReceived);
    socket.on("game:imposter-reveal", onImposterReveal);
    socket.on("game:reward-queue-empty", onRewardQueueEmpty);
    socket.on("game:minigame-finished", onMinigameFinished);
    socket.on("game:wheel-spinning", onWheelSpinning);
    socket.on("game:minigame-wordle-category-pick", onMinigameWordleCategoryPick);
    socket.on("game:minigame-wordle-started", onMinigameWordleStarted);
    socket.on("game:minigame-draw-it-started", onMinigameDrawItStarted);
    socket.on("game:wordle-progress", onWordleProgress);
    socket.on("game:minigame-reward-claimed", onMinigameRewardClaimed);

    return () => {
      socket.off("host:sync-state-response", onHostSyncState);
      socket.off("game:question", onQuestion);
      socket.off("game:timer-tick", onTimerTick);
      socket.off("host:answer-progress", onAnswerProgress);
      socket.off("game:reveal-results", onRevealResults);
      socket.off("game:leaderboard", onLeaderboard);
      socket.off("game:finished", onFinished);
      socket.off("game:minigame-started", onMinigameStarted);
      socket.off("game:minigame-progress", onMinigameProgress);
      socket.off("game:minigame-vault-cracked", onMinigameVaultCracked);
      socket.off("game:minigame-higher-lower-started", onMinigameHigherLowerStarted);
      socket.off("game:higher-lower-locked-in", onHigherLowerLockedIn);
      socket.off("game:minigame-higher-lower-countdown-started", onHigherLowerCountdownStarted);
      socket.off("game:minigame-higher-lower-guessing-started", onMinigameHigherLowerGuessingStarted);
      socket.off("game:higher-lower-feedback", onHigherLowerFeedback);

      socket.off("game:minigame-imposter-started", onMinigameImposterStarted);
      socket.off("game:imposter-clue-received", onImposterClueReceived);
      socket.off("game:imposter-next-round", onImposterNextRound);
      socket.off("game:imposter-turn-changed", onImposterTurnChanged);
      socket.off("game:imposter-voting-phase", onImposterVotingPhase);
      socket.off("game:imposter-vote-received", onImposterVoteReceived);
      socket.off("game:imposter-reveal", onImposterReveal);
      socket.off("game:reward-queue-empty", onRewardQueueEmpty);
      socket.off("game:minigame-finished", onMinigameFinished);
      socket.off("game:wheel-spinning", onWheelSpinning);
      socket.off("game:minigame-wordle-category-pick", onMinigameWordleCategoryPick);
      socket.off("game:minigame-wordle-started", onMinigameWordleStarted);
      socket.off("game:minigame-draw-it-started", onMinigameDrawItStarted);
      socket.off("game:wordle-progress", onWordleProgress);
      socket.off("game:minigame-reward-claimed", onMinigameRewardClaimed);
    };
  }, [getSocket, pin]);

  const handleShowLeaderboard = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    getSocket().emit("host:show-leaderboard", { pin });
  }, [pin, getSocket, isTransitioning]);

  const handleNextQuestion = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // If it's the end of Round 1 (assuming 5 questions per round, next index is 5)
    if (question?.index === 4) {
      getSocket().emit("host:start-minigame-wordle-intro", { pin });
    }
    // If it's the end of Round 2 (next index is 10)
    else if (question?.index === 9) {
      setPhase("MINIGAME_PICKER");
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

  // Auto-advance to leaderboard and next question
  useEffect(() => {
    if (!autoAdvance) return;

    if (phase === "RESULT") {
      const timer = setTimeout(() => {
        handleShowLeaderboard();
      }, 4000);
      return () => clearTimeout(timer);
    }

    if (phase === "LEADERBOARD" && !isFinalLeaderboard) {
      const timer = setTimeout(() => {
        handleNextQuestion();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase, isFinalLeaderboard, handleShowLeaderboard, handleNextQuestion, autoAdvance]);

  const handleManualAdvance = useCallback(() => {
    if (phase === "RESULT") {
      handleShowLeaderboard();
    } else {
      handleNextQuestion();
    }
  }, [phase, handleShowLeaderboard, handleNextQuestion]);

  // Loading state
  if (!question && phase !== "SKILL_PICK") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={battleBackgroundStyle(background)}>
        <div className="text-center">
          <div className="w-14 h-14 border-[5px] border-zk-border border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black uppercase tracking-widest text-zk-text/50">
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden relative font-sans"
      style={battleBackgroundStyle(background)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none z-0" />

      <div className="fixed bottom-6 left-6 z-[120] pointer-events-auto">
        <ScenerySoundToggle
          visible={Boolean(getSceneryAudioSlugFromImage(background))}
          scenerySlug={getSceneryAudioSlugFromImage(background)}
        />
      </div>

      {(phase === "RESULT" || phase === "LEADERBOARD") && (
        <div className="fixed bottom-6 right-6 z-[120] pointer-events-auto flex items-center gap-4">
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`font-bold text-xs py-1.5 px-3 rounded-md shadow-md border-2 tracking-wider ${autoAdvance ? 'bg-green-600/80 border-green-400 text-white' : 'bg-neutral-800/80 border-neutral-500 text-neutral-300'}`}
          >
            Auto Next Question: {autoAdvance ? 'On' : 'Off'}
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-1">
        <AnimatePresence mode="wait">
          {phase === "SKILL_PICK" && (
            <SkillPickPhase skillTimeLeft={skillTimeLeft} />
          )}

          {phase === "QUESTION" && (
            isDragLayersQuestion(question?.questionType) ? (
              <DragLayersPhase
                question={question}
                timeLeft={timeLeft}
                totalTime={questionTimeLimit}
                answered={answered}
                total={total}
              />
            ) : isLineMatchingQuestion(question?.questionType) ? (
              <LineMatchingPhase
                question={question}
                timeLeft={timeLeft}
                totalTime={questionTimeLimit}
                answered={answered}
                total={total}
              />
            ) : (
              <QuestionPhase
                question={question}
                timeLeft={timeLeft}
                totalTime={questionTimeLimit}
                answered={answered}
                total={total}
              />
            )
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

          {phase === "MINIGAME_WORDLE_CATEGORY_PICK" && (
            <WordleCategoryPicker
              onSelectCategory={(category) => {
                getSocket().emit("host:start-minigame-wordle", { pin, category });
              }}
            />
          )}

          {phase === "MINIGAME_PICKER" && (
            <MinigamePicker
              onPick={(choice) => {
                if (choice === 'DRAW_IT') {
                  getSocket().emit("host:start-minigame-draw-it", { pin });
                } else if (choice === 'IMPOSTER') {
                  getSocket().emit("host:start-minigame-imposter", { pin });
                }
              }}
            />
          )}

          {phase === "MINIGAME_WORDLE" && (
            <WordleHost wordleData={minigameData} />
          )}

          {phase === "MINIGAME_RACING" && minigameData.teamVaults && (
            <VaultBreakerHost
              teamVaults={minigameData.teamVaults}
              heldColors={minigameData.heldColors}
              vaultsToWin={minigameData.vaultsToWin}
              winner={minigameData.winner}
            />
          )}

          {phase === "MINIGAME_HIGHER_LOWER" && (
            <HigherLowerHost
              teamA={higherLowerData.teamA}
              teamB={higherLowerData.teamB}
              winner={higherLowerData.winner}
              subPhase={higherLowerData.subPhase}
              currentTurn={higherLowerData.currentTurn}
              background={background}
            />
          )}

          {phase === "MINIGAME_DRAW_IT" && (
            <DrawItHost
              pin={pin}
              word={minigameData.word}
              roundsRemaining={minigameData.roundsRemaining || 2}
              winnerTeam={minigameData.winner}
              winnerNickname={minigameData.winnerNickname}
              teamNames={minigameData.teamNames}
              background={background}
            />
          )}

          {phase === "MINIGAME_IMPOSTER" && (
            <ImposterHost
              imposterData={imposterData}
              background={background}
            />
          )}

          {phase === "MINIGAME_REWARD" && (
            <RewardWheel
              key={minigameData.spinnerId || minigameData.winner}
              pin={pin}
              winnerTeam={minigameData.winner}
              spinnerName={minigameData.spinnerName}
              isSpinner={false} // Host is never the spinner
              preSelectedRewardId={minigameData.preSelectedRewardId}
              externalSpinTrigger={isWheelSpinning}
              onRewardClaimed={() => {
                getSocket().emit("host:process-reward-queue", { pin });
              }}
              isHost={true}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
