const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Créer un utilisateur
exports.createUser = async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body })
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Erreur création utilisateur', error })
  }
}

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération utilisateurs', error });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur récupération utilisateur', error });
  }
};

// Modifier un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur modification utilisateur', error });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression utilisateur', error });
  }
};

// Modifier le rôle d'un utilisateur
exports.modifierRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
  
    const rolesAutorises = ["Employé", "Manager", "RH", "Admin"];
    if (!rolesAutorises.includes(role)) {
      return res.status(400).json({ error: "Rôle invalide." });
    }
  
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role }
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour du rôle." });
    }
};

// Modifier le planning d'un utilisateur
exports.modifierPlanning = async (req, res) => {
    const { userId } = req.params;
    const { joursTravailles, horaires } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { joursTravailles, horaires }
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour du planning." });
    }
};
