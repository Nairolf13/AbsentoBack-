const app = require('./app')
const http = require('http');
const { initSocket } = require('./utils/socket');
const port = process.env.PORT ;

const server = http.createServer(app);
const io = initSocket(server);

server.listen(port, '0.0.0.0', () => {
  console.log(`Serveur lancé`);
});

