const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middlewares/auth.middleware');

// Récupérer toutes les tâches de l'utilisateur connecté
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({ where: { userId: req.user.id } });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Ajouter une tâche
router.post('/', verifyToken, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Le titre est requis.' });
  try {
    const task = await prisma.task.create({
      data: { title, userId: req.user.id }
    });
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Modifier une tâche
router.put('/:id', verifyToken, async (req, res) => {
  const { title, completed } = req.body;
  try {
    const task = await prisma.task.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!task) return res.sendStatus(404);
    const updated = await prisma.task.update({
      where: { id: task.id },
      data: { title: title ?? task.title, completed: completed ?? task.completed }
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Supprimer une tâche
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const task = await prisma.task.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!task) return res.sendStatus(404);
    await prisma.task.delete({ where: { id: task.id } });
    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
