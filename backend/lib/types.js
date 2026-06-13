/**
 * types.js
 * This file contains global JSDoc type definitions for the backend.
 * VSCode automatically reads this file to provide intelligent auto-complete across the project.
 */

/**
 * @typedef {Object} Player
 * @property {string} id
 * @property {string|null} socketId
 * @property {string} nickname
 * @property {string} avatar
 * @property {string} team
 * @property {number} score
 */

/**
 * @typedef {Object} GameState
 * @property {string} pin - The 6-digit game room code
 * @property {string} phase - The current screen (LOBBY, QUESTION, RESULT, MINIGAME_RACING)
 * @property {Player[]} players - Array of players in the game
 * @property {Object[]} questions - The fetched quiz questions
 * @property {string|null} hostSocketId - The socket ID of the host
 * @property {Object} teamVaults - Data for the Vault Cracker minigame
 * @property {Object} teamSkills - Assigned skills for each team
 * @property {Object} skillCharges - Remaining skill usages
 */
