const fs = require('fs');

const dataFile = 'src/data/jantriBookData.ts';
let content = fs.readFileSync(dataFile, 'utf8');

// Map old categories to new ones
content = content.replace(/category: "adhkar"/g, 'category: "azkar"');
content = content.replace(/category: "hajj"/g, 'category: "hajj_umrah"');
content = content.replace(/category: "umrah"/g, 'category: "hajj_umrah"');
content = content.replace(/category: "surahs"/g, 'category: "quran_hadith"');
content = content.replace(/category: "etiquette"/g, 'category: "manners"');
content = content.replace(/category: "fasting"/g, 'category: "ramadan"');
content = content.replace(/category: "jumuah"/g, 'category: "prayer"');
content = content.replace(/category: "children"/g, 'category: "faq"');

fs.writeFileSync(dataFile, content, 'utf8');
