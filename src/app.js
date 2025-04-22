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
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://192.168.1.22:5173',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
};
app.use(cors(corsOptions))
const rateLimiter = require('./middlewares/rateLimiter.middleware');
app.use(rateLimiter);

const absenceRoutes = require('./routes/absence.routes')
app.use(express.json())
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use('/uploads', express.static('public/uploads'));

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const entrepriseRoutes = require('./routes/entreprise.routes')
const remplacementRoutes = require('./routes/remplacement.routes')
const statsRoutes = require('./routes/stats.routes')
const passwordRoutes = require('./routes/password.routes')
const adminRoutes = require('./routes/adminRoutes')
const utilisateurRoutes = require('./routes/utilisateur.routes')
const taskRoutes = require('./routes/task.routes')
const planningRoutes = require('./routes/planning.routes')

// Routes publiques
app.use('/api/auth', authRoutes)
app.use('/api/password', passwordRoutes)
app.use('/api/entreprises', entrepriseRoutes)

// Middleware d'authentification global pour toutes les routes suivantes
const { verifyToken } = require('./middlewares/auth.middleware');
app.use(verifyToken);

// Routes protégées
app.use('/api/users', userRoutes)
app.use('/api/remplacements', remplacementRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/utilisateur', utilisateurRoutes)
// Suppression du log de debug du montage du routeur utilisateur
app.use('/api/tasks', taskRoutes)
app.use('/api/planning', planningRoutes)
app.use('/api/absences', absenceRoutes)

module.exports = app
