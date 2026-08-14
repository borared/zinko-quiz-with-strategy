const quizRepository = require('../../repositories/quizRepository');
const { buildGameQuestionPayload } = require('../gameQuestionPayload');
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

      // Respect the creator's order and cap at 15 for 3 rounds of 5 matches
      game.questions = data.slice(0, 15);

      console.log(`🎮 Host ${socket.id} initialized game PIN ${pin} with ${game.questions.length} questions`);
      socket.emit('host:initialized', { pin, questionCount: game.questions.length, background: game.background });

      // Immediately send current players list to the newly connected host
      socket.emit('lobby:players-update', {
        players: game.players.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, team: p.team })),
        count: game.players.length,
        background: game.background,
        teams: game.teams,
        teamNames: game.teamNames || {},
      });
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
        currentQuestionPayload = buildGameQuestionPayload(q, game, game.currentQuestionIndex, {
          teamSkills: game.teamSkills,
        });
      }
    }

    const { getLeaderboard, buildAnswerStats } = require('../socketUtils');
    const syncData = {
      phase: game.phase,
      timeLeft: game.timeLeft,
      question: currentQuestionPayload,
      answered: game.answers ? Object.keys(game.answers).length : 0,
      total: game.players.length,
      background: game.background,
    };

    if (game.phase === 'RESULT' || game.phase === 'LEADERBOARD') {
      syncData.stats = buildAnswerStats(game);
      const q = game.questions[game.currentQuestionIndex];
      if (q) {
        const { resolveQuestionType, QUESTION_TYPES } = require('../questionTypes');
        const { getCorrectLayerOrder } = require('../dragLayersUtils');
        const { getCorrectMatches } = require('../lineMatchingUtils');
        const questionType = resolveQuestionType(q);

        if (questionType === QUESTION_TYPES.DRAG_LAYERS) {
          syncData.correctId = JSON.stringify(getCorrectLayerOrder(q.answers));
        } else if (questionType === QUESTION_TYPES.LINE_MATCHING) {
          syncData.correctId = JSON.stringify(getCorrectMatches(q.answers));
        } else {
          const correctIds = q.answers
            .filter((a) => a.isCorrect === true || a.checked === true || String(a.isCorrect) === 'true' || String(a.checked) === 'true')
            .map((a) => a.id);
          syncData.correctId = correctIds.length > 0 ? correctIds[0] : null;
        }
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

    if (!game.teams.includes(team)) {
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
      teams: game.teams,
      teamNames: game.teamNames || {},
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
    if (game.phase === 'LOBBY') {
      socket.join(pin);
    }
    if (getPlayerBySocket(game, socket.id)) {
      socket.join(getPlayerLobbyRoom(pin));
    }
    socket.emit('lobby:players-update', {
      players: game.players.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, team: p.team })),
      count: game.players.length,
      background: game.background,
      teams: game.teams,
      teamNames: game.teamNames || {},
    });
  });

  // ── lobby:check-nickname ──────────────────────────────────────────────────
  socket.on('lobby:check-nickname', ({ pin, nickname }, callback) => {
    const game = games.get(pin);
    if (!game) {
      callback({ available: false, message: 'Game not found' });
      return;
    }
    const maxPlayers = (game.teams?.length || 2) * 4;
    if (game.players.length >= maxPlayers) {
      callback({ available: false, message: `Game room is already full (max ${maxPlayers} players)` });
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

  // ── lobby:add-team (host only) ────────────────────────────────────────────
  socket.on('lobby:add-team', ({ pin }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'LOBBY') return;
    if (!isHostSocket(socket, game)) return;
    
    const possibleTeams = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const nextTeam = possibleTeams.find(t => !game.teams.includes(t));
    
    if (nextTeam) {
      game.teams.push(nextTeam);
      
      // Initialize properties for the new team
      game.teamSkills[nextTeam] = {};
      game.skillCharges[nextTeam] = { rabbit: 2, fox: 2, butterfly: 2, frog: 2 };
      game.activeSkillThisRound[nextTeam] = null;
      game.rabbitActive[nextTeam] = null;
      game.foxActive[nextTeam] = null;
      game.frogActive[nextTeam] = null;
      game.minigameTaps[nextTeam] = 0;
      game.minigameTarget[nextTeam] = 100;
      
      io.to(pin).emit('lobby:players-update', {
        players: game.players.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, team: p.team })),
        count: game.players.length,
        background: game.background,
        teams: game.teams,
      teamNames: game.teamNames || {},
      });
    }
  });

  // ── lobby:remove-team (host only) ─────────────────────────────────────────
  socket.on('lobby:remove-team', ({ pin }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'LOBBY') return;
    if (!isHostSocket(socket, game)) return;
    
    if (game.teams.length > 2) {
      const lastTeam = game.teams[game.teams.length - 1];
      
      // Reassign any players in this team to Team A just in case
      game.players.forEach(p => {
        if (p.team === lastTeam) p.team = 'A';
      });
      
      game.teams.pop();
      
      delete game.teamSkills[lastTeam];
      delete game.skillCharges[lastTeam];
      delete game.activeSkillThisRound[lastTeam];
      delete game.rabbitActive[lastTeam];
      delete game.foxActive[lastTeam];
      delete game.frogActive[lastTeam];
      delete game.minigameTaps[lastTeam];
      delete game.minigameTarget[lastTeam];

      io.to(pin).emit('lobby:players-update', {
        players: game.players.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, team: p.team })),
        count: game.players.length,
        background: game.background,
        teams: game.teams,
      teamNames: game.teamNames || {},
      });
    }
  });

  // ── lobby:move-player (host only) ─────────────────────────────────────────
  socket.on('lobby:move-player', ({ pin, playerId, newTeam }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'LOBBY') return;
    if (!isHostSocket(socket, game)) return;
    
    if (!game.teams.includes(newTeam)) return;

    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    
    // Validate target team isn't full (max 4)
    const teamCount = game.players.filter(p => p.team === newTeam && p.id !== playerId).length;
    if (teamCount >= 4) {
      socket.emit('error', { message: `Team ${newTeam} is full (max 4 players).` });
      return;
    }

    player.team = newTeam;

    io.to(pin).emit('lobby:players-update', {
      players: game.players.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, team: p.team })),
      count: game.players.length,
      background: game.background,
      teams: game.teams,
      teamNames: game.teamNames || {},
    });
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

  // ── lobby:rename-team ─────────────────────────────────────────────────────
  socket.on('lobby:rename-team', ({ pin, playerId, teamId, newName }) => {
    const game = games.get(pin);
    if (!game || game.phase !== 'LOBBY') return;
    
    // Ensure player is connected and actually on that team
    const player = requirePlayerSocket(game, socket, playerId);
    if (!player || player.team !== teamId) {
      socket.emit('error', { message: 'You can only rename your own team.' });
      return;
    }

    const trimmedName = String(newName || '').trim();
    if (!trimmedName || trimmedName.length > 15) {
      socket.emit('error', { message: 'Team name must be 1-15 characters.' });
      return;
    }

    game.teamNames[teamId] = trimmedName;

    io.to(pin).emit('lobby:players-update', {
      players: game.players.map(p => ({ id: p.id, nickname: p.nickname, avatar: p.avatar, team: p.team })),
      count: game.players.length,
      background: game.background,
      teams: game.teams,
      teamNames: game.teamNames || {},
    });
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
          teams: game.teams,
      teamNames: game.teamNames || {},
        });
      }
    }
  });
};
