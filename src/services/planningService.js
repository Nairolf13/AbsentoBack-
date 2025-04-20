// services/planningService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Met à jour automatiquement le planning après un remplacement.
 */

async function updatePlanningWithReplacement(absenceId, remplaçant) {
  try {
    console.log('updatePlanningWithReplacement absenceId:', absenceId, typeof absenceId);
    const absence = await prisma.absence.findUnique({
      where: { id: absenceId },
    });

    if (!absence) {
      throw new Error('Absence introuvable');
    }

    // Supposons que le planning contient les demi-journées en AM/PM
    const jours = [
      { date: absence.startDate, moment: 'AM' },
      { date: absence.startDate, moment: 'PM' },
      { date: absence.endDate, moment: 'AM' },
      { date: absence.endDate, moment: 'PM' },
    ];

    const updates = [];

    for (const jour of jours) {
      const update = await prisma.planning.upsert({
        where: {
          employeeId_date: {
            employeeId: Number(remplaçant.id),
            date: jour.date,
          }
        },
        update: {
          moment: jour.moment,
          replaceEmployeeId: absence.employeeId,
          absenceId: absence.id,
        },
        create: {
          date: jour.date,
          moment: jour.moment,
          employeeId: Number(remplaçant.id),
          replaceEmployeeId: absence.employeeId,
          absenceId: absence.id,
        }
      });
      updates.push(update);
    }

    return updates;
  } catch (err) {
    console.error('Erreur updatePlanningWithReplacement:', err);
    throw err;
  }
}

module.exports = {
  updatePlanningWithReplacement,
};
