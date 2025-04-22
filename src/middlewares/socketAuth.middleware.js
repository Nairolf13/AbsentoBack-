const jwt = require('jsonwebtoken');

function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];
  if (!token) {
    return next(new Error('Token manquant pour la connexion WebSocket'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error('Token WebSocket invalide'));
    }
    socket.user = user;
    next();
  });
}

module.exports = socketAuthMiddleware;
