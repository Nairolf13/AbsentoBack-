const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Absences
router.get('/absences', adminController.getAllAbsences);

// Employés
router.get('/employes', adminController.getAllEmployes);

// Planning
router.get('/planning', adminController.getFullPlanning);

// Notifications
router.get('/notifications/:userId', adminController.getUserNotifications);

// Création ou mise à jour d’un planning
router.post('/planning', adminController.createOrUpdatePlanning);

// Création ou modification d’un employé
router.post('/employe', adminController.createOrUpdateEmploye);

module.exports = router;
