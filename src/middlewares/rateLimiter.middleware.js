const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre de 15 minutes
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});

module.exports = limiter;
