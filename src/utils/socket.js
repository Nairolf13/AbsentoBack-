// src/utils/socket.js
const { Server } = require('socket.io');
let ioInstance;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  ioInstance.on('connection', (socket) => {
    console.log('Nouveau client connecté via socket.io');
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
