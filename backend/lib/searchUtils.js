/**
 * Normalize text for fuzzy quiz title matching.
 * "k-drama", "K Drama", "kdrama" → "kdrama"
 */
function normalizeSearchTerm(term) {
  return String(term || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

module.exports = { normalizeSearchTerm };