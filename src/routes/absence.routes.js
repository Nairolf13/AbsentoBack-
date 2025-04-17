const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/uploads' });

const absenceController = require('../controllers/absence.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Log de test pour vérifier que le routeur absence est bien utilisé
router.use((req, res, next) => {
  console.log('Absence router hit:', req.method, req.originalUrl);
  next();
});

// Déclaration
router.post('/declarer', verifyToken, absenceController.declarerAbsenceEtGenererRemplacement);

// Upload justificatif
router.post('/justificatif/:absenceId', verifyToken, upload.single('justificatif'), absenceController.uploadJustificatif);

// Récupérer mes absences
router.get('/mes-absences', verifyToken, absenceController.getMyAbsences);

// Récupérer mes remplacements
router.get('/mes-remplacements', verifyToken, absenceController.getMyRemplacements);

// Récupérer toutes les absences (RH/admin)
router.get('/toutes', verifyToken, absenceController.getAllAbsences);

router.patch('/valider/:absenceId', verifyToken, (req, res, next) => {
  if (!req.body) req.body = {};
  req.body.status = "Validée";
  next();
}, absenceController.validerAbsence);

router.patch('/refuser/:absenceId', verifyToken, (req, res, next) => {
  if (!req.body) req.body = {};
  req.body.status = "Refusée";
  next();
}, absenceController.validerAbsence);

router.patch('/justificatif/:absenceId', verifyToken, absenceController.ajouterJustificatif);

// Validation/refus remplacement
// router.patch('/remplacement/:remplacementId/valider', verifyToken, absenceController.validerRemplacement);
// router.delete('/remplacement/:remplacementId/refuser', verifyToken, absenceController.refuserRemplacement);

module.exports = router;
