const fs = require('fs');
const file = 'src/pages/QuranView.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the old Card 12
const card12Start = content.indexOf('{/* Card 12 - Tilawat Check */}');
if (card12Start !== -1) {
    const card13Start = content.indexOf('{/* Card 13', card12Start);
    if (card13Start !== -1) {
        content = content.substring(0, card12Start) + content.substring(card13Start);
    }
}

// 2. Insert the new Tilawat Check card before Grid
const gridStart = content.indexOf('{/* Grid */}');
if (gridStart !== -1) {
    const newCard = `              {/* Tilawat Check Banner */}
              <div
                onClick={() => setView("aipractice")}
                className="bg-white rounded-2xl p-4 flex items-center shadow-sm border-b-[8px] border-[#fb6060] gap-4 active:scale-95 transition-transform cursor-pointer relative"
              >
                <div className="w-[72px] h-[72px] flex-shrink-0 flex items-center justify-center text-[#fb6060] relative">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="10" y="8" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.2" fill="#fb6060" fillOpacity="0.1"/>
                    <path d="M8 12.5v.5a4 4 0 0 0 8 0v-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M12 17v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-extrabold text-black text-[18px] tracking-tight">Tilawat Check</span>
                    <span className="font-arabic font-bold text-[#df4b4b] text-[18px]">تلاوت چیک کریں</span>
                  </div>
                  <hr className="w-full border-black mb-1.5 mt-1.5 border-[0.5px] opacity-20" />
                  <span className="text-gray-500 text-[13px] font-bold leading-tight tracking-tight">Recite Quran and check your reading</span>
                </div>
                <span className="absolute top-0 right-0 bg-[#df4b4b] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
                  New
                </span>
              </div>

              `;
    content = content.substring(0, gridStart) + newCard + content.substring(gridStart);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Success");
} else {
    console.log("Grid not found");
}

