const { Absence, Employe, Planning, Notification } = require('../models');

exports.getAllAbsences = async (req, res) => {
  try {
    const absences = await Absence.findAll({ include: Employe });
    res.json(absences);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération absences' });
  }
};

exports.getAllEmployes = async (req, res) => {
  try {
    const employes = await Employe.findAll();
    res.json(employes);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération employés' });
  }
};

exports.getFullPlanning = async (req, res) => {
  try {
    const planning = await Planning.findAll({ include: Employe });
    res.json(planning);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération planning' });
  }
};

exports.getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.findAll({ where: { userId } });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Erreur récupération notifications' });
  }
};

exports.createOrUpdatePlanning = async (req, res) => {
    const { employeId, date, demiJournee, type } = req.body;
    try {
      const [planning, created] = await Planning.upsert({ employeId, date, demiJournee, type });
      res.json({ success: true, created });
    } catch (err) {
      res.status(500).json({ error: 'Erreur mise à jour planning' });
    }
  };
  
  exports.createOrUpdateEmploye = async (req, res) => {
    const { id, nom, prenom, email, poste, disponibilites } = req.body;
    try {
      if (id) {
        await Employe.update({ nom, prenom, email, poste, disponibilites }, { where: { id } });
      } else {
        await Employe.create({ nom, prenom, email, poste, disponibilites });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erreur création/modification employé' });
    }
  };
  