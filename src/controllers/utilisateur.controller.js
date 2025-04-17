const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const csv = require('csv-parser');
const fs = require('fs');

// Création d'un utilisateur
exports.createUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, telephone, dateNaissance, adresse, poste, role, entrepriseId } = req.body;
    const hashed = await bcrypt.hash(motDePasse, 10);
    const utilisateur = await prisma.utilisateur.create({
      data: { nom, prenom, email, motDePasse: hashed, telephone, dateNaissance: new Date(dateNaissance), adresse, poste, role }
    });
    // Lier l'utilisateur à l'entreprise si entrepriseId fourni
    if (entrepriseId) {
      await prisma.utilisateurEntreprise.create({
        data: {
          utilisateurId: utilisateur.id,
          entrepriseId: entrepriseId,
        }
      });
    }
    res.status(201).json({ message: 'Utilisateur créé', utilisateur });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Modification utilisateur
exports.updateUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.motDePasse) {
      data.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    }
    if (data.dateNaissance) {
      data.dateNaissance = new Date(data.dateNaissance);
    }
    const utilisateur = await prisma.utilisateur.update({ where: { id }, data });
    res.json({ message: 'Utilisateur modifié', utilisateur });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Suppression utilisateur
exports.deleteUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.utilisateur.delete({ where: { id } });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer infos utilisateur
exports.getUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur = await prisma.utilisateur.findUnique({ where: { id } });
    if (!utilisateur) return res.status(404).json({ error: 'Not found' });
    res.json(utilisateur);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Import CSV employés (exemple simple, à adapter pour multer)
exports.importCSV = async (req, res) => {
  // À compléter selon la méthode d'upload (multer, etc.)
  res.status(501).json({ error: 'Import CSV non implémenté ici' });
};
