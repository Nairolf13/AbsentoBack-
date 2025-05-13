const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entreprise.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/register', entrepriseController.registerEntreprise);

router.put('/:id', verifyToken, entrepriseController.updateEntreprise);

router.delete('/:id', verifyToken, entrepriseController.deleteEntreprise);

router.get('/:id', verifyToken, entrepriseController.getEntreprise);

module.exports = router;