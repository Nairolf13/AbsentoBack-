const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Log global pour toutes les requêtes Express
app.use((req, res, next) => {
  console.log('Global Express log:', req.method, req.originalUrl);
  next();
});

// Place les middlewares globaux AVANT les routes
app.use(cors())
app.use(express.json())

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const entrepriseRoutes = require('./routes/entreprise.routes')
const absenceRoutes = require('./routes/absence.routes')
const remplacementRoutes = require('./routes/remplacement.routes')
const statsRoutes = require('./routes/stats.routes')
const passwordRoutes = require('./routes/password.routes')
const adminRoutes = require('./routes/adminRoutes')
const utilisateurRoutes = require('./routes/utilisateur.routes')
const taskRoutes = require('./routes/task.routes')
const planningRoutes = require('./routes/planning.routes')

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/entreprises', entrepriseRoutes)
app.use('/api/absences', absenceRoutes)
app.use('/api/remplacements', remplacementRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/password', passwordRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/utilisateur', utilisateurRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/planning', planningRoutes)

module.exports = app
