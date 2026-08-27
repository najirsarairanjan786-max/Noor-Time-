const fs = require('fs');
let content = fs.readFileSync('src/lib/icons.tsx', 'utf8');

content = content.replace(/weight=\{strokeWidth \? \(strokeWidth > 2 \? 'bold' : 'regular'\) : 'regular'\}/g, "weight='duotone'");

fs.writeFileSync('src/lib/icons.tsx', content, 'utf8');
