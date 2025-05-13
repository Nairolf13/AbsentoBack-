const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/create', verifyToken, utilisateurController.createUtilisateur);
router.put('/:id', verifyToken, utilisateurController.updateUtilisateur);
router.delete('/:id', verifyToken, utilisateurController.deleteUtilisateur);
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (!req.user || typeof req.user.id === 'undefined') {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    let utilisateur;
    if (typeof prisma.Utilisateur === 'function') {
      utilisateur = await prisma.Utilisateur.findUnique({
        where: { id: parseInt(req.user.id, 10) },
        select: { id: true, email: true, nom: true, prenom: true, role: true, telephone: true, adresse: true, poste: true, dateNaissance: true, entreprises: true }
      });
    } else if (typeof prisma.utilisateur === 'object' && typeof prisma.utilisateur.findUnique === 'function') {
      utilisateur = await prisma.utilisateur.findUnique({
        where: { id: parseInt(req.user.id, 10) },
        select: { id: true, email: true, nom: true, prenom: true, role: true, telephone: true, adresse: true, poste: true, dateNaissance: true, entreprises: { select: { entrepriseId: true } } }
      });
    } else {
      return res.status(500).json({ error: 'Erreur interne Prisma' });
    }
    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    let entrepriseId = null;
    if (utilisateur.entreprises && utilisateur.entreprises.length > 0) {
      entrepriseId = utilisateur.entreprises[0].entrepriseId;
    }
    res.json({ ...utilisateur, entrepriseId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, utilisateurController.getUtilisateur);
router.get('/entreprise/employes', verifyToken, utilisateurController.getUsersByEntreprise);
router.post('/import-csv', verifyToken, utilisateurController.importCSV);

module.exports = router;
