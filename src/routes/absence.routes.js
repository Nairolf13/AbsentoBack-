const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = uuidv4();
    cb(null, name + ext);
  }
});
const upload = multer({ storage });

const absenceController = require('../controllers/absence.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const { absenceCreateSchema } = require('../utils/validationSchemas');

router.use((req, res, next) => {
  console.log('Absence router hit:', req.method, req.originalUrl);
  next();
});

router.post('/declarer', verifyToken, validateBody(absenceCreateSchema), upload.single('justificatif'), absenceController.declarerAbsenceEtGenererRemplacement);

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

router.delete('/:absenceId', verifyToken, absenceController.deleteAbsence);

module.exports = router;
