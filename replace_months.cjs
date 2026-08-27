const fs = require('fs');

let content = fs.readFileSync('src/data/jantriBookData.ts', 'utf8');
const newMonths = JSON.parse(fs.readFileSync('new_months.json', 'utf8'));

// The array starts at `export const jantriBookData: JantriChapter[] = [`
// We can actually just evaluate the file, filter the old array, append the new months, and rewrite it.
// To avoid TS compilation issues, let's just do text manipulation.

const exportStr = "export const jantriBookData: JantriChapter[] = [";
const startIndex = content.indexOf(exportStr);
const before = content.slice(0, startIndex + exportStr.length);
const after = content.slice(startIndex + exportStr.length);

// Instead of string manipulation on the JS object string, let's just compile a JS module, 
// require it, modify the array, and dump it back as a JS file.
