const { QUESTION_TIME_SECONDS, getLeaderboard, startTimer, revealResults } = require('../socketUtils');
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
    const teams = ['A', 'B'];
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
    game.activeSkillThisRound = { A: null, B: null };
    game.rabbitActive = { A: null, B: null };
    game.foxActive = { A: null, B: null };
    game.frogActive = { A: null, B: null };

    if (!game.questions || game.questions.length === 0) {
      console.error(`Game ${pin}: No questions available to start.`);
      socket.emit('error', { message: 'No questions loaded for this game.' });
      return;
    }

    const question = game.questions[0];
    console.log(`▶️  Game ${pin} started — Q1`);

    io.to(pin).emit('lobby:skills-update', { teamSkills: game.teamSkills });

    io.to(pin).emit('game:question', {
      index: 0,
      round: 1,
      match: 1,
      total: game.questions.length,
      questionText: question.question_text || '',
      imageUrl: question.image_url || null,
      answers: Array.isArray(question.answers) ? question.answers.map(a => ({ id: a.id, text: a.text, color: a.color })) : [],
      timeSeconds: QUESTION_TIME_SECONDS,
      skillCharges: game.skillCharges,
      teamSkills: game.teamSkills,
    });

    startTimer(io, pin, games);
  });

  // ── game:next-question ────────────────────────────────────────────────────
  socket.on('game:next-question', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    if (game.phase !== 'LEADERBOARD' && game.phase !== 'RESULT' && game.phase !== 'MINIGAME_REWARD') return; // Must be on leaderboard/result to go to next question

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
    game.activeSkillThisRound = { A: null, B: null };
    game.rabbitActive = { A: null, B: null };
    game.foxActive = { A: null, B: null };
    game.frogActive = { A: null, B: null };

    const question = game.questions[nextIndex];
    if (!question) {
      console.error(`Game ${pin}: Next question not found.`);
      return;
    }

    io.to(pin).emit('game:question', {
      index: nextIndex,
      round: Math.floor(nextIndex / 5) + 1,
      match: (nextIndex % 5) + 1,
      total: game.questions.length,
      questionText: question.question_text || '',
      imageUrl: question.image_url || null,
      answers: Array.isArray(question.answers) ? question.answers.map(a => ({ id: a.id, text: a.text, color: a.color })) : [],
      timeSeconds: QUESTION_TIME_SECONDS,
      skillCharges: game.skillCharges,
    });

    startTimer(io, pin, games);
  });

  // ── player:submit-answer ──────────────────────────────────────────────────
  socket.on('player:submit-answer', ({ pin, playerId, answerId }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'QUESTION') return;
    if (!requirePlayerSocket(game, socket, playerId)) return;
    if (game.answers[playerId] !== undefined) return; // already answered

    game.answers[playerId] = answerId;
    game.answerTimes[playerId] = (QUESTION_TIME_SECONDS - (game.timeLeft || 0)) * 1000;
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
    if (!game) return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    // Build current question payload if applicable
    let currentQuestionPayload = null;
    if (game.phase === 'QUESTION' || game.phase === 'ANSWERED' || game.phase === 'RESULT' || game.phase === 'LEADERBOARD') {
      const q = game.questions[game.currentQuestionIndex];
      if (q) {
        currentQuestionPayload = {
          index: game.currentQuestionIndex,
          round: Math.floor(game.currentQuestionIndex / 5) + 1,
          match: (game.currentQuestionIndex % 5) + 1,
          total: game.questions.length,
          questionText: q.question_text || '',
          imageUrl: q.image_url || null,
          answers: Array.isArray(q.answers) ? q.answers.map(a => ({ id: a.id, text: a.text, color: a.color })) : [],
          timeSeconds: QUESTION_TIME_SECONDS,
          skillCharges: game.skillCharges,
        };
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
    } : null;

    socket.emit('player:sync-state-response', {
      phase: game.phase,
      timeLeft: game.timeLeft,
      currentQuestion: currentQuestionPayload,
      hasAnswered: game.answers[playerId] !== undefined,
      minigameData
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
