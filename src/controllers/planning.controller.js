const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getEmployeePlanning = async (req, res) => {
  const { employeeId } = req.params;
  const { from, to } = req.query;
  try {
    const where = {
      employeeId: parseInt(employeeId),
    };
    if (from && to) {
      where.date = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }
    const planning = await prisma.planning.findMany({
      where,
      orderBy: { date: 'asc' }
    });
    res.json(planning);
  } catch (e) {
    res.status(500).json({ error: 'Erreur récupération planning employé', details: e.message });
  }
};

exports.setEmployeePlanning = async (req, res) => {
  const slots = Array.isArray(req.body) ? req.body : [req.body];
  try {
    const results = [];
    for (const slot of slots) {
      const { employeeId, date, label, moment } = slot;
      const result = await prisma.planning.upsert({
        where: {
          employeeId_date: {
            employeeId: parseInt(employeeId),
            date: new Date(date)
          }
        },
        update: { label, moment },
        create: { employeeId: parseInt(employeeId), date: new Date(date), label, moment }
      });
      results.push(result);
    }
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: 'Erreur enregistrement planning', details: e.message });
  }
};

exports.deleteEmployeePlanning = async (req, res) => {
  const { employeeId, dates } = req.body;
  try {
    const deleted = await prisma.planning.deleteMany({
      where: {
        employeeId: parseInt(employeeId),
        date: {
          in: dates.map(d => new Date(d))
        }
      }
    });
    res.json({ deletedCount: deleted.count });
  } catch (e) {
    res.status(500).json({ error: 'Erreur suppression planning', details: e.message });
  }
};
