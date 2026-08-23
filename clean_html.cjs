const fs = require('fs');
const file = 'src/pages/QuranView.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<div className="w-[72px] h-[72px] flex-shrink-0 flex items-center justify-center text-[#fb6060] relative">
                  <div className="relative w-[72px] h-[72px] flex items-center justify-center">`;

if (content.includes(target)) {
    content = content.replace(target, `<div className="relative w-[72px] h-[72px] flex-shrink-0 flex items-center justify-center text-[#fb6060]">`);
    // also remove the extra closing div
    content = content.replace(`</div>\n                </div>\n                <div className="flex flex-col flex-1">`, `</div>\n                <div className="flex flex-col flex-1">`);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Success");
} else {
    console.log("Target not found");
}

