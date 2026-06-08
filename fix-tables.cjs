const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/features/admin');

function traverseDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // split by <table, if the preceding string doesn't end with <div className="overflow-x-auto overflow-y-hidden whitespace-nowrap w-full">
            // we will wrap it.
            // But an easier regex is replacing 
            // /(?<!<div className="[^"]*overflow-x-auto[^"]*">\s*)<table/g
            
            // Let's just find and replace all <table and </table>, and we'll manually clean up if needed.
            // But wait, what if it's already wrapped?
            // Let's remove all our previous wraps first to be safe, then wrap everything cleanly.
            
            content = content.replace(/<div className="overflow-x-auto overflow-y-hidden whitespace-nowrap w-full">\s*<table/g, '<table');
            content = content.replace(/<\/table>\s*<\/div>/g, '</table>');
            
            // Now wrap all tables
            content = content.replace(/<table/g, '<div className="overflow-x-auto overflow-y-hidden whitespace-nowrap w-full pb-4">\n<table');
            content = content.replace(/<\/table>/g, '</table>\n</div>');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed tables in:', fullPath);
            }
        }
    });
}

traverseDir(directoryPath);
console.log('Done fixing tables!');
