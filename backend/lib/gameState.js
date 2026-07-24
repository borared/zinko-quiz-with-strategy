const { generatePin, QUESTION_TIME_SECONDS } = require('./socketUtils');
const { DEFAULT_LOBBY_SCENERY } = require('./lobbyScenery');

// ─── Type Definitions (JSDoc) ─────────────────────────────────────────────────
// Note: Global type definitions (@typedef) are stored in `types.js` so they can be
// shared across the entire project without cluttering this file.

// ─── In-memory game store ─────────────────────────────────────────────────────
/** @type {Map<string, GameState>} */
const games = new Map(); // pin → gameState

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
    skillCharges: {
      A: { rabbit: 2, fox: 2, butterfly: 2, frog: 2 },
      B: { rabbit: 2, fox: 2, butterfly: 2, frog: 2 },
    },
    activeSkillThisRound: { A: null, B: null },
    rabbitActive: { A: null, B: null },
    foxActive: { A: null, B: null },
    frogActive: { A: null, B: null },
    activeMultiplier: null,
    minigameTaps: { A: 0, B: 0 },
    minigameTarget: { A: 100, B: 100 },
    timeLeft: QUESTION_TIME_SECONDS,
    timer: null,
    createdAt: Date.now(),
    background: DEFAULT_LOBBY_SCENERY,
    lobbyChat: [],
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

module.exports = { games, createGame, getGame, cleanupGame };
