const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planning.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/:employeeId', verifyToken, planningController.getEmployeePlanning);
router.post('/', verifyToken, planningController.setEmployeePlanning);
router.delete('/', verifyToken, planningController.deleteEmployeePlanning);

module.exports = router;
