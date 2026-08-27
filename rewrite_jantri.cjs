const fs = require('fs');
const ts = require('typescript');

// To safely rewrite jantriBookData.ts:
// Just read the old file, cut out the old jantriCategories and interfaces, and rebuild it.
let content = fs.readFileSync('src/data/jantriBookData.ts', 'utf8');

const regex = /export const jantriBookData: JantriChapter\[\] = (\[[\s\S]*\]);/m;
const match = content.match(regex);
if (!match) {
  console.log("Could not find jantriBookData array.");
  process.exit(1);
}

// Safely evaluate the array
let existingArray = [];
try {
  // It's just an array of objects. We can use eval if we replace some things, but it's pure JSON-like syntax.
  existingArray = eval(match[1]);
} catch (e) {
  console.log("Eval failed", e);
  process.exit(1);
}

const newMonths = JSON.parse(fs.readFileSync('new_months.json', 'utf8'));

// Filter out old months
existingArray = existingArray.filter(item => item.category !== 'months');

// Prepend new months
existingArray = [...newMonths, ...existingArray];

// Generate new string
let newArrayStr = "[\n";
for (const item of existingArray) {
  newArrayStr += `  ${JSON.stringify(item, null, 2).replace(/\n/g, '\n  ')},\n`;
}
newArrayStr += "]";

const newContent = content.replace(regex, `export const jantriBookData: JantriChapter[] = ${newArrayStr};`);
fs.writeFileSync('src/data/jantriBookData.ts', newContent, 'utf8');
console.log("Rewrote jantriBookData.ts successfully.");
