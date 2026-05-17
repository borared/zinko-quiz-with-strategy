const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:\\Users\\U-ser\\OneDrive\\Desktop\\Zinko\\frontend\\src');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  const classRegex = /className=["']([^"']*)["']/g;
  const dynamicClassRegex = /className=\{`([^`]*)`\}/g;

  function replacer(match, p1) {
    if (p1.includes('border-zk-black') && !p1.includes('rounded-') && !p1.includes('rounded')) {
      const isSmall = p1.includes('px-4 py-2') || p1.includes('px-4 py-1') || p1.includes('px-6 py-2') || p1.includes('text-sm') || p1.includes('text-xs') || p1.includes('text-[10px]');
      const rounding = isSmall ? 'rounded-lg' : 'rounded-xl';
      return match.replace(p1, p1 + ' ' + rounding);
    }
    return match;
  }

  newContent = newContent.replace(classRegex, replacer);
  newContent = newContent.replace(dynamicClassRegex, replacer);

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
    count++;
  }
});

console.log('Updated ' + count + ' files.');
