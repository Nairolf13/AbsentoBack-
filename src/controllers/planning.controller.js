const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /planning/:employeeId?from=YYYY-MM-DD&to=YYYY-MM-DD
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

// POST /planning
// Body: [{ employeeId, date, label, moment }]
exports.setEmployeePlanning = async (req, res) => {
  console.log('BODY RECU:', req.body);
  const slots = Array.isArray(req.body) ? req.body : [req.body];
  try {
    const results = [];
    for (const slot of slots) {
      console.log('SLOT:', slot);
      const { employeeId, date, label, moment } = slot;
      // Upsert: si un créneau existe à cette date pour cet employé, on le met à jour, sinon on le crée
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
    console.log('RESULTS:', results);
  } catch (e) {
    console.error('[setEmployeePlanning] ERREUR:', e);
    res.status(500).json({ error: 'Erreur enregistrement planning', details: e.message });
  }
};

// DELETE /planning
// Body: { employeeId, dates: ["2025-04-20T08:00:00.000Z", ...] }
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
