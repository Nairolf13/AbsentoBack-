const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.proposerRemplacant = async (absence) => {
  const { startDate, endDate, employeeId } = absence;

  const indispos = await prisma.absence.findMany({
    where: {
      OR: [
        { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } },
      ],
      status: "Validée"
    },
    select: { employeeId: true },
  });

  const indispoIds = indispos.map(i => i.employeeId);

  const disponibles = await prisma.utilisateur.findMany({
    where: {
      id: { not: employeeId, notIn: indispoIds },
    },
    take: 1
  });

  return disponibles[0] || null;
};
