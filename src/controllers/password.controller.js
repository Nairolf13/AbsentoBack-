const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendInvitationEmail } = require('../utils/mailer');

// Créer un ou plusieurs utilisateurs et envoyer le mail d'invitation
exports.inviteUser = async (req, res) => {
  try {
    let users = req.body;
    if (!Array.isArray(users)) {
      users = [users];
    }
    // Récupérer l'ID de l'utilisateur connecté (admin)
    const adminId = req.user.id;
    // Récupérer l'entreprise liée à cet admin
    const admin = await prisma.utilisateur.findUnique({
      where: { id: adminId },
      include: { entreprises: true }
    });
    const entrepriseId = admin.entreprises[0]?.entrepriseId;
    if (!entrepriseId) {
      return res.status(400).json({ message: "Impossible de déterminer l'entreprise de l'admin." });
    }
    const created = [];
    const ignored = [];
    const invalid = [];
    for (const u of users) {
      const { nom, prenom, email, telephone, dateNaissance, adresse, poste, role } = u;
      // Validation des champs requis et de la date
      if (!nom || !prenom || !email || !telephone || !dateNaissance || !adresse || !poste || !role) {
        invalid.push(email || "(email manquant)");
        continue;
      }
      const dateObj = new Date(dateNaissance);
      if (isNaN(dateObj.getTime())) {
        invalid.push(email || "(email manquant)");
        continue;
      }
      // Vérifier si l'utilisateur existe déjà
      const existing = await prisma.utilisateur.findUnique({ where: { email } });
      if (existing) {
        ignored.push(email);
        continue;
      }
      // Générer un mot de passe aléatoire sécurisé
      const randomPassword = crypto.randomBytes(16).toString('base64');
      // Hasher le mot de passe aléatoire
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      // Générer un token unique
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      const user = await prisma.utilisateur.create({
        data: {
          nom, prenom, email, telephone, dateNaissance: dateObj, adresse, poste, role,
          password: hashedPassword,
          passwordToken: token,
          passwordTokenExpires: expires
        }
      });
      // Création de la relation utilisateur-entreprise
      await prisma.utilisateurEntreprise.create({
        data: {
          utilisateurId: user.id,
          entrepriseId: entrepriseId,
        }
      });
      await sendInvitationEmail(user, token);
      created.push(email);
    }
    res.status(201).json({ message: "Invitation terminée.", created, ignored, invalid });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la création/invitation", error: e.message });
  }
};

// Définir le mot de passe via le lien reçu par mail
exports.setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await prisma.utilisateur.findFirst({
      where: {
        passwordToken: token,
        passwordTokenExpires: { gte: new Date() }
      }
    });
    if (!user) return res.status(400).json({ message: "Lien invalide ou expiré." });
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordToken: null,
        passwordTokenExpires: null
      }
    });
    res.json({ message: "Mot de passe créé avec succès." });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la création du mot de passe", error: e.message });
  }
};
