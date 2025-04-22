const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middlewares/validate.middleware');
const { loginSchema, userRegisterSchema } = require('../utils/validationSchemas');

router.post('/register', validateBody(userRegisterSchema), authController.register);
// Connexion
router.post('/login', validateBody(loginSchema), authController.login);
// Déconnexion sécurisée (supprime le cookie)
router.post('/logout', authController.logout);
router.post('/register-entreprise', authController.registerEntreprise);
router.post('/register-user', authController.registerUser);

module.exports = router;
