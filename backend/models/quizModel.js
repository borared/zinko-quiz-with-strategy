/**
 * @typedef {Object} Question
 * @property {number} id
 * @property {number} quiz_id
 * @property {string} question_text
 * @property {string|null} image_url
 * @property {Object} answers - JSON object containing answer choices and correctness
 * @property {number} order_index
 * @property {number} round
 */

/**
 * @typedef {Object} Quiz
 * @property {number} id
 * @property {string} title
 * @property {string|null} description
 * @property {string|null} cover_image
 * @property {string} creator_id
 * @property {boolean} is_public
 * @property {boolean} is_cloned
 * @property {Question[]} questions
 * @property {Date} created_at
 * @property {Date} updated_at
 */

module.exports = {};
