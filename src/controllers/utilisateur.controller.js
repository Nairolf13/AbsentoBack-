const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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
    const utilisateur = await prisma.utilisateur.findUnique({ where: { id: parseInt(id) } });
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

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.utilisateur.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération utilisateurs', error });
  }
};

// Récupérer un utilisateur par ID (alias de getUtilisateur)
exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.utilisateur.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération utilisateur', error });
  }
};

// Modifier le rôle d'un utilisateur
exports.modifierRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  try {
    const updatedUser = await prisma.utilisateur.update({
      where: { id: parseInt(userId) },
      data: { role }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la modification du rôle." });
  }
};

// Modifier le planning d'un utilisateur
exports.modifierPlanning = async (req, res) => {
  const { userId } = req.params;
  const { joursTravailles, horaires } = req.body;
  try {
    const updatedUser = await prisma.utilisateur.update({
      where: { id: parseInt(userId) },
      data: { joursTravailles, horaires }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du planning." });
  }
};

// Récupérer tous les employés d'une entreprise
exports.getUsersByEntreprise = async (req, res) => {
  try {
    const entrepriseId = req.user.entrepriseId;
    if (!entrepriseId) return res.status(400).json({ message: "Entreprise non trouvée pour l'utilisateur connecté." });
    // Récupère les liens utilisateurs-entreprise avec les infos utilisateur et entreprise
    const links = await prisma.utilisateurEntreprise.findMany({
      where: { entrepriseId: entrepriseId },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            poste: true,
            role: true
          }
        },
        entreprise: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });
    // Formate la réponse pour chaque employé
    const users = links.map(link => ({
      ...link.utilisateur,
      entreprise: link.entreprise
    }));
    res.json(users);
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ message: "Erreur récupération utilisateur", error });
  }
};
