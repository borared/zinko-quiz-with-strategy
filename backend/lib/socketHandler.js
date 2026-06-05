/**
 * socketHandler.js
 * Central hub for all real-time game events.
 * Uses an in-memory store keyed by 6-digit PIN.
 *
 * Game phases: LOBBY → QUESTION → RESULT → LEADERBOARD → FINISHED
 */

const supabase = require('./supabaseClient');

// ─── In-memory game store ─────────────────────────────────────────────────────
const games = new Map(); // pin → gameState

const { QUESTION_TIME_SECONDS, generatePin, getLeaderboard, buildAnswerStats, startTimer, revealResults } = require('./socketUtils');
// ─── Socket event handlers ────────────────────────────────────────────────────

function initSocketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── host:initialize ───────────────────────────────────────────────────────
    // Host claims a pre-generated PIN (from REST endpoint) and loads quiz data
    socket.on('host:initialize', async ({ pin, quizId }) => {
      const game = games.get(pin);
      if (!game) {
        socket.emit('error', { message: 'Game PIN not found.' });
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
        game.questions = data;
        console.log(`🎮 Host ${socket.id} initialized game PIN ${pin} with ${data.length} questions`);
        socket.emit('host:initialized', { pin, questionCount: data.length, background: game.background });
      } catch (err) {
        console.error('❌ Failed to load questions:', err.message);
        socket.emit('error', { message: 'Failed to load quiz questions.' });
      }
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

        if (game.players.some(p => p.nickname.toLowerCase() === nickname.toLowerCase())) {
          socket.emit('error', { message: 'Nickname already taken' });
          return;
        }
        socket.join(pin);

        // Upsert player (handle reconnects)
      const existing = game.players.find(p => p.id === playerId);
      if (existing) {
        existing.socketId = socket.id;
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

    }); // end of player:join handler

    // ── lobby helpers ────────────────────────────────────────────────────────
    // Provide current player list on request (e.g., after player navigates to lobby)
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

    // Check nickname availability before joining (used during nickname entry)
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

    // ── lobby:start-countdown ──────────────────────────────────────────────────
    socket.on('lobby:start-countdown', ({ pin }) => {
      const game = games.get(pin);
      if (!game || game.hostSocketId !== socket.id) return;
      io.to(pin).emit('lobby:countdown-started');
    });

    // ── player:select-skill ──────────────────────────────────────────────────
    socket.on('player:select-skill', ({ pin, playerId, skillId, team, nickname, avatar }) => {
      const game = games.get(pin);
      if (!game) return;
      if (!game.teamSkills[team]) game.teamSkills[team] = {};
      
      if (game.teamSkills[team][skillId] && game.teamSkills[team][skillId].playerId !== playerId) {
        socket.emit('error', { message: 'Skill already taken by a teammate' });
        return;
      }

      Object.keys(game.teamSkills[team]).forEach(sId => {
        if (game.teamSkills[team][sId].playerId === playerId) {
          delete game.teamSkills[team][sId];
        }
      });
      
      game.teamSkills[team][skillId] = { playerId, nickname, avatar };
      io.to(pin).emit('lobby:skills-update', { teamSkills: game.teamSkills });
    });

    // ── player:cancel-skill ──────────────────────────────────────────────────
    socket.on('player:cancel-skill', ({ pin, skillId, team, playerId }) => {
      const game = games.get(pin);
      if (!game) return;
      if (game.teamSkills[team] && game.teamSkills[team][skillId] && game.teamSkills[team][skillId].playerId === playerId) {
        delete game.teamSkills[team][skillId];
        io.to(pin).emit('lobby:skills-update', { teamSkills: game.teamSkills });
      }
    });

    // ── lobby:request-skills ─────────────────────────────────────────────────
    socket.on('lobby:request-skills', ({ pin }) => {
      const game = games.get(pin);
      if (!game) return;
      socket.emit('lobby:skills-update', { teamSkills: game.teamSkills });
    });

    // ── game:start ────────────────────────────────────────────────────────────
    socket.on('game:start', ({ pin }) => {
      const game = games.get(pin);
      if (!game || game.hostSocketId !== socket.id) return;
      if (game.players.length === 0) {
        socket.emit('error', { message: 'Need at least 1 player to start.' });
        return;
      }

      game.phase = 'QUESTION';
      game.currentQuestionIndex = 0;
      game.answers = {};
      game.answerTimes = {};

      const question = game.questions[0];
      console.log(`▶️  Game ${pin} started — Q1`);

      io.to(pin).emit('game:question', {
        index: 0,
        total: game.questions.length,
        questionText: question.question_text,
        imageUrl: question.image_url,
        answers: question.answers.map(a => ({ id: a.id, text: a.text, color: a.color })),
        timeSeconds: QUESTION_TIME_SECONDS,
      });

      startTimer(io, pin, games);
    });

    // ── game:next-question ────────────────────────────────────────────────────
    socket.on('game:next-question', ({ pin }) => {
      const game = games.get(pin);
      if (!game || game.hostSocketId !== socket.id) return;

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

      const question = game.questions[nextIndex];

      io.to(pin).emit('game:question', {
        index: nextIndex,
        total: game.questions.length,
        questionText: question.question_text,
        imageUrl: question.image_url,
        answers: question.answers.map(a => ({ id: a.id, text: a.text, color: a.color })),
        timeSeconds: QUESTION_TIME_SECONDS,
      });

      startTimer(io, pin, games);
    });

    // ── player:submit-answer ──────────────────────────────────────────────────
    socket.on('player:submit-answer', ({ pin, playerId, answerId }) => {
      const game = games.get(pin);
      if (!game || game.phase !== 'QUESTION') return;
      if (game.answers[playerId] !== undefined) return; // already answered

      game.answers[playerId] = answerId;
      game.answerTimes[playerId] = (QUESTION_TIME_SECONDS - (game.timeLeft || 0)) * 1000;

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

    // ── host:show-leaderboard ─────────────────────────────────────────────────
    socket.on('host:show-leaderboard', ({ pin }) => {
      const game = games.get(pin);
      if (!game || game.hostSocketId !== socket.id) return;

      game.phase = 'LEADERBOARD';
      const leaderboard = getLeaderboard(game.players);

      io.to(pin).emit('game:leaderboard', {
        leaderboard: leaderboard.slice(0, 10),
        isIntermediate: game.currentQuestionIndex < game.questions.length - 1,
      });
    });

    // ── disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      // Mark player offline (don't remove — allow reconnect)
      games.forEach((game) => {
        const player = game.players.find(p => p.socketId === socket.id);
        if (player) {
          player.socketId = null;
          console.log(`👤 Player "${player.nickname}" disconnected from game ${game.pin}`);
        }
      });
    });
  });
}

// ─── Public API (used by REST routes) ────────────────────────────────────────

function createGame({ pin, quizId, hostUserId }) {
  const gamePin = pin || generatePin(games);
  games.set(gamePin, {
    pin: gamePin,
    quizId,
    hostUserId,
    hostSocketId: null,
    phase: 'LOBBY',
    players: [],
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    answerTimes: {},
    teamSkills: { A: {}, B: {} },
    timeLeft: QUESTION_TIME_SECONDS,
    timer: null,
    createdAt: Date.now(),
    background: ['/background_battle/city.jpg', '/background_battle/board.png'][Math.floor(Math.random() * 2)],
  });
  return gamePin;
}

function getGame(pin) {
  return games.get(pin);
}

function cleanupGame(pin) {
  const game = games.get(pin);
  if (game?.timer) clearInterval(game.timer);
  games.delete(pin);
}

// Auto-cleanup stale games older than 2 hours
setInterval(() => {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  games.forEach((game, pin) => {
    if (game.createdAt < twoHoursAgo) {
      cleanupGame(pin);
      console.log(`🗑️  Cleaned up stale game: ${pin}`);
    }
  });
}, 30 * 60 * 1000);

module.exports = { initSocketHandler, createGame, getGame, cleanupGame, generatePin };
