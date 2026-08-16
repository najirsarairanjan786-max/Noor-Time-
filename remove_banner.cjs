const fs = require('fs');
let code = fs.readFileSync('src/pages/QuranView.tsx', 'utf8');

const bannerStr = `              {/* Tilawat Check Banner */}
              <div
                onClick={() => setView("aipractice")}
                className="bg-white rounded-[18px] p-[18px] flex items-center gap-4 cursor-pointer active:scale-95 transition-all mb-1 w-full shadow-sm border border-gray-100 group hover:shadow-md"
              >
                <div className="w-14 h-14 bg-[#fff1f1] group-hover:bg-[#ffe5e5] transition-colors rounded-2xl flex flex-col items-center justify-center shrink-0 border border-[#ffe5e5]">
                  <Mic className="w-6 h-6 text-[#fb6060] mb-0.5" />
                  <BookOpen className="w-4 h-4 text-[#fb6060]" />
                </div>
                <div className="flex-1 text-left flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[19px] font-extrabold text-gray-900 leading-none tracking-tight">Tilawat Check</h3>
                    <span className="text-[18px] font-arabic text-[#fb6060] leading-none">تلاوت چیک کریں</span>
                  </div>
                  <p className="text-[13px] text-gray-500 font-medium leading-tight">Recite Quran and check your reading</p>
                </div>
              </div>`;

if (code.includes(bannerStr)) {
  fs.writeFileSync('src/pages/QuranView.tsx', code.replace(bannerStr, ""));
  console.log("Banner removed.");
} else {
  console.log("Banner not found!");
}
