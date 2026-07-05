const fs = require('fs');

const months = [
  { id: 'month_muharram', name: 'Muharram', ar: 'محرم', index: 1 },
  { id: 'month_safar', name: 'Safar', ar: 'صفر', index: 2 },
  { id: 'month_rabiawwal', name: 'Rabi al-Awwal', ar: 'ربيع الأول', index: 3 },
  { id: 'month_rabithani', name: 'Rabi al-Thani', ar: 'ربيع الثاني', index: 4 },
  { id: 'month_jumadaula', name: 'Jumada al-Ula', ar: 'جمادى الأولى', index: 5 },
  { id: 'month_jumadaakhirah', name: 'Jumada al-Akhirah', ar: 'جمادى الآخرة', index: 6 },
  { id: 'month_rajab', name: 'Rajab', ar: 'رجب', index: 7 },
  { id: 'month_shaban', name: 'Sha\'ban', ar: 'شعبان', index: 8 },
  { id: 'month_ramadan', name: 'Ramadan', ar: 'رمضان', index: 9 },
  { id: 'month_shawwal', name: 'Shawwal', ar: 'شوال', index: 10 },
  { id: 'month_dhulqidah', name: 'Dhu al-Qi\'dah', ar: 'ذو القعدة', index: 11 },
  { id: 'month_dhulhijjah', name: 'Dhu al-Hijjah', ar: 'ذو الحجة', index: 12 }
];

const events = [
  { id: 'event_ramadan', name: 'Ramadan', date: 'Month of Ramadan' },
  { id: 'event_eid_fitr', name: 'Eid-ul-Fitr', date: '1 Shawwal' },
  { id: 'event_eid_adha', name: 'Eid-ul-Adha', date: '10 Dhu al-Hijjah' },
  { id: 'event_ashura', name: 'Ashura', date: '10 Muharram' },
  { id: 'event_new_year', name: 'Islamic New Year', date: '1 Muharram' },
  { id: 'event_mawlid', name: 'Mawlid', date: '12 Rabi al-Awwal' },
  { id: 'event_laylatul_qadr', name: 'Laylatul Qadr', date: 'Last 10 nights of Ramadan' },
  { id: 'event_shabe_barat', name: 'Shab-e-Barat', date: '15 Sha\'ban' }
];

const generated = [];

for (const m of months) {
  generated.push({
    id: m.id,
    category: 'months',
    title_en: `${m.index}. ${m.name}`,
    title_ar: m.ar,
    title_ur: m.name,
    title_hi: m.name,
    content_en: `Introduction: ${m.name} is the ${m.index}th month of the Islamic Calendar.\n\nImportance: It is a significant month in the Islamic year.\n\nHistorical Significance: Various important historical events occurred in this month.\n\nRecommended Worship: Fasting and extra prayers are highly recommended.\n\nImportant Islamic Events: Observe the important dates during this month.`,
    content_ar: `مقدمة: ${m.ar} هو الشهر رقم ${m.index} في التقويم الهجري.`,
    content_ur: `یہ اسلامی کیلنڈر کا ${m.index} واں مہینہ ہے۔`,
    content_hi: `यह इस्लामी कैलेंडर का ${m.index} वां महीना है।`
  });
}

for (const e of events) {
  generated.push({
    id: e.id,
    category: 'events',
    title_en: e.name,
    title_ar: e.name,
    title_ur: e.name,
    title_hi: e.name,
    content_en: `Detailed guide about ${e.name}.\n\nDate: ${e.date} (Automatically occurs on this Hijri date every year).\n\nImportance: This is a highly blessed occasion in Islam.\n\nPractices: Engage in Dhikr, charity, and prayers.`,
    content_ar: `معلومات عن ${e.name}`,
    content_ur: `${e.name} کے بارے میں تفصیلی معلومات`,
    content_hi: `${e.name} के बारे में विस्तृत जानकारी`
  });
}

const dataFile = 'src/data/jantriBookData.ts';
let content = fs.readFileSync(dataFile, 'utf8');

// replace the array export const jantriBookData = [...]
// Wait, to safely inject, I can append to the file if they don't exist, or just read the file, parse the array, and rewrite it.

const exportStr = "export const jantriBookData: JantriChapter[] = ";
const startIndex = content.indexOf(exportStr);
if (startIndex > -1) {
  // Let's just create a new file content with these generated ones prepended to existing ones
  let existingDataRaw = content.slice(startIndex + exportStr.length);
  // remove trailing semicolon
  existingDataRaw = existingDataRaw.trim();
  if (existingDataRaw.endsWith(';')) existingDataRaw = existingDataRaw.slice(0, -1);
  
  // It's a JS array literal, evaluating it in node might be hard if there are TS types, but wait, it's just a standard array.
  // Actually, I can just replace the whole file. It's safer to just inject standard JSON.
}

fs.writeFileSync('generated_jantri.json', JSON.stringify(generated, null, 2), 'utf8');
