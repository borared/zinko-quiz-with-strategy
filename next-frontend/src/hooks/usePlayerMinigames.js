import { useState, useEffect, useCallback } from 'react';
import { useSocketStore } from '@/store/useSocketStore';

export function usePlayerMinigames({ pin, playerId, setPhase, setQuestion }) {
  const { getSocket } = useSocketStore();

  const [minigameData, setMinigameData] = useState({
    vaultsToWin: 0,
    teamVaults: { A: { cracked: 0 }, B: { cracked: 0 } },
    heldColors: { A: [], B: [] },
    playerButtons: {},
    winner: null,
    players: []
  });

  const [higherLowerData, setHigherLowerData] = useState({
    subPhase: null, // 'PICK', 'COUNTDOWN', or 'GUESS'
    status: null, // 'HIGHER' or 'LOWER'
    currentTurn: null
  });

  const [hangmanData, setHangmanData] = useState({
    word: "",
    wordLength: 0,
    hint: "",
    category: "",
    state: {}
  });

  const [minigameSpinner, setMinigameSpinner] = useState({ id: null, name: "", preSelectedRewardId: null });
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);

  const [drawItData, setDrawItData] = useState({
    winnerTeam: null,
    winnerNickname: null,
    word: null,
    teamNames: {}
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

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
      setIsWheelSpinning(false);
      setPhase('MINIGAME_REWARD');
    };

    const onMinigameHigherLowerStarted = () => {
      setHigherLowerData({ subPhase: 'INTRO', status: null, currentTurn: null });
      setPhase('MINIGAME_HIGHER_LOWER');
      setTimeout(() => {
        setHigherLowerData(prev => ({ ...prev, subPhase: 'PICK' }));
      }, 3000);
    };

    const onHigherLowerCountdownStarted = () => {
      setHigherLowerData(prev => ({ ...prev, subPhase: 'COUNTDOWN' }));
    };

    const onMinigameHigherLowerGuessingStarted = ({ startingTeam }) => {
      setHigherLowerData({ subPhase: 'GUESS', status: null, currentTurn: startingTeam });
      setPhase('MINIGAME_HIGHER_LOWER');
    };

    const onHigherLowerFeedback = ({ status, playerId: feedbackPlayerId, nextTurn }) => {
      setHigherLowerData(prev => {
        // Only show status feedback if THIS player made the guess
        const newStatus = feedbackPlayerId === playerId ? { value: status, ts: Date.now() } : prev.status;
        return { ...prev, status: newStatus, currentTurn: nextTurn || prev.currentTurn };
      });
    };

    const onWheelSpinning = () => {
      setIsWheelSpinning(true);
    };

    const onMinigameHangmanCategoryPick = () => {
      setPhase('MINIGAME_HANGMAN_CATEGORY_PICK');
      setQuestion(null);
    };

    const onMinigameHangmanStarted = ({ word, wordLength, hint, category, state }) => {
      setHangmanData({ word, wordLength, hint, category, state });
      setPhase('MINIGAME_HANGMAN');
      setQuestion(null);
    };

    const onHangmanProgress = ({ team, lives, guessedLetters, isEliminated }) => {
      setHangmanData(prev => ({
        ...prev,
        state: {
          ...prev.state,
          [team]: { lives, guessedLetters, isEliminated }
        }
      }));
    };

    const onSyncStateResponse = (data) => {
      if (data.minigameData) {
        setMinigameData(prev => ({ ...prev, ...data.minigameData }));
      }
    };

    const onMinigameDrawItStarted = ({ teamNames }) => {
      setDrawItData({
        winnerTeam: null,
        winnerNickname: null,
        word: null,
        teamNames: teamNames || {}
      });
      setPhase('MINIGAME_DRAW_IT');
      setQuestion(null);
    };

    const onDrawItRoundWinner = ({ team, nickname, word }) => {
      setDrawItData(prev => ({
        ...prev,
        winnerTeam: team,
        winnerNickname: nickname,
        word
      }));
    };

    const onDrawItRoundStartPlayer = () => {
      setDrawItData(prev => ({
        ...prev,
        winnerTeam: null,
        winnerNickname: null,
        word: null
      }));
    };

    socket.on('game:minigame-started', onMinigameStarted);
    socket.on('game:minigame-progress', onMinigameProgress);
    socket.on('game:minigame-vault-cracked', onMinigameVaultCracked);
    socket.on('game:minigame-higher-lower-started', onMinigameHigherLowerStarted);
    socket.on('game:minigame-higher-lower-countdown-started', onHigherLowerCountdownStarted);
    socket.on('game:minigame-higher-lower-guessing-started', onMinigameHigherLowerGuessingStarted);
    socket.on('game:higher-lower-feedback', onHigherLowerFeedback);
    socket.on('game:minigame-finished', onMinigameFinished);
    socket.on("game:wheel-spinning", onWheelSpinning);
    socket.on("game:minigame-hangman-category-pick", onMinigameHangmanCategoryPick);
    socket.on('game:minigame-hangman-started', onMinigameHangmanStarted);
    socket.on('game:hangman-progress', onHangmanProgress);
    socket.on('player:sync-state-response', onSyncStateResponse);
    
    socket.on('game:minigame-draw-it-started', onMinigameDrawItStarted);
    socket.on('game:draw-it-round-winner', onDrawItRoundWinner);
    socket.on('game:draw-it-round-start-player', onDrawItRoundStartPlayer);

    return () => {
      socket.off('game:minigame-started', onMinigameStarted);
      socket.off('game:minigame-progress', onMinigameProgress);
      socket.off('game:minigame-vault-cracked', onMinigameVaultCracked);
      socket.off('game:minigame-higher-lower-started', onMinigameHigherLowerStarted);
      socket.off('game:minigame-higher-lower-countdown-started', onHigherLowerCountdownStarted);
      socket.off('game:minigame-higher-lower-guessing-started', onMinigameHigherLowerGuessingStarted);
      socket.off('game:higher-lower-feedback', onHigherLowerFeedback);
      socket.off('game:minigame-finished', onMinigameFinished);
      socket.off("game:wheel-spinning", onWheelSpinning);
      socket.off("game:minigame-hangman-category-pick", onMinigameHangmanCategoryPick);
      socket.off("game:minigame-hangman-started", onMinigameHangmanStarted);
      socket.off('game:hangman-progress', onHangmanProgress);
      socket.off('player:sync-state-response', onSyncStateResponse);
      
      socket.off('game:minigame-draw-it-started', onMinigameDrawItStarted);
      socket.off('game:draw-it-round-winner', onDrawItRoundWinner);
      socket.off('game:draw-it-round-start-player', onDrawItRoundStartPlayer);
    };
  }, [getSocket, setPhase, setQuestion, playerId]);

  const handleHigherLowerGuess = useCallback((guess) => {
    getSocket().emit('player:higher-lower-guess', {
      pin,
      playerId,
      guess
    });
  }, [pin, playerId, getSocket]);

  const handleHigherLowerSetSecret = useCallback((secret) => {
    getSocket().emit('player:higher-lower-set-secret', {
      pin,
      playerId,
      secret
    });
  }, [pin, playerId, getSocket]);

  const handleHoldButton = useCallback((color) => {
    const socket = getSocket();
    if (socket) socket.emit('player:hold-button', { pin, playerId, color });
  }, [pin, playerId, getSocket]);

  const handleReleaseButton = useCallback((color) => {
    const socket = getSocket();
    if (socket) socket.emit('player:release-button', { pin, playerId, color });
  }, [pin, playerId, getSocket]);

  const handleHangmanGuess = useCallback((letter) => {
    const socket = getSocket();
    if (socket) socket.emit('player:hangman-guess', { pin, playerId, letter });
  }, [pin, playerId, getSocket]);

  return {
    minigameData,
    higherLowerData,
    hangmanData,
    drawItData,
    minigameSpinner,
    isWheelSpinning,
    handleHigherLowerGuess,
    handleHigherLowerSetSecret,
    handleHoldButton,
    handleReleaseButton,
    handleHangmanGuess
  };
}
