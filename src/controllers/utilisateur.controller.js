const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const csv = require('csv-parser');
const fs = require('fs');

exports.createUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, telephone, dateNaissance, adresse, poste, role, entrepriseId } = req.body;
    const hashed = await bcrypt.hash(motDePasse, 10);
    const utilisateur = await prisma.utilisateur.create({
      data: { nom, prenom, email, password: hashed, telephone, dateNaissance: new Date(dateNaissance), adresse, poste, role }
    });
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

exports.updateUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if ('id' in data) delete data.id;

    let nouvelleEntrepriseId = null;
    if ('entreprise' in data && data.entreprise && data.entreprise.id) {
      nouvelleEntrepriseId = data.entreprise.id;
      delete data.entreprise;
    }

    if (data.motDePasse) {
      data.password = await bcrypt.hash(data.motDePasse, 10);
      delete data.motDePasse;
    }
    if (data.dateNaissance) {
      data.dateNaissance = new Date(data.dateNaissance);
    }

    const utilisateur = await prisma.utilisateur.update({
      where: { id: parseInt(id) },
      data
    });

    if (nouvelleEntrepriseId) {
      await prisma.utilisateurEntreprise.deleteMany({
        where: { utilisateurId: parseInt(id) }
      });
      await prisma.utilisateurEntreprise.create({
        data: {
          utilisateurId: parseInt(id),
          entrepriseId: nouvelleEntrepriseId
        }
      });
    }

    res.json({ message: 'Utilisateur modifié', utilisateur });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.utilisateur.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

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

exports.importCSV = async (req, res) => {
  res.status(501).json({ error: 'Import CSV non implémenté ici' });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.utilisateur.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération utilisateurs', error });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.utilisateur.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération utilisateur', error });
  }
};

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

exports.getUsersByEntreprise = async (req, res) => {
  try {
    const entrepriseId = req.user.entrepriseId;
    if (!entrepriseId) return res.status(400).json({ message: "Entreprise non trouvée pour l'utilisateur connecté." });
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
            role: true,
            adresse: true,
            dateNaissance: true
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
