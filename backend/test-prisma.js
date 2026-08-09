const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const races = await prisma.picture_races.findMany({
    include: { questions: true }
  });
  console.log(JSON.stringify(races, null, 2));
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
