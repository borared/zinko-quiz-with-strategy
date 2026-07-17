const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const q = await prisma.quizzes.findMany({take:5});
  console.log(q.map(x => x.created_at));
}
run().finally(()=>prisma.$disconnect());
