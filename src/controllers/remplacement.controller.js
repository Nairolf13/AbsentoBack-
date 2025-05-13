const { updatePlanningWithReplacement } = require('../services/planningService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function validerRemplacement(req, res) {
  try {
    const { absenceId, remplaçantId, remplacantId } = req.body;
    const idRemplacant = remplaçantId ?? remplacantId;

    const planning = await updatePlanningWithReplacement(absenceId, { id: Number(idRemplacant) });

    const remplacant = await prisma.utilisateur.findUnique({ where: { id: parseInt(idRemplacant, 10) } });
    const absence = await prisma.absence.findUnique({
      where: { id: absenceId },
      include: { employee: true }
    });

    await prisma.remplacement.upsert({
      where: { absenceId: parseInt(absenceId, 10) },
      update: {
        remplacantId: parseInt(idRemplacant, 10),
        status: "En cours",
      },
      create: {
        absenceId: parseInt(absenceId, 10),
        remplacantId: parseInt(idRemplacant, 10),
        remplaceId: typeof absence.employeeId === 'string' ? parseInt(absence.employeeId, 10) : absence.employeeId, 
        status: "En cours",
      }
    });

    if (remplacant && remplacant.email) {
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

    if (remplacant && absence && absence.employee) {
      const message = `Votre absence du ${absence.startDate.toLocaleDateString()} au ${absence.endDate.toLocaleDateString()} sera remplacée par ${remplacant.prenom} ${remplacant.nom}.`;
      await prisma.notification.create({
        data: {
          userId: absence.employee.id,
          message,
          date: new Date(),
          lu: false
        }
      });
      try {
        const { sendNotificationToUser } = require('../services/websocket');
        sendNotificationToUser(absence.employee.id.toString(), message);
      } catch (e) { /* ignore ws error */ }
    }

    if (absence && absence.employee && absence.employee.id) {
      let entrepriseId = null;
      const lien = await prisma.utilisateurEntreprise.findFirst({ where: { utilisateurId: absence.employee.id } });
      if (lien && lien.entrepriseId) {
        entrepriseId = lien.entrepriseId;
      }
      if (entrepriseId) {
        const responsables = await prisma.utilisateur.findMany({
          where: {
            role: { in: ['ADMIN', 'RH', 'MANAGER'] },
            entreprises: { some: { entrepriseId: entrepriseId } },
            id: { notIn: [absence.employee.id, remplacant.id] } 
          }
        });
        const notifMessage = `Remplacement validé : ${remplacant.prenom} ${remplacant.nom} remplacera ${absence.employee.prenom} ${absence.employee.nom} du ${absence.startDate.toLocaleDateString()} au ${absence.endDate.toLocaleDateString()}`;
        for (const responsable of responsables) {
          try {
            require('../services/websocket').sendNotificationToUser(responsable.id.toString(), notifMessage);
          } catch (e) { /* ignore ws error */ }
          await prisma.notification.create({
            data: {
              userId: responsable.id,
              message: notifMessage,
              date: new Date(),
              lu: false
            }
          });
        }
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

async function getRemplacantsPossibles(req, res) {
  try {
    const { poste, absentId } = req.query;
    const entrepriseId = req.user.entrepriseId;
    if (!poste) return res.status(400).json({ error: 'poste requis' });
    if (!entrepriseId) return res.status(400).json({ error: "Entreprise requise" });

    const liens = await prisma.utilisateurEntreprise.findMany({
      where: { entrepriseId: entrepriseId },
    });
    const userIds = liens.map(lien => lien.utilisateurId);

    const candidats = await prisma.utilisateur.findMany({
      where: {
        id: { in: userIds, not: parseInt(absentId, 10) },
        poste: { equals: poste },
      },
      select: {
        id: true, nom: true, prenom: true, email: true, telephone: true, role: true
      }
    });
    res.json(candidats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la recherche des remplaçants' });
  }
}

module.exports = { validerRemplacement, getRemplacantsPossibles };
