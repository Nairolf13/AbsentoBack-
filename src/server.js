const app = require('./app');
const express = require('express'); // ajouté pour utiliser express.static
const http = require('http').createServer(app);
const { initSocket } = require('./utils/socket');
require('dotenv').config();
const path = require('path');

// Ajout pour servir le build React du frontend
app.use(express.static(path.join(__dirname, '../../absento-frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../absento-frontend/dist/index.html'));
});

initSocket(http);

const PORT = process.env.PORT || 5888;
http.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
