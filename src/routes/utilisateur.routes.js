const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Création d'un utilisateur (employé, RH, manager)
router.post('/create', utilisateurController.createUtilisateur);

// Modification utilisateur
router.put('/:id', utilisateurController.updateUtilisateur);

// Suppression utilisateur
router.delete('/:id', utilisateurController.deleteUtilisateur);

// Endpoint pour récupérer le profil de l'utilisateur connecté
router.get('/me', async (req, res) => {
  try {
    if (!req.user || typeof req.user.id === 'undefined') {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    let utilisateur;
    if (typeof prisma.Utilisateur === 'function') {
      utilisateur = await prisma.Utilisateur.findUnique({
        where: { id: parseInt(req.user.id, 10) },
        select: { id: true, email: true, nom: true, prenom: true, role: true, telephone: true, adresse: true, poste: true, dateNaissance: true }
      });
    } else if (typeof prisma.utilisateur === 'object' && typeof prisma.utilisateur.findUnique === 'function') {
      utilisateur = await prisma.utilisateur.findUnique({
        where: { id: parseInt(req.user.id, 10) },
        select: { id: true, email: true, nom: true, prenom: true, role: true, telephone: true, adresse: true, poste: true, dateNaissance: true }
      });
    } else {
      return res.status(500).json({ error: 'Erreur interne Prisma' });
    }
    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(utilisateur);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Récupérer infos utilisateur
router.get('/:id', utilisateurController.getUtilisateur);

// Liste des employés liés à l'entreprise de l'utilisateur connecté
router.get('/entreprise/employes', verifyToken, utilisateurController.getUsersByEntreprise);

// Import CSV employés
router.post('/import-csv', utilisateurController.importCSV);

module.exports = router;
