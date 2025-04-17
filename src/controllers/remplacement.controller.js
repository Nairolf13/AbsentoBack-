// controllers/remplacementController.js
const { updatePlanningWithReplacement } = require('../services/planningService');

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

module.exports = { validerRemplacement };
