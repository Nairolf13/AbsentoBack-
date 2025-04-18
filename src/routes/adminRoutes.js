const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/auth.middleware');

// Absences
router.get('/absences', verifyToken, adminController.getAllAbsences);

// Employés
router.get('/employes', verifyToken, adminController.getAllEmployes);

// Planning
router.get('/planning', verifyToken, adminController.getFullPlanning);

// Notifications
router.get('/notifications/:userId', verifyToken, adminController.getUserNotifications);

// Création ou mise à jour d’un planning
router.post('/planning', verifyToken, adminController.createOrUpdatePlanning);

// Création ou modification d’un employé
router.post('/employe', verifyToken, adminController.createOrUpdateEmploye);

module.exports = router;
