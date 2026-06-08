const fs = require('fs');
const path = require('path');

// 1. Fix imports inside features
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src/features'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from "\.\.\/ui\//g, 'from "../../components/ui/');
  content = content.replace(/from '\.\.\/ui\//g, 'from \'../../components/ui/');
  fs.writeFileSync(file, content);
});
console.log('Fixed UI imports in features.');

// 2. Fix imports in App.tsx
const appTsxPath = path.join(__dirname, 'src/App.tsx');
let appContent = fs.readFileSync(appTsxPath, 'utf8');
appContent = appContent.replace(/\.\/components\/site\//g, './features/store/');
appContent = appContent.replace(/\.\/components\/admin\//g, './features/admin/');
fs.writeFileSync(appTsxPath, appContent);
console.log('Fixed imports in App.tsx.');
