/**
 * socketHandler.js
 * Central router for all real-time game events.
 * Logic is split across modular files in socketHandlers/ directory.
 */

const { games, createGame, getGame, cleanupGame } = require('./gameState');
const { generatePin } = require('./socketUtils');

const registerLobbyHandlers = require('./socketHandlers/lobbyHandlers');
const registerGameHandlers = require('./socketHandlers/gameHandlers');
const registerSkillHandlers = require('./socketHandlers/skillHandlers');
const registerMinigameHandlers = require('./socketHandlers/minigameHandlers');

function initSocketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Register all modular handlers
    registerLobbyHandlers(io, socket, games);
    registerGameHandlers(io, socket, games);
    registerSkillHandlers(io, socket, games);
    registerMinigameHandlers(io, socket, games);

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

module.exports = { initSocketHandler, createGame, getGame, cleanupGame, generatePin };
