require('dotenv').config();
const prisma = require('./lib/prisma');

async function testConnection() {
  try {
    const questions = await prisma.questions.findMany({ take: 1 });
    console.log('✅ Prisma connected to Supabase Postgres');
    console.log(`   Sample rows fetched: ${questions.length}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();