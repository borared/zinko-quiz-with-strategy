require('dotenv').config();
const prisma = require('../lib/prisma');
const sceneryService = require('../services/sceneryService');

async function main() {
  const users = await prisma.users.findMany({
    select: { clerk_id: true, email: true },
  });

  console.log(`Found ${users.length} users`);

  for (const user of users) {
    try {
      const notification = await sceneryService.ensureWelcomeGifts(user.clerk_id);
      console.log(`${user.clerk_id} -> ${notification ? 'gift created' : 'skipped'}`);
    } catch (error) {
      console.error(`${user.clerk_id} -> ERROR: ${error.message}`);
    }
  }

  const gifts = await prisma.notifications.count({ where: { type: 'SCENERY_GIFT' } });
  console.log(`Total SCENERY_GIFT notifications: ${gifts}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });