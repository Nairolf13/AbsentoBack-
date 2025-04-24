const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});

module.exports = limiter;
