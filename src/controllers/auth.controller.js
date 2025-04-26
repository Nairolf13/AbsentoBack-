const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  console.log('register req.body:', req.body);
  const { email, password, nom, prenom, rôle, telephone, dateNaissance, adresse, poste, entrepriseId } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.utilisateur.create({
    data: { email: normalizedEmail, password: hashed, nom, prenom, rôle, telephone, dateNaissance, adresse, poste },
  });
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
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.utilisateur.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return res.status(401).json({ error: 'Utilisateur non trouvé pour cet email.' });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  const lien = await prisma.utilisateurEntreprise.findFirst({ where: { utilisateurId: user.id } });
  const entrepriseId = lien ? lien.entrepriseId : null;
  const token = jwt.sign({ id: user.id, role: user.role, entrepriseId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, 
    sameSite: 'lax', 
    domain: undefined, 
    path: '/',
    maxAge: 3600000 
  });
  res.json({ success: true, token });
};

exports.logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ success: true });
};

exports.registerEntreprise = async (req, res) => {
  try {
    let { nom, siret, secteur, taille, adresse, telephone, emailContact, responsableNom, responsablePrenom, emailResponsable, motDePasse, dateNaissance } = req.body;
    emailContact = emailContact.trim().toLowerCase();
    emailResponsable = emailResponsable.trim().toLowerCase();
    const existingEntreprise = await prisma.entreprise.findUnique({
      where: { emailResponsable }
    });
    if (existingEntreprise) {
      return res.status(400).json({ error: "Un responsable avec cet email existe déjà." });
    }
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

exports.registerUser = async (req, res) => {
  try {
    const { nom, prenom, email, password, telephone, dateNaissance, adresse, poste, role } = req.body;
    const entrepriseId = req.user.entrepriseId; 
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email: normalizedEmail,
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
