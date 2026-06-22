const supabase = require('../supabaseClient');

module.exports = function registerLobbyHandlers(io, socket, games) {
  // ── host:initialize ───────────────────────────────────────────────────────
  // Host claims a pre-generated PIN (from REST endpoint) and loads quiz data
  socket.on('host:initialize', async ({ pin, quizId, token }) => {
    const game = games.get(pin);
    if (!game) {
      socket.emit('error', { message: 'Game PIN not found.' });
      return;
    }

    if (!token) {
      socket.emit('error', { message: 'Unauthorized host' });
      return;
    }

    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
      if (decoded.userId !== game.hostUserId) {
        socket.emit('error', { message: 'Unauthorized host' });
        return;
      }
    } catch (err) {
      socket.emit('error', { message: 'Unauthorized host' });
      return;
    }

    game.hostSocketId = socket.id;
    socket.join(pin);

    // Fetch quiz questions from Supabase
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Randomize questions and cap at 15 for 3 rounds of 5 matches
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      game.questions = shuffled.slice(0, 15);

      console.log(`🎮 Host ${socket.id} initialized game PIN ${pin} with ${game.questions.length} questions`);
      socket.emit('host:initialized', { pin, questionCount: game.questions.length, background: game.background });
    } catch (err) {
      console.error('❌ Failed to load questions:', err.message);
      socket.emit('error', { message: 'Failed to load quiz questions.' });
    }
  });

  // ── host:reconnect ────────────────────────────────────────────────────────
  socket.on('host:reconnect', ({ pin, token }) => {
    const game = games.get(pin);
    if (!game) return;

    if (!token) return;

    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
      if (decoded.userId !== game.hostUserId) return;
    } catch (err) {
      return;
    }

    game.hostSocketId = socket.id;
    if (game.hostDisconnectTimer) {
      clearTimeout(game.hostDisconnectTimer);
      game.hostDisconnectTimer = null;
    }
    socket.join(pin);
    console.log(`🔌 Host reconnected to game ${pin}`);

    // Sync state back to host
    let currentQuestionPayload = null;
    if (['QUESTION', 'ANSWERED', 'RESULT', 'LEADERBOARD'].includes(game.phase)) {
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
          timeSeconds: require('../socketUtils').QUESTION_TIME_SECONDS,
          skillCharges: game.skillCharges,
          teamSkills: game.teamSkills,
        };
      }
    }

    const { getLeaderboard, buildAnswerStats } = require('../socketUtils');
    const syncData = {
      phase: game.phase,
      timeLeft: game.timeLeft,
      question: currentQuestionPayload,
      answered: game.answers ? Object.keys(game.answers).length : 0,
      total: game.players.length,
    };

    if (game.phase === 'RESULT' || game.phase === 'LEADERBOARD') {
      syncData.stats = buildAnswerStats(game);
      const q = game.questions[game.currentQuestionIndex];
      if (q) {
        const correctIds = q.answers.filter(a => a.isCorrect === true || a.checked === true || String(a.isCorrect) === 'true' || String(a.checked) === 'true').map(a => a.id);
        syncData.correctId = correctIds.length > 0 ? correctIds[0] : null;
      }
    }

    if (game.phase === 'LEADERBOARD' || game.phase === 'FINISHED') {
      syncData.leaderboard = getLeaderboard(game.players);
      syncData.isFinalLeaderboard = game.phase === 'FINISHED';
    }

    if (game.phase === 'MINIGAME_RACING') {
      syncData.minigameData = {
        vaultsToWin: game.vaultsToWin,
        teamVaults: game.teamVaults,
        playerButtons: game.playerButtons,
        heldColors: { A: Array.from(game.heldColors?.A || []), B: Array.from(game.heldColors?.B || []) }
      };
    }

    socket.emit('host:sync-state-response', syncData);
  });

  // ── player:join ───────────────────────────────────────────────────────────
  socket.on('player:join', ({ pin, playerId, nickname, avatar, team }) => {
    const game = games.get(pin);
    if (!game) {
      socket.emit('error', { message: 'Game not found. Check your PIN.' });
      return;
    }
    if (game.phase !== 'LOBBY') {
      socket.emit('error', { message: 'Game already started.' });
      return;
    }

    // Ensure nickname isn't taken by a DIFFERENT player
    if (game.players.some(p => p.nickname.toLowerCase() === nickname.toLowerCase() && p.id !== playerId)) {
      socket.emit('error', { message: 'Nickname already taken' });
      return;
    }
    socket.join(pin);

    // Upsert player (handle reconnects and team/nickname changes)
    const existing = game.players.find(p => p.id === playerId);
    if (existing) {
      existing.socketId = socket.id;
      existing.nickname = nickname;
      existing.avatar = avatar || existing.avatar;
      existing.team = team || existing.team;
    } else {
      game.players.push({
        id: playerId,
        socketId: socket.id,
        nickname,
        avatar: avatar || 'pizza',
        team: team || 'A',
        score: 0,
        lastPoints: 0,
        lastCorrect: null,
      });
    }

    console.log(`👤 Player "${nickname}" joined game ${pin} (${game.players.length} total)`);

    // Broadcast updated player list to everyone in room (host + players)
    io.to(pin).emit('lobby:players-update', {
      players: game.players.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, team: p.team })),
      count: game.players.length,
      background: game.background,
    });

    socket.emit('player:joined', { success: true, nickname, avatar, team });
  });

  // ── lobby:request-players ─────────────────────────────────────────────────
  socket.on('lobby:request-players', ({ pin }) => {
    const game = games.get(pin);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    socket.emit('lobby:players-update', {
      players: game.players.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, team: p.team })),
      count: game.players.length,
      background: game.background,
    });
  });

  // ── lobby:check-nickname ──────────────────────────────────────────────────
  socket.on('lobby:check-nickname', ({ pin, nickname }, callback) => {
    const game = games.get(pin);
    if (!game) {
      callback({ available: false, message: 'Game not found' });
      return;
    }
    const exists = game.players.some(p => p.nickname.toLowerCase() === nickname.trim().toLowerCase());
    if (exists) {
      callback({ available: false, message: 'Nickname already taken' });
    } else {
      callback({ available: true });
    }
  });

  // ── lobby:start-countdown ─────────────────────────────────────────────────
  socket.on('lobby:start-countdown', ({ pin }) => {
    const game = games.get(pin);
    if (!game || game.hostSocketId !== socket.id) return;
    io.to(pin).emit('lobby:countdown-started');
  });

  // ── player:leave-team ─────────────────────────────────────────────────────
  socket.on('player:leave-team', ({ pin, playerId }) => {
    const game = games.get(pin);
    if (!game) return;

    if (game.phase === 'LOBBY') {
      const initialCount = game.players.length;
      game.players = game.players.filter(p => p.id !== playerId);
      
      if (game.players.length !== initialCount) {
        console.log(`👋 Player ${playerId} explicitly left team in lobby ${pin}`);
        io.to(pin).emit('lobby:players-update', {
          players: game.players.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, team: p.team })),
          count: game.players.length,
          background: game.background,
        });
      }
    }
  });
};
