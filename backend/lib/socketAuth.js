const jwt = require('jsonwebtoken');

/**
 * Verify a host JWT matches the game's registered host.
 */
function verifyHostToken(token, game) {
  if (!token || !game?.hostUserId) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId === game.hostUserId;
  } catch {
    return false;
  }
}

/**
 * True when this socket is the active host connection for the game.
 */
function isHostSocket(socket, game) {
  return Boolean(game && game.hostSocketId === socket.id);
}

/**
 * Resolve the player record for a socket in a game room.
 */
function getPlayerBySocket(game, socketId) {
  return game?.players?.find((p) => p.socketId === socketId) || null;
}

/**
 * True when the given playerId belongs to this socket in the game.
 */
function isPlayerSocket(game, socket, playerId) {
  const player = game?.players?.find((p) => p.id === playerId);
  return Boolean(player && player.socketId === socket.id);
}

/**
 * Reject spoofed player actions — returns the verified player or null.
 */
function requirePlayerSocket(game, socket, playerId) {
  if (!game || !playerId) return null;
  const player = game.players.find((p) => p.id === playerId);
  if (!player) return null;

  if (player.socketId !== socket.id) {
    console.log(`🔌 Player "${player.nickname}" reconnected on new socket: ${socket.id} (Old: ${player.socketId})`);
    player.socketId = socket.id;
    socket.join(game.pin);
    socket.join(`${game.pin}-lobby-players`);
  }

  return player;
}

module.exports = {
  verifyHostToken,
  isHostSocket,
  getPlayerBySocket,
  isPlayerSocket,
  requirePlayerSocket,
};