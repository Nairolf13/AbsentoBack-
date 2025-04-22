const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'public/uploads' });

const absenceController = require('../controllers/absence.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use((req, res, next) => {
  console.log('Absence router hit:', req.method, req.originalUrl);
  next();
});

router.post('/declarer', verifyToken, upload.single('justificatif'), absenceController.declarerAbsenceEtGenererRemplacement);

router.post('/justificatif/:absenceId', verifyToken, upload.single('justificatif'), absenceController.uploadJustificatif);

router.get('/mes-absences', verifyToken, absenceController.getMyAbsences);

router.get('/mes-remplacements', verifyToken, absenceController.getMyRemplacements);

router.get('/toutes', verifyToken, absenceController.getAllAbsences);

router.get('/', verifyToken, absenceController.getAllAbsences);

router.get('/sans-remplacant', verifyToken, absenceController.getAbsencesSansRemplacant);

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

router.patch('/remplacement/:remplacementId/valider', verifyToken, absenceController.validerRemplacement);
router.delete('/remplacement/:remplacementId/refuser', verifyToken, absenceController.refuserRemplacement);

module.exports = router;
