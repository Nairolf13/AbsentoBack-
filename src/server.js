const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });
const routes = require('./routes');
const { setupSocket } = require('./utils/socket');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

setupSocket(io);

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
