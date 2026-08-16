const fs = require('fs');
let code = fs.readFileSync('src/pages/QuranView.tsx', 'utf8');

const target = `                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#fb6060]">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" x2="12" y1="19" y2="22"></line>
                    </svg>`;

const replacement = `                    <svg
                      width="76"
                      height="84"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Folder back */}
                      <path
                        d="M3 7C3 5.89543 3.89543 5 5 5H9.58579C10.1162 5 10.6249 5.21071 11 5.58579L12.4142 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
                        fill="#fb6060"
                        fillOpacity="0.2"
                        stroke="#fb6060"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      {/* Mic inside folder */}
                      <path d="M12 8V13" stroke="#fb6060" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11" stroke="#fb6060" strokeWidth="2" strokeLinecap="round" />
                    </svg>`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/QuranView.tsx', code.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found!");
}
