const { QUESTION_TIME_SECONDS, getLeaderboard, startTimer, revealResults } = require('../socketUtils');
const { buildGameQuestionPayload } = require('../gameQuestionPayload');
const { cleanupGame } = require('../gameState');
const { isHostSocket, requirePlayerSocket } = require('../socketAuth');

module.exports = function registerGameHandlers(io, socket, games) {
  // ── game:start ────────────────────────────────────────────────────────────
  socket.on('game:start', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    if (game.phase !== 'LOBBY' && game.phase !== 'SKILL_PICK') {
      return; // Prevent duplicate start calls
    }
    if (game.players.length === 0) {
      socket.emit('error', { message: 'Need at least 1 player to start.' });
      return;
    }

    game.phase = 'QUESTION';
    game.currentQuestionIndex = 0;
    game.answers = {};
    game.answerTimes = {};
    game.absoluteAnswerTimes = {};
    
    // Auto-assign missing skills
    const ALL_SKILLS = ['rabbit', 'fox', 'butterfly', 'frog'];
    const teams = game.teams;
    teams.forEach(team => {
      if (!game.teamSkills[team]) game.teamSkills[team] = {};
      const teamPlayers = game.players.filter(p => p.team === team);
      const playersWithSkill = new Set(Object.values(game.teamSkills[team]).map(s => s.playerId));
      const playersNeedingSkill = teamPlayers.filter(p => !playersWithSkill.has(p.id));
      
      const availableSkills = ALL_SKILLS.filter(s => !game.teamSkills[team][s]);
      // Fisher-Yates shuffle available skills
      for (let i = availableSkills.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableSkills[i], availableSkills[j]] = [availableSkills[j], availableSkills[i]];
      }
      
      playersNeedingSkill.forEach(p => {
        if (availableSkills.length > 0) {
          const skillToAssign = availableSkills.pop();
          game.teamSkills[team][skillToAssign] = {
            playerId: p.id,
            nickname: p.nickname,
            avatar: p.avatar
          };
        }
      });
    });

    // Reset skill states for the new round
    game.activeSkillThisRound = {};
    game.rabbitActive = {};
    game.foxActive = {};
    game.frogActive = {};
    if (!game.teamWinStreaks) game.teamWinStreaks = {};
    if (!game.teamCounterBlindCharges) game.teamCounterBlindCharges = {};
    
    game.teams.forEach(t => {
      game.activeSkillThisRound[t] = null;
      game.rabbitActive[t] = null;
      if (game.teamWinStreaks[t] === undefined) game.teamWinStreaks[t] = 0;
      if (game.teamCounterBlindCharges[t] === undefined) game.teamCounterBlindCharges[t] = 0;
      game.foxActive[t] = null;
      game.frogActive[t] = null;
    });

    if (!game.questions || game.questions.length === 0) {
      console.error(`Game ${pin}: No questions available to start.`);
      socket.emit('error', { message: 'No questions loaded for this game.' });
      return;
    }

    const question = game.questions[0];
    console.log(`▶️  Game ${pin} started — Q1 Intro`);

    io.to(pin).emit('lobby:skills-update', { teamSkills: game.teamSkills });

    game.phase = 'QUESTION_INTRO';
    io.to(pin).emit('game:question-intro', {
      question: buildGameQuestionPayload(question, game, 0, {
        teamSkills: game.teamSkills,
      })
    });

    setTimeout(() => {
      const currentGame = games.get(pin);
      if (!currentGame || currentGame.phase !== 'QUESTION_INTRO') return;
      
      currentGame.phase = 'QUESTION';
      io.to(pin).emit('game:question', buildGameQuestionPayload(question, currentGame, 0, {
        teamSkills: currentGame.teamSkills,
      }));
      startTimer(io, pin, games);
    }, 4000);
  });

  // ── game:next-question ────────────────────────────────────────────────────
  socket.on('game:next-question', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    if (game.phase !== 'LEADERBOARD' && game.phase !== 'RESULT' && game.phase !== 'MINIGAME_REWARD' && game.phase !== 'MINIGAME_FINISHED_NO_WINNER') return; // Must be on leaderboard/result/reward/no-winner to go to next question

    const nextIndex = game.currentQuestionIndex + 1;

    if (nextIndex >= game.questions.length) {
      // Game over
      game.phase = 'FINISHED';
      const finalLeaderboard = getLeaderboard(game.players);
      io.to(pin).emit('game:finished', { leaderboard: finalLeaderboard });
      console.log(`🏁 Game ${pin} finished`);
      return;
    }

    game.currentQuestionIndex = nextIndex;
    game.phase = 'QUESTION';
    game.answers = {};
    game.answerTimes = {};
    game.absoluteAnswerTimes = {};
    
    // Reset skill states for the new round
    game.activeSkillThisRound = {};
    game.rabbitActive = {};
    game.foxActive = {};
    game.frogActive = {};
    game.teams.forEach(t => {
      game.activeSkillThisRound[t] = null;
      game.rabbitActive[t] = null;
      game.foxActive[t] = null;
      game.frogActive[t] = null;
    });

    const question = game.questions[nextIndex];
    if (!question) {
      console.error(`Game ${pin}: Next question not found.`);
      return;
    }

    io.to(pin).emit('game:question', buildGameQuestionPayload(question, game, nextIndex));

    startTimer(io, pin, games);
  });

  // ── player:submit-answer ──────────────────────────────────────────────────
  socket.on('player:submit-answer', ({ pin, playerId, answerId }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'QUESTION') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;
    if (game.answers[playerId] !== undefined) return; // already answered

    game.answers[playerId] = answerId;
    const timeLimit = game.currentTimeLimit || QUESTION_TIME_SECONDS;
    game.answerTimes[playerId] = (timeLimit - (game.timeLeft || 0)) * 1000;
    game.absoluteAnswerTimes = game.absoluteAnswerTimes || {};
    game.absoluteAnswerTimes[playerId] = Date.now();

    const answeredCount = Object.keys(game.answers).length;
    const totalPlayers = game.players.length;

    socket.emit('player:answer-received', { answerId });

    // Live progress broadcast to host
    io.to(game.hostSocketId).emit('host:answer-progress', {
      answered: answeredCount,
      total: totalPlayers,
    });

    // Auto-reveal when everyone answered
    if (answeredCount >= totalPlayers) {
      clearInterval(game.timer);
      revealResults(io, pin, games);
    }
  });

  // ── player:sync-state ─────────────────────────────────────────────────────
  socket.on('player:sync-state', ({ pin, playerId }) => {
    const game = games.get(pin);
    if (!game) {
      socket.emit('player:sync-state-response', { error: 'Game not found' });
      return;
    }
    const player = requirePlayerSocket(game, socket, playerId);
    if (!player) {
      socket.emit('player:sync-state-response', { error: 'Player not found' });
      return;
    }

    // Build current question payload if applicable
    let currentQuestionPayload = null;
    if (game.phase === 'QUESTION_INTRO' || game.phase === 'QUESTION' || game.phase === 'ANSWERED' || game.phase === 'RESULT' || game.phase === 'LEADERBOARD') {
      const q = game.questions[game.currentQuestionIndex];
      if (q) {
        currentQuestionPayload = buildGameQuestionPayload(q, game, game.currentQuestionIndex);
      }
    }


    const minigameData = game.phase === 'MINIGAME_RACING' ? {
      vaultsToWin: game.vaultsToWin,
      teamVaults: game.teamVaults,
      playerButtons: game.playerButtons,
      heldColors: {
        A: Array.from(game.heldColors?.A || []),
        B: Array.from(game.heldColors?.B || [])
      }
    } : game.phase === 'MINIGAME_FIVEGRID' ? {
      wordLength: game.fivegridSecret?.length || 5,
      hint: game.fivegridHint,
      category: game.fivegridCategory,
      state: game.fivegridState,
      teams: game.teams,
      teamNames: game.teamNames || {}
    } : game.phase === 'MINIGAME_DRAW_IT' ? {
      word: null,
      wordLength: game.drawItWord ? game.drawItWord.length : 0,
      teamNames: game.teamNames || {},
      winner: game.drawItWinnerTeam || null,
      winnerNickname: game.drawItWinnerNickname || null
    } : null;

    const isImposterPhase = ['MINIGAME_IMPOSTER', 'MINIGAME_IMPOSTER_VOTING', 'MINIGAME_IMPOSTER_REVEAL'].includes(game.phase);
    const imposterData = isImposterPhase ? {
      subPhase: game.phase === 'MINIGAME_IMPOSTER' ? 'CLUE_PHASE' :
                game.phase === 'MINIGAME_IMPOSTER_VOTING' ? 'VOTING_PHASE' : 'REVEAL_PHASE',
      round: game.imposterRound || 1,
      isImposter: player ? (player.team === game.imposterTeam) : false,
      secret: player ? (player.team === game.imposterTeam ? null : game.imposterSecret) : null,
      imposterTeam: game.imposterTeam,
      votes: game.imposterVotes || {},
      correctTeams: game.imposterVotes ? game.teams.filter(t => t !== game.imposterTeam && game.imposterVotes[t] === game.imposterTeam) : [],
      currentTeamTurn: game.teams[game.imposterTurnIndex || 0],
      teams: game.teams,
      teamNames: game.teamNames || {}
    } : null;

    const isLeader = player && game.teamLeaders?.[player.team] === playerId;

    socket.emit('player:sync-state-response', {
      phase: game.phase,
      timeLeft: game.timeLeft,
      currentQuestion: currentQuestionPayload,
      hasAnswered: game.answers[playerId] !== undefined,
      minigameData,
      imposterData,
      background: game.background,
      isLeader,
    });
  });

  // ── host:show-leaderboard ─────────────────────────────────────────────────
  socket.on('host:show-leaderboard', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    if (game.phase !== 'RESULT') return; // Must be on result screen to show leaderboard

    game.phase = 'LEADERBOARD';
    const leaderboard = getLeaderboard(game.players);

    io.to(pin).emit('game:leaderboard', {
      leaderboard: leaderboard.slice(0, 10),
      isIntermediate: game.currentQuestionIndex < game.questions.length - 1,
    });
  });

  // ── host:end-game ─────────────────────────────────────────────────────────
  socket.on('host:end-game', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    cleanupGame(pin);
    console.log(`🗑️  Host explicitly ended game: ${pin}`);
  });
};
