const quizRepository = require('../../repositories/quizRepository');
const { verifyHostToken, isHostSocket, requirePlayerSocket, getPlayerBySocket } = require('../socketAuth');
const sceneryService = require('../../services/sceneryService');

const NICKNAME_MAX_LENGTH = 20;
const NICKNAME_PATTERN = /^[a-zA-Z0-9 _-]+$/;
const CHAT_MESSAGE_MAX_LENGTH = 200;
const CHAT_HISTORY_MAX = 50;

function getPlayerLobbyRoom(pin) {
  return `${pin}-lobby-players`;
}

/** Broadcast to every player in the lobby — both teams, host excluded. */
function emitLobbyChatToAllPlayers(io, pin, event, payload) {
  io.to(getPlayerLobbyRoom(pin)).emit(event, payload);
}

module.exports = function registerLobbyHandlers(io, socket, games) {
  // ── host:initialize ───────────────────────────────────────────────────────
  // Host claims a pre-generated PIN (from REST endpoint) and loads quiz data
  socket.on('host:initialize', async ({ pin, quizId, token }) => {
    const game = games.get(pin);
    if (!game) {
      socket.emit('error', { message: 'Game PIN not found.' });
      return;
    }

    if (!verifyHostToken(token, game)) {
      socket.emit('error', { message: 'Unauthorized host' });
      return;
    }

    if (quizId && game.quizId && quizId !== game.quizId) {
      socket.emit('error', { message: 'Quiz does not match this game session.' });
      return;
    }

    game.hostSocketId = socket.id;
    socket.join(pin);

    // Fetch quiz questions via Prisma
    try {
      const data = await quizRepository.getQuestionsByQuizId(quizId);

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

    if (!verifyHostToken(token, game)) return;

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

    const trimmedNickname = String(nickname || '').trim();
    if (!trimmedNickname || trimmedNickname.length > NICKNAME_MAX_LENGTH || !NICKNAME_PATTERN.test(trimmedNickname)) {
      socket.emit('error', { message: 'Invalid nickname. Use 1-20 letters, numbers, spaces, hyphens, or underscores.' });
      return;
    }

    if (!['A', 'B'].includes(team)) {
      socket.emit('error', { message: 'Invalid team selection.' });
      return;
    }

    // Ensure nickname isn't taken by a DIFFERENT player
    if (game.players.some(p => p.nickname.toLowerCase() === trimmedNickname.toLowerCase() && p.id !== playerId)) {
      socket.emit('error', { message: 'Nickname already taken' });
      return;
    }
    socket.join(pin);
    socket.join(getPlayerLobbyRoom(pin));

    // Upsert player (handle reconnects and team/nickname changes)
    const existing = game.players.find(p => p.id === playerId);

    // Check team capacity (max 4 per team)
    const teamCount = game.players.filter(p => p.team === team && p.id !== playerId).length;
    if (teamCount >= 4) {
      socket.emit('error', { message: `Team ${team} is full (max 4 players).` });
      return;
    }

    if (existing) {
      if (existing.socketId && existing.socketId !== socket.id) {
        socket.emit('error', { message: 'This player is already connected from another device.' });
        return;
      }
      existing.socketId = socket.id;
      existing.nickname = trimmedNickname;
      existing.avatar = avatar || existing.avatar;
      existing.team = team || existing.team;
    } else {
      game.players.push({
        id: playerId,
        socketId: socket.id,
        nickname: trimmedNickname,
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

    socket.emit('player:joined', { success: true, nickname: trimmedNickname, avatar, team });
  });

  // ── lobby:request-players ─────────────────────────────────────────────────
  socket.on('lobby:request-players', ({ pin }) => {
    const game = games.get(pin);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    if (getPlayerBySocket(game, socket.id)) {
      socket.join(getPlayerLobbyRoom(pin));
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
    if (game.players.length >= 8) {
      callback({ available: false, message: 'Game room is already full (max 8 players)' });
      return;
    }
    const exists = game.players.some(p => p.nickname.toLowerCase() === nickname.trim().toLowerCase());
    if (exists) {
      callback({ available: false, message: 'Nickname already taken' });
    } else {
      callback({ available: true });
    }
  });

  // ── lobby:set-background (host only) ──────────────────────────────────────
  socket.on('lobby:set-background', async ({ pin, background }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'LOBBY') return;
    if (!isHostSocket(socket, game)) return;
    if (!game.hostUserId) return;

    try {
      const ownsScenery = await sceneryService.userOwnsSceneryImage(game.hostUserId, background);
      if (!ownsScenery) return;
    } catch (err) {
      console.error('Failed to validate scenery ownership:', err.message);
      return;
    }

    game.background = background;
    io.to(pin).emit('lobby:background-update', { background });
  });

  // ── lobby:start-countdown ─────────────────────────────────────────────────
  socket.on('lobby:start-countdown', ({ pin }) => {
    const game = games.get(pin);
    if (!isHostSocket(socket, game)) return;
    io.to(pin).emit('lobby:countdown-started');
  });

  // ── lobby:chat-send (players only — host never receives) ─────────────────
  socket.on('lobby:chat-send', ({ pin, playerId, message }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'LOBBY') return;
    if (isHostSocket(socket, game)) return;

    const player = requirePlayerSocket(game, socket, playerId);
    if (!player) return;

    const trimmed = String(message || '').trim();
    if (!trimmed || trimmed.length > CHAT_MESSAGE_MAX_LENGTH) {
      socket.emit('error', { message: 'Message must be 1–200 characters.' });
      return;
    }

    const payload = {
      id: `${Date.now()}-${playerId}`,
      playerId,
      nickname: player.nickname,
      team: player.team,
      message: trimmed,
      timestamp: Date.now(),
    };

    if (!Array.isArray(game.lobbyChat)) game.lobbyChat = [];
    game.lobbyChat.push(payload);
    if (game.lobbyChat.length > CHAT_HISTORY_MAX) {
      game.lobbyChat = game.lobbyChat.slice(-CHAT_HISTORY_MAX);
    }

    emitLobbyChatToAllPlayers(io, pin, 'lobby:chat-message', payload);
  });

  // ── lobby:chat-history (players only) ────────────────────────────────────
  socket.on('lobby:chat-history', ({ pin, playerId }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'LOBBY') return;
    if (isHostSocket(socket, game)) return;

    const player = requirePlayerSocket(game, socket, playerId);
    if (!player) return;

    socket.join(getPlayerLobbyRoom(pin));
    socket.emit('lobby:chat-history', { messages: game.lobbyChat || [] });
  });

  // ── player:leave-team ─────────────────────────────────────────────────────
  socket.on('player:leave-team', ({ pin, playerId }) => {
    const game = games.get(pin);
    if (!game) return;
    if (!requirePlayerSocket(game, socket, playerId)) return;

    if (game.phase === 'LOBBY') {
      const initialCount = game.players.length;
      game.players = game.players.filter(p => p.id !== playerId);
      socket.leave(getPlayerLobbyRoom(pin));

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
