import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToMigrate = [
  path.join(__dirname, 'src/components'),
  path.join(__dirname, 'src/page'),
  path.join(__dirname, 'src/hooks'),
  path.join(__dirname, 'src/context')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let modified = false;

  // 1. Add "use client" if it's a JSX file
  if (filePath.endsWith('.jsx') && !content.includes('"use client"') && !content.includes("'use client'")) {
    content = '"use client";\n' + content;
    modified = true;
  }

  // 2. Replace react-router-dom hooks
  if (content.includes('react-router-dom')) {
    content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]react-router-dom['"]/g, (match, imports) => {
      let nextNavigationImports = [];
      let newImports = imports;
      
      if (newImports.includes('useNavigate')) {
        nextNavigationImports.push('useRouter');
        newImports = newImports.replace('useNavigate', '').replace(/,\s*,/g, ',');
      }
      if (newImports.includes('useLocation')) {
        nextNavigationImports.push('usePathname');
        newImports = newImports.replace('useLocation', '').replace(/,\s*,/g, ',');
      }
      if (newImports.includes('useParams')) {
        nextNavigationImports.push('useParams');
        newImports = newImports.replace('useParams', '').replace(/,\s*,/g, ',');
      }
      
      let res = '';
      if (nextNavigationImports.length > 0) {
        res += `import { ${nextNavigationImports.join(', ')} } from 'next/navigation';\n`;
      }
      // If there are left over imports (like Link, Route), keep them for now or strip them
      if (newImports.trim() !== '' && newImports.trim() !== ',') {
         // Next.js Link is different, but let's just do a naive replace
         if(newImports.includes('Link')) {
            res += `import Link from 'next/link';\n`;
         }
      }
      return res;
    });

    content = content.replace(/const\s+(\w+)\s*=\s*useNavigate\(\)/g, 'const $1 = useRouter()');
    content = content.replace(/const\s+(\w+)\s*=\s*useLocation\(\)/g, 'const $1 = usePathname()');
    
    // Replace navigate() calls with router.push()
    // This is tricky because the variable name could be anything (usually navigate)
    // We assume it's named navigate or router
    content = content.replace(/navigate\(/g, 'router.push(');
    
    // Fix the variable name if they used `const navigate = useRouter()`
    content = content.replace(/const\s+navigate\s*=\s*useRouter\(\)/g, 'const router = useRouter()');
    
    modified = true;
  }

  // Clerk React -> Clerk Nextjs
  if (content.includes('@clerk/clerk-react')) {
     content = content.replace(/['"]@clerk\/clerk-react['"]/g, "'@clerk/nextjs'");
     modified = true;
  }

  if (modified && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Migrated: ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      processFile(filePath);
    }
  }
}

dirsToMigrate.forEach(walkDir);
console.log('Migration complete.');
