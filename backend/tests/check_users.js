require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const prisma = require('../lib/prisma');

prisma.users.findMany({ take: 5 })
  .then((users) => {
    console.log('Users:', users);
  })
  .catch((err) => {
    console.error('Error:', err.message);
  })
  .finally(() => prisma.$disconnect());