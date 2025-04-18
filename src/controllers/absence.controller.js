const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { proposerRemplacant } = require('../services/remplacementService');
const { updatePlanningWithReplacement } = require('../services/planningService');
const path = require('path');
const { sendEmail } = require('../utils/mailer');
const { sendNotificationToUser } = require('../services/websocket');
const { getIo } = require('../utils/socket');

exports.declarerAbsenceEtGenererRemplacement = async (req, res) => {
    console.log('BODY DECLARATION:', req.body);
    let { employeeId, date, heureDebut, heureFin, type, motif } = req.body;
    console.log('Avant fallback : employeeId =', employeeId, '| req.user =', req.user);
    try {
      // Correction : fallback sur l'utilisateur connecté si pas de employeeId fourni
      if (!employeeId && req.user && req.user.id) {
        employeeId = req.user.id;
      }
      console.log('Après fallback : employeeId =', employeeId);
      if (!employeeId || !date || !heureDebut || !heureFin || !type) {
        console.log('REQUETE INVALIDE, BODY RECU:', req.body);
        return res.status(400).json({ message: 'Champs obligatoires manquants.', body: req.body });
      }
      // Fusionne date et heure pour startDate et endDate
      const startDate = new Date(`${date}T${heureDebut}`);
      const endDate = new Date(`${date}T${heureFin}`);
      // Création de l'absence selon le schéma Prisma
      const absence = await prisma.absence.create({
        data: {
          employeeId,
          type,
          reason: motif || undefined,
          status: 'En attente',
          startDate,
          endDate,
        },
      });
      // Notifier tous les admins à la déclaration d'absence
      const admins = await prisma.utilisateur.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        sendNotificationToUser(admin.id.toString(), `Nouvelle absence déclarée par ${req.user.prenom} ${req.user.nom} le ${date}.`);
        getIo().to(`user_${admin.id}`).emit('notification', {
          message: `Nouvelle absence déclarée par ${req.user.prenom} ${req.user.nom} le ${date}.`,
          date: new Date(),
        });
        await prisma.notification.create({
          data: {
            userId: admin.id,
            message: `Nouvelle absence déclarée par ${req.user.prenom} ${req.user.nom} le ${date}.`,
            date: new Date(),
            lu: false
          }
        });
      }
      // 2. Recherche d'un remplaçant
      let remplacant = null;
      try {
        remplacant = await proposerRemplacant(absence);
      } catch (e) {
        console.log('Erreur lors de la recherche de remplaçant :', e.message);
      }
      if (!remplacant) {
        return res.status(200).json({ message: "Absence enregistrée, mais aucun remplaçant disponible pour cette période." });
      }
      // 3. Mise à jour automatique du planning
      await updatePlanningWithReplacement(absence.id, remplacant);
      // Notifier le remplaçant
      sendNotificationToUser(remplacant.id.toString(), `Vous avez été désigné comme remplaçant de ${req.user.prenom} ${req.user.nom} le ${date}.`);
      getIo().to(`user_${remplacant.id}`).emit('notification', {
        message: `Vous avez été désigné comme remplaçant de ${req.user.prenom} ${req.user.nom} le ${date}.`,
        date: new Date(),
      });
      await prisma.notification.create({
        data: {
          userId: remplacant.id,
          message: `Vous avez été désigné comme remplaçant de ${req.user.prenom} ${req.user.nom} le ${date}.`,
          date: new Date(),
          lu: false
        }
      });
      // Notifier l'employé absent
      const employeeAbsent = await prisma.utilisateur.findUnique({ where: { id: Number(employeeId) } });
      console.log('employeeAbsent:', employeeAbsent);
      sendNotificationToUser(employeeAbsent.id.toString(), `Votre absence du ${date} a été prise en compte et un remplaçant a été affecté.`);
      getIo().to(`user_${employeeAbsent.id}`).emit('notification', {
        message: `Votre absence du ${date} a été prise en compte et un remplaçant a été affecté.`,
        date: new Date(),
      });
      await prisma.notification.create({
        data: {
          userId: employeeAbsent.id,
          message: `Votre absence du ${date} a été prise en compte et un remplaçant a été affecté.`,
          date: new Date(),
          lu: false
        }
      });
      // Notifier tous les admins du remplacement
      const absentNom = employeeAbsent?.nom || '(nom inconnu)';
      const absentPrenom = employeeAbsent?.prenom || '(prénom inconnu)';
      for (const admin of admins) {
        sendNotificationToUser(admin.id.toString(), `${remplacant.prenom} ${remplacant.nom} a été affecté en remplacement de ${absentPrenom} ${absentNom} pour le ${date}.`);
        getIo().to(`user_${admin.id}`).emit('notification', {
          message: `${remplacant.prenom} ${remplacant.nom} a été affecté en remplacement de ${absentPrenom} ${absentNom} pour le ${date}.`,
          date: new Date(),
        });
        await prisma.notification.create({
          data: {
            userId: admin.id,
            message: `${remplacant.prenom} ${remplacant.nom} a été affecté en remplacement de ${absentPrenom} ${absentNom} pour le ${date}.`,
            date: new Date(),
            lu: false
          }
        });
      }
      // 4. Notifications automatiques
      const manager = await prisma.utilisateur.findFirst({ where: { role: 'ADMIN' } });
      await sendEmail(
        remplacant.email,
        'Nouveau remplacement à effectuer',
        `<p>Bonjour ${remplacant.prenom},<br>Vous avez été affecté en remplacement de ${employeeAbsent.prenom} le ${date} de ${heureDebut} à ${heureFin}.</p>`
      );
      await sendEmail(
        manager.email,
        'Un remplacement a été automatiquement affecté',
        `<p>Le système a automatiquement affecté ${remplacant.prenom} ${remplacant.nom} en remplacement de ${employeeAbsent.prenom} ${employeeAbsent.nom} pour le ${date}.</p>`
      );
      await sendEmail(
        employeeAbsent.email,
        'Votre absence a été prise en compte',
        `<p>Bonjour ${employeeAbsent.prenom},<br>Votre absence du ${date} a été enregistrée et un remplaçant a été affecté automatiquement.</p>`
      );
      res.status(200).json({ message: "Absence déclarée et remplaçant affecté.", remplacant });
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
        remplacement: {
          include: {
            remplacant: true
          }
        }
      }
    });
    // Ajout du statut de remplacement pour chaque absence
    const absencesWithRemplacementStatus = absences.map(a => {
      let remplacementStatus = "Aucun";
      if (a.remplacement) {
        remplacementStatus = a.remplacement.validé ? "Validé" : "En cours";
      }
      return {
        ...a,
        remplacementStatus,
        remplacant: a.remplacement ? a.remplacement.remplacant : null
      };
    });
    res.json(absencesWithRemplacementStatus);
  } catch (err) {
    res.status(500).json({ error: "Erreur de récupération." });
  }
};

exports.getAllAbsences = async (req, res) => {
  try {
    const absences = await prisma.absence.findMany({
      include: { employee: true },
      orderBy: { startDate: 'desc' }
    });
    res.json(absences);
  } catch (err) {
    res.status(500).json({ error: "Erreur de récupération." });
  }
};

exports.validerAbsence = async (req, res) => {
  const { absenceId } = req.params;
  const { status } = req.body;

  // On attend que le middleware ait défini status
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

    res.json({ message: "Statut mis à jour.", absence: updated, remplacant });
  } catch (err) {
    console.error('Erreur lors de la validation de l\'absence:', err);
    res.status(500).json({ error: "Erreur de validation." });
  }
};

exports.ajouterJustificatif = async (req, res) => {
    const { absenceId } = req.params;
    const { fichier } = req.body; // On suppose un URL ou nom de fichier pour l’instant
  
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
  console.log('getMyRemplacements called, user:', req.user);
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