const fs = require('fs');
const file = 'src/pages/QuranView.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldIcon = `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="10" y="8" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.2" fill="#fb6060" fillOpacity="0.1"/>
                    <path d="M8 12.5v.5a4 4 0 0 0 8 0v-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M12 17v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>`;

const newIcon = `<div className="relative w-[72px] h-[72px] flex items-center justify-center">
                    <BookOpen
                      className="w-[72px] h-[72px] text-[#fb6060]"
                      strokeWidth={1}
                      style={{
                        strokeLinejoin: "round",
                        strokeLinecap: "round",
                      }}
                    />
                    <div className="absolute w-[30px] h-[2.5px] bg-[#fb6060] rounded-full rotate-[-25deg] top-[48%] left-[24%]"></div>
                    <div className="absolute w-[30px] h-[2.5px] bg-[#fb6060] rounded-full rotate-[25deg] top-[48%] right-[24%]"></div>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                      <Mic className="w-[20px] h-[20px] text-[#fb6060]" strokeWidth={2} />
                    </div>
                  </div>`;

if (content.includes(oldIcon)) {
    content = content.replace(oldIcon, newIcon);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Success");
} else {
    console.log("Icon not found");
}

