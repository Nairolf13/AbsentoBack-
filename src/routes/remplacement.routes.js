// routes/remplacementRoutes.js
const express = require('express');
const router = express.Router();
const { validerRemplacement } = require('../controllers/remplacement.controller');
const { getRemplacantsPossibles } = require('../controllers/remplacement.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/valider', verifyToken, validerRemplacement);
router.get('/candidats', verifyToken, getRemplacantsPossibles);

module.exports = router;
