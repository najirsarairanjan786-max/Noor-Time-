const fs = require('fs');
const content = fs.readFileSync('src/components/jantri/IslamicCalendar.tsx', 'utf8');
const lines = content.split('\n');
const fixed = lines.filter(line => !line.includes('<MoonPhaseWidget />'));
const targetIdx = fixed.findIndex(line => line.includes('className="space-y-6"'));
if (targetIdx !== -1) {
  fixed.splice(targetIdx + 2, 0, '      <MoonPhaseWidget />');
}
fs.writeFileSync('src/components/jantri/IslamicCalendar.tsx', fixed.join('\n'));
