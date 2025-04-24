const router = require('express').Router()
const utilisateurController = require('../controllers/utilisateur.controller');
const { verifyToken } = require('../middlewares/auth.middleware')

router.post('/', verifyToken, utilisateurController.createUtilisateur)
router.get('/', verifyToken, utilisateurController.getAllUsers)
router.get('/:id', verifyToken, utilisateurController.getUserById)
router.put('/:id', verifyToken, utilisateurController.updateUtilisateur)
router.delete('/:id', verifyToken, utilisateurController.deleteUtilisateur)
router.patch('/role/:userId', verifyToken, utilisateurController.modifierRole)
router.patch('/planning/:userId', verifyToken, utilisateurController.modifierPlanning)
router.get('/entreprise', verifyToken, utilisateurController.getUsersByEntreprise)

module.exports = router
