const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  console.log('register req.body:', req.body);
  const { email, password, nom, prenom, rôle, telephone, dateNaissance, adresse, poste, entrepriseId } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.utilisateur.create({
    data: { email, password: hashed, nom, prenom, rôle, telephone, dateNaissance, adresse, poste },
  });
  // Lier l'utilisateur à l'entreprise si entrepriseId fourni
  if (entrepriseId) {
    await prisma.utilisateurEntreprise.create({
      data: {
        utilisateurId: user.id,
        entrepriseId: entrepriseId,
      }
    });
  }
  res.json({ message: 'Inscription réussie', user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  // On cherche l'utilisateur avec cet email
  const user = await prisma.utilisateur.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Utilisateur non trouvé pour cet email.' });
  }
  // Vérifie le mot de passe hashé
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  // Récupérer l'entrepriseId via la table de jointure
  const lien = await prisma.utilisateurEntreprise.findFirst({ where: { utilisateurId: user.id } });
  const entrepriseId = lien ? lien.entrepriseId : null;
  const token = jwt.sign({ id: user.id, role: user.role, entrepriseId }, process.env.JWT_SECRET);
  res.json({ token });
};

// Création d'une entreprise et du responsable (registerEntreprise)
exports.registerEntreprise = async (req, res) => {
  try {
    const { nom, siret, secteur, taille, adresse, telephone, emailContact, responsableNom, responsablePrenom, emailResponsable, motDePasse, dateNaissance } = req.body;
    // Vérifier si un emailResponsable existe déjà
    const existingEntreprise = await prisma.entreprise.findUnique({
      where: { emailResponsable }
    });
    if (existingEntreprise) {
      return res.status(400).json({ error: "Un responsable avec cet email existe déjà." });
    }
    // Création de l'entreprise
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
        motDePasse: await bcrypt.hash(motDePasse, 10),
      },
    });
    // Création du responsable comme premier utilisateur
    const responsable = await prisma.utilisateur.create({
      data: {
        nom: responsableNom,
        prenom: responsablePrenom,
        email: emailResponsable,
        password: await bcrypt.hash(motDePasse, 10),
        telephone,
        dateNaissance: new Date(dateNaissance),
        adresse,
        poste: 'RESPONSABLE',
        role: 'ADMIN',
      },
    });
    // Lier le responsable à l'entreprise via la table de jointure
    await prisma.utilisateurEntreprise.create({
      data: {
        utilisateurId: responsable.id,
        entrepriseId: entreprise.id,
      }
    });
    res.json({ message: "Entreprise et responsable créés", entreprise, responsable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création de l'entreprise" });
  }
};

// Création d'un utilisateur par une entreprise (registerUser)
exports.registerUser = async (req, res) => {
  try {
    // On suppose que l'admin est connecté et son entrepriseId est dans le token (à adapter selon ton auth)
    const { nom, prenom, email, password, telephone, dateNaissance, adresse, poste, role } = req.body;
    const entrepriseId = req.user.entrepriseId; // À adapter selon ton système d'authentification
    const user = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        password: await bcrypt.hash(password, 10),
        telephone,
        dateNaissance: new Date(dateNaissance),
        adresse,
        poste,
        role: role || 'EMPLOYE',
        entrepriseId,
      },
    });
    res.json({ message: "Utilisateur créé", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
  }
};
