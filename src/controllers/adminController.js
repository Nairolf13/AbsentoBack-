const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

exports.getAllAbsences = async (req, res) => {
  try {
    const absences = await prisma.absence.findMany({ include: { employe: true } });
    res.json(absences);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération absences' });
  }
};

exports.getAllEmployes = async (req, res) => {
  try {
    // Récupérer l'entreprise de l'utilisateur connecté
    const entrepriseId = req.user?.entrepriseId;
    if (!entrepriseId) {
      return res.status(400).json({ error: "Entreprise non trouvée pour l'utilisateur connecté." });
    }
    // Récupérer les liens utilisateur-entreprise
    const liens = await prisma.utilisateurEntreprise.findMany({
      where: { entrepriseId: entrepriseId }
    });
    const userIds = liens.map(lien => lien.utilisateurId);
    let employes = [];
    if (userIds.length > 0) {
      employes = await prisma.utilisateur.findMany({
        where: {
          id: { in: userIds },
          role: 'EMPLOYE'
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          poste: true,
          role: true
        }
      });
    }
    res.json(employes);
  } catch (err) {
    console.error('Erreur récupération employés:', err);
    res.status(500).json({ error: 'Erreur récupération employés' });
  }
};

exports.getFullPlanning = async (req, res) => {
  try {
    const planning = await prisma.planning.findMany({ include: { employe: true } });
    res.json(planning);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération planning' });
  }
};

exports.getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await prisma.notification.findMany({ where: { userId: Number(userId) } });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération notifications' });
  }
};

exports.createOrUpdatePlanning = async (req, res) => {
  const { employeId, date, demiJournee, type } = req.body;
  try {
    const [planning, created] = await prisma.planning.upsert({ where: { employeId, date }, update: { demiJournee, type }, create: { employeId, date, demiJournee, type } });
    res.json({ success: true, created });
  } catch (err) {
    res.status(500).json({ error: 'Erreur mise à jour planning' });
  }
};

exports.createOrUpdateEmploye = async (req, res) => {
  const { id, nom, prenom, email, password, telephone, dateNaissance, adresse, poste, role, disponibilites, entrepriseId } = req.body;
  try {
    let utilisateur;
    // Validation des champs obligatoires pour la création
    if (!id) {
      if (!nom || !prenom || !email || !password || !telephone || !dateNaissance || !adresse || !poste) {
        return res.status(400).json({ error: 'Champs obligatoires manquants pour la création.' });
      }
    }
    if (id) {
      // Mise à jour d'un utilisateur existant
      const data = { nom, prenom, email, telephone, dateNaissance, adresse, poste, role };
      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }
      // Nettoyer les champs undefined
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
      // Vérifier que l'id est bien un entier
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "L'identifiant utilisateur (id) doit être un entier." });
      }
      // S'assurer que dateNaissance est bien un objet Date si fourni
      if (data.dateNaissance) {
        data.dateNaissance = new Date(data.dateNaissance);
      }
      utilisateur = await prisma.utilisateur.update({ where: { id }, data });
    } else {
      // Création d'un nouvel utilisateur (employé)
      const hashedPassword = await bcrypt.hash(password, 10);
      utilisateur = await prisma.utilisateur.create({
        data: {
          nom,
          prenom,
          email,
          password: hashedPassword,
          telephone,
          dateNaissance: new Date(dateNaissance),
          adresse,
          poste,
          role: role || 'EMPLOYE',
          disponibilites: disponibilites
            ? {
              create: disponibilites.map(d => ({
                jour: d.jour,
                heureDebut: d.heureDebut,
                heureFin: d.heureFin,
              }))
            }
            : undefined,
        }
      });
      // Lier à l'entreprise si fourni
      if (entrepriseId) {
        await prisma.utilisateurEntreprise.create({
          data: {
            utilisateurId: utilisateur.id,
            entrepriseId: entrepriseId,
          }
        });
      }
    }
    res.status(201).json({ message: 'Employé créé/modifié', utilisateur });
  } catch (err) {
    console.error('Erreur création/modification employé:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur suppression notification' });
  }
};