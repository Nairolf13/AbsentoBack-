const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');

// Création d'un utilisateur (employé, RH, manager)
router.post('/create', utilisateurController.createUtilisateur);

// Modification utilisateur
router.put('/:id', utilisateurController.updateUtilisateur);

// Suppression utilisateur
router.delete('/:id', utilisateurController.deleteUtilisateur);

// Récupérer infos utilisateur
router.get('/:id', utilisateurController.getUtilisateur);

// Import CSV employés
router.post('/import-csv', utilisateurController.importCSV);

module.exports = router;
