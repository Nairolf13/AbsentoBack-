const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { proposerRemplacant } = require('../services/remplacementService');
const { updatePlanningWithReplacement } = require('../services/planningService');
const path = require('path');
const { sendEmail } = require('../utils/mailer');
const { sendNotificationToUser } = require('../services/websocket');
const { getIo } = require('../utils/socket');

exports.declarerAbsenceEtGenererRemplacement = async (req, res) => {
  let { employeeId, dateDebut, heureDebut, dateFin, heureFin, type, motif } = req.body;
  try {
    if (!employeeId) {
      if (req.user && req.user.id) {
        employeeId = req.user.id;
      } else {
        return res.status(400).json({ message: 'employeeId manquant.' });
      }
    }
    if (!dateDebut || !dateFin || !type) {
      return res.status(400).json({ message: 'Champs obligatoires manquants.', body: req.body });
    }
    let heureDebutValue = heureDebut || '08:00';
    let heureFinValue = heureFin || '17:00';
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const startDate = new Date(`${dateDebut}T${heureDebutValue}`);
    const endDate = new Date(`${dateFin}T${heureFinValue}`);
    if (startDate < today) {
      return res.status(400).json({ message: "Impossible de déclarer une absence dans le passé." });
    }
    let justification = undefined;
    if (req.file) {
      justification = `/uploads/${req.file.filename}`;
    }
    const absence = await prisma.absence.create({
      data: {
        employeeId,
        type,
        reason: motif || undefined,
        status: 'En attente',
        startDate,
        endDate,
        justification, 
      },
    });

    const planningEntries = [];
    let currentDay = new Date(startDate);
    currentDay.setHours(0, 0, 0, 0);
    const lastDay = new Date(endDate);
    lastDay.setHours(0, 0, 0, 0);
    while (currentDay <= lastDay) {
      let startHour, endHour;
      if (currentDay.getTime() === new Date(startDate).setHours(0,0,0,0)) {
        startHour = startDate.getHours();
        endHour = (currentDay.getTime() === new Date(endDate).setHours(0,0,0,0)) ? endDate.getHours() : 17;
      } else if (currentDay.getTime() === new Date(endDate).setHours(0,0,0,0)) {
        startHour = 8;
        endHour = endDate.getHours();
      } else {
        startHour = 8;
        endHour = 17;
      }
      for (let h = startHour; h <= endHour; h++) {
        let slotDate = new Date(currentDay);
        slotDate.setHours(h, 0, 0, 0);
        planningEntries.push({ employeeId, date: slotDate, label: type, absenceId: absence.id });
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }

    await prisma.planning.deleteMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate
        },
        absenceId: { not: null }
      }
    });

    for (const entry of planningEntries) {
      const hour = entry.date.getHours();
      await prisma.planning.create({
        data: {
          employeeId: entry.employeeId,
          date: entry.date,
          label: entry.label,
          absenceId: entry.absenceId,
          moment: hour < 12 ? "AM" : "PM"
        }
      });
    }

    const declarant = await prisma.utilisateur.findUnique({ where: { id: employeeId } });
    const declarantPrenom = declarant?.prenom || '(prénom inconnu)';
    const declarantNom = declarant?.nom || '(nom inconnu)';

    const formatDate = (d) => {
      const date = new Date(d);
      return date.toLocaleDateString('fr-FR');
    };
    const duree = (() => {
      const d1 = new Date(`${dateDebut}T${heureDebutValue}`);
      const d2 = new Date(`${dateFin}T${heureFinValue}`);
      const diff = Math.abs(d2 - d1);
      const heures = diff / (1000 * 60 * 60);
      if (heures <= 5) return 'Demi-journée';
      if (heures < 24) return `${Math.round(heures)}h`;
      const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return jours > 1 ? `${jours} jours` : `1 jour`;
    })();
    const adminMessage = `Nouvelle absence déclarée\nEmployé : ${declarantPrenom} ${declarantNom}\nType : ${type}${motif ? `\nMotif : ${motif}` : ''}\nDurée : ${duree}\nDu ${formatDate(startDate)} à ${heureDebutValue} au ${formatDate(endDate)} à ${heureFinValue}`;
    const destinataires = await prisma.utilisateur.findMany({
      where: {
        role: { in: ['ADMIN', 'RH', 'MANAGER'] },
        entreprises: { some: { entrepriseId: req.user.entrepriseId } }
      }
    });
    for (const destinataire of destinataires) {
      sendNotificationToUser(destinataire.id.toString(), adminMessage);
      getIo().to(`user_${destinataire.id}`).emit('notification', {
        message: adminMessage,
        date: new Date(),
      });
      await prisma.notification.create({
        data: {
          userId: destinataire.id,
          message: adminMessage,
          date: new Date(),
          lu: false
        }
      });
    }
    getIo().emit('absence:created', {
      absence,
      employeeId,
      startDate,
      endDate,
      type,
      motif,
      status: 'En attente'
    });
    res.status(200).json({ message: "Absence enregistrée." });
  } catch (error) {
    console.error("Erreur dans le traitement de l’absence :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la déclaration de l'absence." });
  }
};

