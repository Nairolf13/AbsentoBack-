const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middlewares/auth.middleware');
const { sendNotificationToUser } = require('../services/websocket');
const { validateBody } = require('../middlewares/validate.middleware');
const { taskCreateSchema } = require('../utils/validationSchemas');

router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({ where: { userId: req.user.id } });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.post('/', verifyToken, validateBody(taskCreateSchema), async (req, res) => {
  const { title, userId } = req.body;
  if (!title) return res.status(400).json({ error: 'Le titre est requis.' });
  try {
    let targetUserId = req.user.id;
    if (userId && userId !== '' && userId !== req.user.id && ['RH', 'MANAGER', 'RESPONSABLE', 'ADMIN'].includes(req.user.role)) {
      targetUserId = userId;
    }
    const task = await prisma.task.create({
      data: { title, userId: targetUserId, createdBy: req.user.id }
    });
    if (targetUserId != req.user.id) {
      await prisma.notification.create({
        data: {
          userId: Number(targetUserId),
          message: `Une nouvelle tâche vous a été assignée : "${title}"`,
          date: new Date(),
          lu: false
        }
      });
      try {
        sendNotificationToUser(String(targetUserId), `Une nouvelle tâche vous a été assignée : "${title}"`);
      } catch (e) { /* ignore ws error */ }
    }
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

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

router.get('/assigned-by-me', verifyToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        createdBy: req.user.id,
        NOT: { userId: req.user.id }
      },
      include: {
        user: { select: { id: true, nom: true, prenom: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
