const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

exports.registerEntreprise = async (req, res) => {
  try {
    const {
      nom,
      siret,
      secteur,
      taille,
      adresse,
      telephone,
      emailContact,
      responsableNom,
      responsablePrenom,
      emailResponsable,
      motDePasse
    } = req.body;

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const entreprise = await prisma.entreprise.create({
      data: {
        nom,
        siret,
        secteur,
        taille,
        adresse,
        telephone,
        emailContact,
        responsableNom,
        responsablePrenom,
        emailResponsable,
        motDePasse: hashedPassword
      }
    });
    res.status(201).json({ message: "Entreprise créée", entreprise });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateEntreprise = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.motDePasse) {
      data.motDePasse = await bcrypt.hash(data.motDePasse, 10);
    }
    const entreprise = await prisma.entreprise.update({ where: { id: Number(id) }, data });
    res.json({ message: "Entreprise modifiée", entreprise });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEntreprise = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.entreprise.delete({ where: { id } });
    res.json({ message: "Entreprise supprimée" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getEntreprise = async (req, res) => {
  try {
    const { id } = req.params;
    const entreprise = await prisma.entreprise.findUnique({ where: { id: Number(id) } });
    if (!entreprise) return res.status(404).json({ error: "Not found" });
    res.json(entreprise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};