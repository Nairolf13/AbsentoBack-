// controllers/remplacementController.js
const { updatePlanningWithReplacement } = require('../services/planningService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function validerRemplacement(req, res) {
  try {
    const { absenceId, remplaçantId } = req.body;

    const planning = await updatePlanningWithReplacement(absenceId, { id: remplaçantId });

    // Récupération des infos du remplaçant et de l'absent
    const remplacant = await prisma.utilisateur.findUnique({ where: { id: parseInt(remplaçantId, 10) } });
    const absence = await prisma.absence.findUnique({
      where: { id: absenceId },
      include: { employee: true }
    });

    // Met à jour ou crée le remplacement lié à l'absence
    await prisma.remplacement.upsert({
      where: { absenceId: parseInt(absenceId, 10) },
      update: {
        remplacantId: parseInt(remplaçantId, 10),
        status: "En cours",
      },
      create: {
        absenceId: parseInt(absenceId, 10),
        remplacantId: parseInt(remplaçantId, 10),
        remplaceId: typeof absence.employeeId === 'string' ? parseInt(absence.employeeId, 10) : absence.employeeId, 
        status: "En cours",
      }
    });

    // Notif et mail si remplaçant trouvé
    if (remplacant && remplacant.email) {
      // Notification en temps réel (WebSocket)
      try {
        require('../services/websocket').sendNotificationToUser(remplacant.id.toString(), `Vous avez été choisi pour remplacer ${absence && absence.employee ? absence.employee.prenom + ' ' + absence.employee.nom : 'un collègue'} du ${absence ? absence.startDate.toLocaleDateString() : ''} au ${absence ? absence.endDate.toLocaleDateString() : ''}`);
      } catch (e) {
        console.error('Erreur notification WebSocket', e);
      }
      // Email
      try {
        const { sendEmail } = require('../utils/mailer');
        await sendEmail(
          remplacant.email,
          "Vous avez été choisi comme remplaçant !",
          `<p>Bonjour ${remplacant.prenom} ${remplacant.nom},</p><p>Vous avez été désigné pour remplacer ${absence && absence.employee ? absence.employee.prenom + ' ' + absence.employee.nom : 'un collègue'} du ${absence ? absence.startDate.toLocaleDateString() : ''} au ${absence ? absence.endDate.toLocaleDateString() : ''}.</p><p>Merci de confirmer votre disponibilité auprès de votre responsable.</p><p>Cordialement,<br/>L'équipe Absento</p>`
        );
      } catch (e) {
        console.error('Erreur envoi mail remplaçant', e);
      }
    }

    res.status(200).json({
      message: 'Planning mis à jour avec succès',
      planning
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du planning' });
  }
}

// Ajoute une route pour obtenir les remplaçants possibles pour un poste donné (hors absent)
async function getRemplacantsPossibles(req, res) {
  try {
    const { poste, absentId } = req.query;
    if (!poste) return res.status(400).json({ error: 'poste requis' });
    const candidats = await prisma.utilisateur.findMany({
      where: {
        poste,
        id: { not: parseInt(absentId, 10) }
      },
      select: {
        id: true, nom: true, prenom: true, email: true, telephone: true
      }
    });
    res.json(candidats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la recherche des remplaçants' });
  }
}

module.exports = { validerRemplacement, getRemplacantsPossibles };
