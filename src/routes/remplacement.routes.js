// routes/remplacementRoutes.js
const express = require('express');
const router = express.Router();
const { validerRemplacement } = require('../controllers/remplacement.controller');
const { getRemplacantsPossibles } = require('../controllers/remplacement.controller');

router.post('/remplacement/valider', validerRemplacement);
router.get('/candidats', getRemplacantsPossibles);

module.exports = router;
