const fs = require('fs');
let content = fs.readFileSync('src/data/jantriBookData.ts', 'utf8');

const regex = /export const jantriBookData: JantriChapter\[\] = (\[[\s\S]*\]);/m;
const match = content.match(regex);
const arr = eval(match[1]);

const ids = arr.map(a => a.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
console.log("Duplicates in jantriBookData.ts:", duplicates);
