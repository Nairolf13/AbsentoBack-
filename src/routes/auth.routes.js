const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/register-entreprise', authController.registerEntreprise);
router.post('/register-user', authController.registerUser);

module.exports = router;
