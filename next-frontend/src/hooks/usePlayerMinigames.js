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

  const [fivegridData, setFivegridData] = useState({
    wordLength: 0,
    hint: "",
    category: "",
    state: {}
  });

  const [minigameSpinner, setMinigameSpinner] = useState({ id: null, name: "", preSelectedRewardId: null });
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);

  const [imposterData, setImposterData] = useState({
    subPhase: null,
    round: 1,
    isImposter: false,
    secret: null,
    imposterTeam: null,
    votes: {},
    correctTeams: [],
    currentTeamTurn: null
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

    const onMinigameFiveGridCategoryPick = () => {
      setPhase('MINIGAME_FIVEGRID_CATEGORY_PICK');
      setQuestion(null);
    };

    const onMinigameFiveGridStarted = ({ wordLength, hint, category, state }) => {
      setFivegridData({ wordLength, hint, category, state });
      setMinigameSpinner(false);
      setPhase('MINIGAME_FIVEGRID');
    };

    const onMinigameDrawItStarted = ({ word, teamNames }) => {
      setMinigameData(prev => ({ ...prev, word, teamNames, winner: null }));
      setMinigameSpinner(false);
      setPhase('MINIGAME_DRAW_IT');
    };

    const onFiveGridProgress = ({ team, lives, guesses, isEliminated }) => {
      setFivegridData(prev => ({
        ...prev,
        state: {
          ...prev.state,
          [team]: { lives, guesses, isEliminated }
        }
      }));
    };

    const onSyncStateResponse = (data) => {
      if (data.minigameData) {
        setMinigameData(prev => ({ ...prev, ...data.minigameData }));
      }
    };

    const onMinigameImposterStarted = ({ round, currentTeamTurn }) => {
      setPhase('MINIGAME_IMPOSTER');
      setImposterData(prev => ({
        ...prev,
        subPhase: 'CLUE_PHASE',
        round,
        currentTeamTurn
      }));
      getSocket().emit('player:imposter-request-role', { pin, playerId });
    };

    const onImposterRole = ({ isImposter, secret }) => {
      setImposterData(prev => ({ ...prev, isImposter, secret }));
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

    socket.on('game:minigame-started', onMinigameStarted);
    socket.on('game:minigame-progress', onMinigameProgress);
    socket.on('game:minigame-vault-cracked', onMinigameVaultCracked);
    socket.on('game:minigame-higher-lower-started', onMinigameHigherLowerStarted);
    socket.on('game:minigame-higher-lower-countdown-started', onHigherLowerCountdownStarted);
    socket.on('game:minigame-higher-lower-guessing-started', onMinigameHigherLowerGuessingStarted);
    socket.on('game:higher-lower-feedback', onHigherLowerFeedback);
    socket.on('game:minigame-finished', onMinigameFinished);
    socket.on("game:wheel-spinning", onWheelSpinning);
    socket.on("game:minigame-fivegrid-category-pick", onMinigameFiveGridCategoryPick);
    socket.on("game:minigame-fivegrid-started", onMinigameFiveGridStarted);
    socket.on("game:minigame-draw-it-started", onMinigameDrawItStarted);
    socket.on('game:fivegrid-progress', onFiveGridProgress);
    socket.on('player:sync-state-response', onSyncStateResponse);
    
    socket.on('game:minigame-imposter-started', onMinigameImposterStarted);
    socket.on('game:imposter-role', onImposterRole);
    socket.on('game:imposter-next-round', onImposterNextRound);
    socket.on('game:imposter-turn-changed', onImposterTurnChanged);
    socket.on('game:imposter-voting-phase', onImposterVotingPhase);
    socket.on('game:imposter-reveal', onImposterReveal);

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
      socket.off("game:minigame-fivegrid-category-pick", onMinigameFiveGridCategoryPick);
      socket.off("game:minigame-fivegrid-started", onMinigameFiveGridStarted);
      socket.off("game:minigame-draw-it-started", onMinigameDrawItStarted);
      socket.off('game:fivegrid-progress', onFiveGridProgress);
      socket.off('player:sync-state-response', onSyncStateResponse);
      
      socket.off('game:minigame-imposter-started', onMinigameImposterStarted);
      socket.off('game:imposter-role', onImposterRole);
      socket.off('game:imposter-next-round', onImposterNextRound);
      socket.off('game:imposter-turn-changed', onImposterTurnChanged);
      socket.off('game:imposter-voting-phase', onImposterVotingPhase);
      socket.off('game:imposter-reveal', onImposterReveal);
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

  const handleFiveGridGuess = useCallback((guess) => {
    const socket = getSocket();
    if (socket) socket.emit('player:fivegrid-guess', { pin, playerId, guess });
  }, [pin, playerId, getSocket]);

  const handleImposterSubmitClue = useCallback((clue) => {
    const socket = getSocket();
    if (socket) socket.emit('player:imposter-submit-clue', { pin, playerId, clue });
  }, [pin, playerId, getSocket]);

  const handleImposterSabotageVote = useCallback((voteTeam) => {
    const socket = getSocket();
    if (socket) socket.emit('player:imposter-sabotage-vote', { pin, playerId, voteTeam });
  }, [pin, playerId, getSocket]);

  return {
    minigameData,
    higherLowerData,
    fivegridData,
    imposterData,
    minigameSpinner,
    isWheelSpinning,
    handleHigherLowerGuess,
    handleHigherLowerSetSecret,
    handleHoldButton,
    handleReleaseButton,
    handleFiveGridGuess,
    handleImposterSubmitClue,
    handleImposterSabotageVote
  };
}
