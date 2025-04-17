// routes/remplacementRoutes.js
const express = require('express');
const router = express.Router();
const { validerRemplacement } = require('../controllers/remplacement.controller');

router.post('/remplacement/valider', validerRemplacement);

module.exports = router;
