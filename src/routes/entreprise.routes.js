const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entreprise.controller');

router.post('/register', entrepriseController.registerEntreprise);

router.put('/:id', entrepriseController.updateEntreprise);

router.delete('/:id', entrepriseController.deleteEntreprise);

router.get('/:id', entrepriseController.getEntreprise);

module.exports = router;