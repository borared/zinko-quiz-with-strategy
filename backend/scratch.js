require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const race = await prisma.picture_races.create({
    data: {
      title: "Test Race",
      creator_id: "user_3Dll7BOwNV27P7ixW43He61saMZ",
      questions: {
        create: [
          {
            image_url: "https://example.com/image.png",
            answer: "Test Answer",
            order_index: 0
          }
        ]
      }
    },
    include: { questions: true }
  });
  console.log("Created race:", JSON.stringify(race, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
