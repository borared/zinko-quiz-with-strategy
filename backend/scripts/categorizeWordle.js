const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  "Tech & Science",
  "Geography & History",
  "Arts & Culture",
  "General & Fun"
];

// Fisher-Yates shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function main() {
  console.log("Fetching all words from the database...");
  const allWords = await prisma.wordle_words.findMany({
    select: { id: true }
  });
  
  console.log(`Found ${allWords.length} words. Shuffling and distributing into categories...`);
  shuffle(allWords);
  
  // Split IDs into 4 equal chunks
  const chunkSize = Math.ceil(allWords.length / CATEGORIES.length);
  const categoryChunks = [];
  
  for (let i = 0; i < CATEGORIES.length; i++) {
    categoryChunks.push(allWords.slice(i * chunkSize, (i + 1) * chunkSize).map(w => w.id));
  }
  
  // Update each category using updateMany
  for (let i = 0; i < CATEGORIES.length; i++) {
    const categoryName = CATEGORIES[i];
    const ids = categoryChunks[i];
    
    if (ids.length > 0) {
      console.log(`Updating ${ids.length} words to category "${categoryName}"...`);
      await prisma.wordle_words.updateMany({
        where: { id: { in: ids } },
        data: { category: categoryName }
      });
    }
  }
  
  console.log("Categorization completed successfully!");
}

main()
  .catch(err => {
    console.error("Error during categorization:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
