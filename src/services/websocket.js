const WebSocket = require('ws');

let wss;
let clients = new Map();

function initWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const userId = req.url.split('?userId=')[1];
    if (userId) {
      clients.set(userId, ws);
      ws.on('close', () => clients.delete(userId));
    }
  });
}

function sendNotificationToUser(userId, message) {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'notification', message }));
  }
}

module.exports = {
  initWebSocket,
  sendNotificationToUser,
};
