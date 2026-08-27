const fs = require('fs');

let content = fs.readFileSync('src/data/jantriBookData.ts', 'utf8');
const generated = JSON.parse(fs.readFileSync('generated_jantri.json', 'utf8'));

// find export const jantriBookData
const startIndex = content.indexOf('export const jantriBookData: JantriChapter[] = [');

if (startIndex > -1) {
  const before = content.slice(0, startIndex + 'export const jantriBookData: JantriChapter[] = ['.length);
  const after = content.slice(startIndex + 'export const jantriBookData: JantriChapter[] = ['.length);
  
  // Create string of generated items
  let generatedStr = '';
  for (const item of generated) {
    generatedStr += `\n  ${JSON.stringify(item, null, 2).replace(/\n/g, '\n  ')},`;
  }
  
  fs.writeFileSync('src/data/jantriBookData.ts', before + generatedStr + after, 'utf8');
}
