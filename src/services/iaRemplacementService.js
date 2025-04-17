// services/iaRemplacementService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { updatePlanningWithReplacement } = require('./planningService');

/**
 * Fonction principale de remplacement intelligent + mise à jour planning
 */
async function gererRemplacementAutomatique(absenceId) {
  const absence = await prisma.absence.findUnique({
    where: { id: absenceId },
    include: {
      employe: true,
    },
  });

  if (!absence) throw new Error("Absence non trouvée");

  const jourAbsence = new Date(absence.date).getDay();

  // Cherche les employés disponibles ce jour et cette plage horaire
  const candidats = await prisma.employe.findMany({
    where: {
      id: { not: absence.employeId },
      disponibilites: {
        some: {
          jour: jourAbsence,
          heureDebut: { lte: absence.heureDebut },
          heureFin: { gte: absence.heureFin },
        },
      },
      absences: {
        none: {
          date: absence.date,
        },
      },
    },
    include: {
      planning: true,
    },
  });

  // Filtrage par législation : 4 demi-journées admin, 6 de visites max par semaine
  const candidatsCompatibles = [];
  for (const c of candidats) {
    const semaineActuelle = getSemaineDe(absence.date);
    const planningsSemaine = c.planning.filter((p) => getSemaineDe(p.date) === semaineActuelle);

    const adminCount = planningsSemaine.filter((p) => p.type === 'administratif').length;
    const visiteCount = planningsSemaine.filter((p) => p.type === 'visite').length;

    // Imaginons que l'absence à remplacer est de type "visite"
    if (visiteCount < 6) {
      candidatsCompatibles.push({
        ...c,
        chargeVisite: visiteCount,
        chargeAdmin: adminCount,
      });
    }
  }

  if (candidatsCompatibles.length === 0) {
    throw new Error("Aucun remplaçant disponible et conforme aux contraintes");
  }

  // On prend celui qui a le moins de charge pour équilibrer
  const remplaçant = candidatsCompatibles.sort((a, b) => a.chargeVisite - b.chargeVisite)[0];

  // Mise à jour du planning automatiquement
  const nouveauCreneau = await updatePlanningWithReplacement(absenceId, remplaçant.id);

  return {
    remplaçant,
    nouveauCreneau,
  };
}

function getSemaineDe(dateStr) {
  const date = new Date(dateStr);
  const premierJour = new Date(date.setDate(date.getDate() - date.getDay()));
  return `${premierJour.getFullYear()}-S${Math.ceil((date.getDate() + 6 - date.getDay()) / 7)}`;
}

module.exports = { gererRemplacementAutomatique };
