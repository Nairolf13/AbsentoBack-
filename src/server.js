const app = require('./app');
const express = require('express');
const http = require('http').createServer(app);
const { initSocket } = require('./utils/socket');
require('dotenv').config();
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));
app.use(express.static(path.join(__dirname, '../../absentoFront/dist')));
app.get(/^\/(?!api|socket\.io).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../absentoFront/dist/index.html'));
});

initSocket(http);

const PORT = process.env.PORT || 5888;
http.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
