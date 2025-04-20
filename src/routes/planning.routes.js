const router = require('express').Router();
const planningController = require('../controllers/planning.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Récupérer le planning détaillé d'un employé
router.get('/:employeeId', verifyToken, planningController.getEmployeePlanning);
// Créer ou mettre à jour un ou plusieurs créneaux
router.post('/', verifyToken, planningController.setEmployeePlanning);
// Supprimer un ou plusieurs créneaux
router.delete('/', verifyToken, planningController.deleteEmployeePlanning);

module.exports = router;
