const router = require('express').Router()
const utilisateurController = require('../controllers/utilisateur.controller');
const { verifyToken } = require('../middlewares/auth.middleware')

// Création utilisateur
router.post('/', verifyToken, utilisateurController.createUtilisateur)
// Récupérer tous les utilisateurs
router.get('/', verifyToken, utilisateurController.getAllUsers)
// Récupérer un utilisateur par id
router.get('/:id', verifyToken, utilisateurController.getUserById)
// Modifier un utilisateur
router.put('/:id', verifyToken, utilisateurController.updateUtilisateur)
// Supprimer un utilisateur
router.delete('/:id', verifyToken, utilisateurController.deleteUtilisateur)
// Modifier le rôle d'un utilisateur
router.patch('/role/:userId', verifyToken, utilisateurController.modifierRole)
// Modifier le planning d'un utilisateur
router.patch('/planning/:userId', verifyToken, utilisateurController.modifierPlanning)
// Récupérer tous les employés d'une entreprise
router.get('/entreprise', verifyToken, utilisateurController.getUsersByEntreprise)

module.exports = router
