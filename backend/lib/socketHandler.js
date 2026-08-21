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
      games.forEach((game, pin) => {
        if (game.hostSocketId === socket.id) {
          console.log(`👑 Host disconnected from game ${pin}. Waiting 4s for reconnect...`);
          io.to(pin).emit('game:host-reconnecting', { reconnectTimeoutMs: 4000 });
          game.hostDisconnectTimer = setTimeout(() => {
            console.log(`👑 Host permanently disconnected from game ${pin}.`);
            io.to(pin).emit('game:host-disconnected', { message: 'The host has disconnected.' });
          }, 4000);
        } else {
          const player = game.players.find(p => p.socketId === socket.id);
          if (player) {
            player.socketId = null;
            console.log(`👤 Player "${player.nickname}" disconnected from game ${pin}`);
            
            // If still in lobby, remove player entirely and update lobby so their avatar leaves
            if (game.phase === 'LOBBY') {
              const team = player.team;
              game.players = game.players.filter(p => p.id !== player.id);

              // Reassign leader if they were the leader of their team
              if (game.teamLeaders && game.teamLeaders[team] === player.id) {
                const nextTeammate = game.players.find(p => p.team === team);
                if (nextTeammate) {
                  game.teamLeaders[team] = nextTeammate.id;
                } else {
                  delete game.teamLeaders[team];
                }
              }

              io.to(pin).emit('lobby:players-update', {
                players: game.players.map(p => ({
                  id: p.id,
                  nickname: p.nickname,
                  avatar: p.avatar,
                  team: p.team,
                  isLeader: game.teamLeaders?.[p.team] === p.id
                })),
                count: game.players.length,
                background: game.background,
                teams: game.teams,
                teamNames: game.teamNames || {},
              });
              console.log(`👋 Player "${player.nickname}" removed from lobby ${pin}`);
            }
          }
        }
      });
    });
  });
}

module.exports = { initSocketHandler, createGame, getGame, cleanupGame, generatePin };
