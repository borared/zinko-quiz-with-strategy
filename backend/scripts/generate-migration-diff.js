require('dotenv').config();
const { execSync } = require('child_process');

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL or DIRECT_URL required');
  process.exit(1);
}

const cmd = `npx prisma migrate diff --from-url "${url}" --to-schema-datamodel prisma/schema.prisma --script`;
console.log(execSync(cmd, { encoding: 'utf8', cwd: __dirname + '/..' }));