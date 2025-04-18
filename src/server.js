const app = require('./app')
const http = require('http');
const { initSocket } = require('./utils/socket');
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = initSocket(server);

server.listen(port, () => {
  console.log(`Serveur lancé `);
});
