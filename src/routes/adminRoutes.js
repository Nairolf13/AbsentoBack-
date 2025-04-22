const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/absences', verifyToken, adminController.getAllAbsences);
router.get('/employes', verifyToken, adminController.getAllEmployes);
router.get('/planning', verifyToken, adminController.getFullPlanning);
router.get('/notifications/:userId', verifyToken, adminController.getUserNotifications);
router.delete('/notifications/:id', verifyToken, adminController.deleteNotification);
router.patch('/notifications/:id/read', verifyToken, adminController.markNotificationAsRead);
router.post('/planning', verifyToken, adminController.createOrUpdatePlanning);
router.post('/employe', verifyToken, adminController.createOrUpdateEmploye);

module.exports = router;
