const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function verifyToken(req, res, next) {
  const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
  if (!token) {
    console.error('AUTH ERROR: Aucun token reçu. Cookies =', req.cookies, 'Headers =', req.headers['authorization']);
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      console.error('AUTH ERROR: JWT error', err);
      return res.status(403).json({ error: 'Token invalide', details: err.message, tokenRecu: token });
    }
    req.user = user;
    next();
  });
}

module.exports = { verifyToken };