exports.declareAbsence = async (req, res) => {
  const { type, reason, startDate, endDate } = req.body;
  const userId = req.user.id;

  try {
    const absence = await prisma.absence.create({
      data: {
        type,
        reason,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        employeeId: userId
      }
    });

    res.status(201).json(absence);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la déclaration.' });
  }
};

exports.uploadJustificatif = async (req, res) => {
  const absenceId = req.params.absenceId;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!filePath) return res.status(400).json({ error: "Fichier manquant." });

  try {
    const updated = await prisma.absence.update({
      where: { id: absenceId },
      data: { justification: filePath },
    });

    res.json({ message: "Justificatif ajouté.", updated });
  } catch (err) {
    res.status(500).json({ error: "Erreur d'envoi du justificatif." });
  }
};

exports.getMyAbsences = async (req, res) => {
  try {
    const absences = await prisma.absence.findMany({
      where: { employeeId: req.user.id },
      orderBy: { startDate: 'desc' },
      include: {
        employee: true,
        remplacement: {
          include: {
            remplacant: true,
            remplace: true
          }
        }
      }
    });
    const absencesWithJustifUrl = absences.map(abs => ({
      ...abs,
      justificatifUrl: abs.justification ? `${req.protocol}://${req.get('host')}${abs.justification}` : null
    }));
    res.json(absencesWithJustifUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des absences' });
  }
};

exports.getAllAbsences = async (req, res) => {
  try {
    const entrepriseId = req.user.entrepriseId;
    if (!entrepriseId) {
      return res.status(400).json({ error: "Entreprise non trouvée pour l'utilisateur connecté." });
    }
    const liens = await prisma.utilisateurEntreprise.findMany({
      where: { entrepriseId }
    });
    const employeIds = liens.map(lien => lien.utilisateurId);

    const absences = await prisma.absence.findMany({
      where: { employeeId: { in: employeIds } },
      orderBy: { startDate: 'desc' },
      include: {
        employee: true,
        remplacement: {
          include: {
            remplacant: true,
            remplace: true
          }
        }
      }
    });
    const absencesWithJustifUrl = absences.map(abs => ({
      ...abs,
      justificatifUrl: abs.justification ? `${req.protocol}://${req.get('host')}${abs.justification}` : null
    }));
    res.json(absencesWithJustifUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de toutes les absences' });
  }
};

exports.validerAbsence = async (req, res) => {
  const { absenceId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Statut manquant (middleware)." });
  }

  try {
    const updated = await prisma.absence.update({
      where: { id: Number(absenceId) },
      data: { status },
      include: { employee: true }
    });

    let remplacant = null;
    if (status === "Validée") {
      remplacant = await proposerRemplacant(updated);
    }

    getIo().emit('absence:updated', {
      absence: updated,
      absenceId: updated.id,
      employeeId: updated.employeeId,
      startDate: updated.startDate,
      endDate: updated.endDate,
      type: updated.type,
      motif: updated.reason,
      status: updated.status
    });

    res.json({ message: "Statut mis à jour.", absence: updated, remplacant });
  } catch (err) {
    console.error('Erreur lors de la validation de l\'absence:', err);
    res.status(500).json({ error: "Erreur de validation." });
  }
};

exports.ajouterJustificatif = async (req, res) => {
  const { absenceId } = req.params;
  const { fichier } = req.body; 

  try {
    const updated = await prisma.absence.update({
      where: { id: absenceId },
      data: { justificatif: fichier }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Erreur ajout justificatif." });
  }
};

exports.getMyRemplacements = async (req, res) => {
  try {
    const userId = req.user.id;
    const remplacements = await prisma.remplacement.findMany({
      where: { remplacantId: userId },
      include: { absence: true }
    });
    res.json(remplacements);
  } catch (error) {
    console.error('Erreur getMyRemplacements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des remplacements.' });
  }
};

exports.getAbsencesSansRemplacant = async (req, res) => {
  try {
    const absences = await prisma.absence.findMany({
      where: {
        OR: [
          { remplacement: null },
          { remplacement: { status: { not: 'Validé' } } }
        ]
      },
      include: {
        employee: true, 
        remplacement: true,
      },
      orderBy: { startDate: 'desc' }
    });
    res.json(absences);
  } catch (err) {
    console.error('Erreur getAbsencesSansRemplacant:', err);
    res.status(500).json({ error: 'Erreur récupération absences sans remplaçant', details: err.message });
  }
};

exports.validerRemplacement = async (req, res) => {
  res.status(200).json({ message: "Remplacement validé (exemple)." });
};

exports.refuserRemplacement = async (req, res) => {
  res.status(200).json({ message: "Remplacement refusé (exemple)." });
};

exports.deleteAbsence = async (req, res) => {
  try {
    const { absenceId } = req.params;
    await prisma.planning.deleteMany({ where: { absenceId: Number(absenceId) } });
    const absence = await prisma.absence.delete({ where: { id: Number(absenceId) } });
    if (getIo) {
      getIo().emit('absence:deleted', { absenceId: Number(absenceId) });
    }
    res.status(200).json({ success: true, absence });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};