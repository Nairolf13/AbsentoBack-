const { Server } = require('socket.io');
const socketAuthMiddleware = require('../middlewares/socketAuth.middleware');
let ioInstance;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://192.168.1.22:5173',
        'http://127.0.0.1:5173',
        'http://51.91.208.111:5173',
        'http://51.91.208.111:5888',
      ],
      methods: ['GET', 'POST'],
      credentials: true
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
