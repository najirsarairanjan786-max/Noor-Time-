const fs = require('fs');

const file = 'src/components/jantri/JantriBook.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldTitleStr = `{chapter.title_hi && lang !== 'hi' && <p className="text-emerald-100/70 text-xs mt-0.5">{chapter.title_hi}</p>}`;

content = content.replace(oldTitleStr, '');

fs.writeFileSync(file, content, 'utf8');
