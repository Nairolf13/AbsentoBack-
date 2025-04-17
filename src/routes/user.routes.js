const router = require('express').Router()
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware')

// Création utilisateur
router.post('/', verifyToken, userController.createUser)
// Récupérer tous les utilisateurs
router.get('/', verifyToken, userController.getAllUsers)
// Récupérer un utilisateur par id
router.get('/:id', verifyToken, userController.getUserById)
// Modifier un utilisateur
router.put('/:id', verifyToken, userController.updateUser)
// Supprimer un utilisateur
router.delete('/:id', verifyToken, userController.deleteUser)
// Modifier le rôle d'un utilisateur
router.patch('/role/:userId', verifyToken, userController.modifierRole)
// Modifier le planning d'un utilisateur
router.patch('/planning/:userId', verifyToken, userController.modifierPlanning)

module.exports = router
