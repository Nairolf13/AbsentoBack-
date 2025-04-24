const router = require('express').Router();
const passwordController = require('../controllers/password.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/invite', verifyToken, passwordController.inviteUser); 
router.post('/set-password', passwordController.setPassword); 

module.exports = router;
