const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'backend', 'routes');

const prefixes = {
  'ai.js': '/api/ai',
  'quiz.js': '/api/quizzes',
  'avatar.js': '/api/avatars',
  'notification.js': '/api/notifications',
  'scenery.js': '/api/sceneries',
  'shop.js': '/api/shop',
  'game.js': '/api/game',
  'user.js': '/api/user',
  'auth.js': '/api/auth',
  'webhooks.js': '/api/webhooks'
};

function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function processFile(filePath, fileName) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Tag based on file name (e.g. quiz.js -> Quiz)
  const tag = toTitleCase(fileName.replace('.js', ''));
  const prefix = prefixes[fileName] || '';
  
  // Regex to match router methods: router.get('/path', ...)
  // It captures the HTTP method and the path
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`](.*?)['"`]/g;
  
  let match;
  let modifications = [];
  
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1]; // get, post, etc.
    let routePath = match[2]; // /profile, /:id, etc.
    const index = match.index;
    
    // Check if there is already a @swagger block right above it
    const textBefore = content.substring(Math.max(0, index - 200), index);
    if (textBefore.includes('@swagger')) {
      continue; // Skip, already documented
    }
    
    // Handle root paths like '/' correctly so we don't get '/api/quizzes//'
    let fullRoutePath = prefix + routePath;
    if (fullRoutePath.endsWith('/') && fullRoutePath.length > 1) {
       fullRoutePath = fullRoutePath.slice(0, -1);
    }
    
    // Convert express path params /:id to swagger format /{id}
    const swaggerPath = fullRoutePath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
    
    // Extract path parameters for documentation
    const paramsMatch = routePath.match(/:([a-zA-Z0-9_]+)/g) || [];
    let paramsYaml = '';
    if (paramsMatch.length > 0) {
      paramsYaml = `\n *     parameters:`;
      paramsMatch.forEach(p => {
        const pName = p.substring(1);
        paramsYaml += `\n *       - in: path\n *         name: ${pName}\n *         required: true\n *         schema:\n *           type: string`;
      });
    }

    const swaggerBlock = `/**
 * @swagger
 * ${swaggerPath}:
 *   ${method}:
 *     summary: ${method.toUpperCase()} ${routePath}
 *     tags: [${tag}]${paramsYaml}
 *     responses:
 *       200:
 *         description: Successful response
 */
`;
    
    modifications.push({
      index: index,
      text: swaggerBlock
    });
  }
  
  // Apply modifications backwards so indices don't shift
  for (let i = modifications.length - 1; i >= 0; i--) {
    const mod = modifications[i];
    content = content.substring(0, mod.index) + mod.text + content.substring(mod.index);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${fileName} with ${modifications.length} swagger comments.`);
}

const files = fs.readdirSync(routesDir);
for (const file of files) {
  if (file.endsWith('.js') && file !== 'auth.js') { // Skip auth.js since we did it manually
    processFile(path.join(routesDir, file), file);
  }
}
