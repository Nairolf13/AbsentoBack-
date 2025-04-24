// src/utils/socket.js
const { Server } = require('socket.io');
const socketAuthMiddleware = require('../middlewares/socketAuth.middleware');
let ioInstance;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  ioInstance.use(socketAuthMiddleware);

  ioInstance.on('connection', (socket) => {
    console.log('Nouveau client connecté via socket.io');
    socket.on('identify', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} rejoint la room user_${userId}`);
      }
    });
    socket.on('disconnect', () => {
      console.log('Client déconnecté');
    });
  });
  return ioInstance;
}

function getIo() {
  if (!ioInstance) throw new Error('Socket.io non initialisé');
  return ioInstance;
}

module.exports = { initSocket, getIo };
