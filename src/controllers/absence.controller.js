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
    let { employeeId, dateDebut, heureDebut, dateFin, heureFin, type, motif } = req.body;
    console.log('Avant fallback : employeeId =', employeeId, '| req.user =', req.user);
    try {
      // Correction : fallback sur l'utilisateur connecté si pas de employeeId fourni
      if (!employeeId) {
        if (req.user && req.user.id) {
          employeeId = req.user.id;
        } else {
          return res.status(400).json({ message: 'employeeId manquant.' });
        }
      }
      // DEBUG LOGS pour comprendre le bug
      console.log('[DEBUG] Champs reçus:', { dateDebut, heureDebut, dateFin, heureFin, type, motif });
      console.log('[DEBUG] Types:', {
        dateDebut: typeof dateDebut,
        heureDebut: typeof heureDebut,
        dateFin: typeof dateFin,
        heureFin: typeof heureFin,
        type: typeof type
      });
      if (!dateDebut || !dateFin || !type || !heureDebut || !heureFin) {
        console.log('[DEBUG] Condition !dateDebut:', !dateDebut);
        console.log('[DEBUG] Condition !heureDebut:', !heureDebut);
        console.log('[DEBUG] Condition !dateFin:', !dateFin);
        console.log('[DEBUG] Condition !heureFin:', !heureFin);
        console.log('[DEBUG] Condition !type:', !type);
        return res.status(400).json({ message: 'Champs obligatoires manquants.', body: req.body });
      }
      // Sécurité : empêcher la déclaration d'une absence dans le passé
      const today = new Date();
      today.setHours(0, 0, 0, 0); // On ne garde que la date
      const startDate = new Date(`${dateDebut}T${heureDebut}`);
      const endDate = new Date(`${dateFin}T${heureFin}`);
      if (startDate < today) {
        return res.status(400).json({ message: "Impossible de déclarer une absence dans le passé." });
      }
      // Gestion du justificatif lors de la déclaration
      let justification = undefined;
      if (req.file) {
        justification = `/uploads/${req.file.filename}`;
      }
      // Création de l'absence selon le schéma Prisma
      const absence = await prisma.absence.create({
        data: {
          employeeId,
          type,
          reason: motif || undefined,
          status: 'En attente',
          startDate,
          endDate,
          justification, // Ajout du justificatif si présent
        },
      });

      // Récupérer les infos du déclarant (celui qui a déclaré l'absence)
      const declarant = await prisma.utilisateur.findUnique({ where: { id: employeeId } });
      const declarantPrenom = declarant?.prenom || '(prénom inconnu)';
      const declarantNom = declarant?.nom || '(nom inconnu)';

      // Construction du message de notification pour les managers/admin/RH
      const formatDate = (d) => {
        const date = new Date(d);
        return date.toLocaleDateString('fr-FR');
      };
      const duree = (() => {
        const d1 = new Date(`${dateDebut}T${heureDebut}`);
        const d2 = new Date(`${dateFin}T${heureFin}`);
        const diff = Math.abs(d2 - d1);
        const heures = diff / (1000 * 60 * 60);
        if (heures <= 5) return 'Demi-journée';
        if (heures < 24) return `${Math.round(heures)}h`;
        const jours = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return jours > 1 ? `${jours} jours` : `1 jour`;
      })();
      const adminMessage = `Nouvelle absence déclarée\nEmployé : ${declarantPrenom} ${declarantNom}\nType : ${type}${motif ? `\nMotif : ${motif}` : ''}\nDurée : ${duree}\nDu ${formatDate(startDate)} à ${heureDebut} au ${formatDate(endDate)} à ${heureFin}`;
      // Notifier tous les managers, RH et admins à la déclaration d'absence
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
      // SUPPRESSION du remplacement automatique et des notifications associées
      // Ancien code supprimé : recherche de remplaçant, update planning, notification remplaçant, mails
      // Fin suppression
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
    const absences = await prisma.absence.findMany({
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

exports.getAbsencesSansRemplacant = async (req, res) => {
  try {
    // Nouvelle logique : on récupère toutes les absences qui n'ont pas de remplacement associé
    const absences = await prisma.absence.findMany({
      where: {
        remplacement: null,
      },
      include: {
        employee: true, // <-- le bon nom du champ relation
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