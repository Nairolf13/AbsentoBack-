const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/entreprises', require('./routes/entreprise.routes'));
app.use('/api/absences', require('./routes/absence.routes'));
app.use('/api/remplacements', require('./routes/remplacement.routes'));
// app.use('/api/stats', require('./routes/stats.routes'));

app.get('/api/', (req, res) => {
  res.send('Absento backend is running!');
});

module.exports = app;
