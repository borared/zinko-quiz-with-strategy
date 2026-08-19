const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const https = require('https');

async function main() {
  console.log("Fetching dictionary from jsDelivr CDN...");
  
  https.get('https://cdn.jsdelivr.net/gh/dwyl/english-words@master/words_alpha.txt', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', async () => {
      try {
        console.log("Dictionary fetched. Processing words...");
        const allLines = data.split(/\r?\n/);
        const fiveLetterWords = [...new Set(
          allLines
            .map(w => w.trim().toUpperCase())
            .filter(w => w.length === 5 && /^[A-Z]+$/.test(w))
        )];
        
        console.log(`Found ${fiveLetterWords.length} unique 5-letter English words.`);
        
        console.log("Inserting into database...");
        const batchSize = 1000;
        for (let i = 0; i < fiveLetterWords.length; i += batchSize) {
          const batch = fiveLetterWords.slice(i, i + batchSize).map(w => ({
            word: w,
            category: 'General'
          }));
          
          await prisma.fivegrid_words.createMany({
            data: batch,
            skipDuplicates: true
          });
          
          console.log(`Inserted words ${i} to ${Math.min(i + batchSize, fiveLetterWords.length)}`);
        }
        
        console.log("Database seeding completed successfully!");
      } catch (err) {
        console.error("Error during insertion:", err);
      } finally {
        await prisma.$disconnect();
      }
    });
  }).on('error', (err) => {
    console.error("Error fetching dictionary:", err);
    prisma.$disconnect();
  });
}

main().catch(err => {
  console.error("Unhandled error:", err);
  prisma.$disconnect();
});
