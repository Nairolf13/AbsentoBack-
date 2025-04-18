const router = require('express').Router();
const passwordController = require('../controllers/password.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/invite', verifyToken, passwordController.inviteUser); // création + mail invitation
router.post('/set-password', passwordController.setPassword); // création du mot de passe

module.exports = router;
