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

            // Pattern: find <div className="fixed inset-0 ..."> 
            // Followed by <div className="... bg-... rounded-xs...
            // It's easier to just search for `w-full max-w-md` or `w-full max-w-2xl` inside modals
            // Wait, we can find `w-full max-w-` and ensure it has `max-h-[85vh] overflow-y-auto`
            // Let's replace:
            // /className="(w-full max-w-[a-zA-Z0-9\-\[\]]+)\s+(bg-[^"]*)"/g
            // But this might catch other things.
            // Let's do a more robust regex that looks for classes in modals. 
            // Common modal wrapper: bg-[#0F0F1A] or bg-cyber-card relative
            // Actually, we can just replace 'relative rounded-xs text-left' with 'relative rounded-xs text-left max-h-[85vh] overflow-y-auto max-w-[95vw]'
            
            content = content.replace(/(max-w-md|max-w-lg|max-w-xl|max-w-2xl|max-w-3xl)(.*?)bg-\[\#0F0F1A\](.*?)rounded-xs/g, (match) => {
                if (!match.includes('max-h-[85vh]')) {
                    return match + ' max-h-[85vh] overflow-y-auto max-w-[95vw]';
                }
                return match;
            });

            // For other modals using bg-cyber-card or similar
            content = content.replace(/(max-w-md|max-w-lg|max-w-xl|max-w-2xl|max-w-3xl)(.*?)bg-cyber-card(.*?)rounded-xs/g, (match) => {
                if (!match.includes('max-h-[85vh]')) {
                    return match + ' max-h-[85vh] overflow-y-auto max-w-[95vw]';
                }
                return match;
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed modals in:', fullPath);
            }
        }
    });
}

traverseDir(directoryPath);
console.log('Done fixing modals!');
