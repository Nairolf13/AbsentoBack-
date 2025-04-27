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
    const entrepriseId = req.user?.entrepriseId;
    if (!entrepriseId) {
      return res.status(400).json({ error: "Entreprise non trouvée pour l'utilisateur connecté." });
    }
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
    // Récupérer l'entreprise de l'utilisateur cible
    const lien = await prisma.utilisateurEntreprise.findFirst({ where: { utilisateurId: Number(userId) } });
    const entrepriseId = lien ? lien.entrepriseId : null;
    if (!entrepriseId) {
      return res.status(400).json({ error: "Entreprise non trouvée pour cet utilisateur." });
    }
    // Récupérer uniquement les notifications dont l'expéditeur ou la cible appartient à la même entreprise
    // (On suppose que les notifications sont liées à des actions dans l'entreprise)
    const usersEntreprise = await prisma.utilisateurEntreprise.findMany({
      where: { entrepriseId },
      select: { utilisateurId: true }
    });
    const idsEntreprise = usersEntreprise.map(u => u.utilisateurId);
    // On ne retourne que les notifications du user qui proviennent de cette entreprise
    const notifications = await prisma.notification.findMany({
      where: {
        userId: Number(userId),
        // Si tu veux filtrer aussi selon l'auteur, il faut ajouter un champ senderId dans la notif
        // senderId: { in: idsEntreprise }
      }
    });
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
    if (!id) {
      if (!nom || !prenom || !email || !password || !telephone || !dateNaissance || !adresse || !poste) {
        return res.status(400).json({ error: 'Champs obligatoires manquants pour la création.' });
      }
    }
    if (id) {
      const data = { nom, prenom, email, telephone, dateNaissance, adresse, poste, role };
      if (password) {
        data.password = await bcrypt.hash(password, 10);
      }
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "L'identifiant utilisateur (id) doit être un entier." });
      }
      if (data.dateNaissance) {
        data.dateNaissance = new Date(data.dateNaissance);
      }
      utilisateur = await prisma.utilisateur.update({ where: { id }, data });
    } else {
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

exports.markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notif = await prisma.notification.update({
      where: { id: Number(id) },
      data: { lu: true }
    });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du passage en lu' });
  }
};