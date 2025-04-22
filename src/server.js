const app = require('./app');
const http = require('http').createServer(app);
const { initSocket } = require('./utils/socket');
require('dotenv').config();

initSocket(http);

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
