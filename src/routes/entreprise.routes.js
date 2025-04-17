const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entreprise.controller');

// Inscription d'une entreprise
router.post('/register', entrepriseController.registerEntreprise);

// Modification des infos entreprise
router.put('/:id', entrepriseController.updateEntreprise);

// Suppression entreprise
router.delete('/:id', entrepriseController.deleteEntreprise);

// Récupérer infos entreprise
router.get('/:id', entrepriseController.getEntreprise);

module.exports = router;