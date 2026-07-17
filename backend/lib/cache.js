const NodeCache = require('node-cache');

// Standard TTL: 60 seconds
// checkperiod: 120 seconds (cleans up expired entries)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

module.exports = cache;
