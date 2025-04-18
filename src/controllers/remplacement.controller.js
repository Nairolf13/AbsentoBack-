// controllers/remplacementController.js
const { updatePlanningWithReplacement } = require('../services/planningService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function validerRemplacement(req, res) {
  try {
    const { absenceId, remplaçantId } = req.body;

    const planning = await updatePlanningWithReplacement(absenceId, remplaçantId);

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
        id: { not: Number(absentId) }
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
