const fs = require('fs');
let code = fs.readFileSync('src/pages/QuranView.tsx', 'utf8');

const target = `                    <svg
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

const replacement = `                    <svg
                      width="76"
                      height="84"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Folder back solid */}
                      <path
                        d="M7 4H17C18.1046 4 19 4.89543 19 6V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V6C5 4.89543 5.89543 4 7 4Z"
                        fill="#fb6060"
                      />
                      {/* Mic inside */}
                      <path d="M12 8V13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/QuranView.tsx', code.replace(target, replacement));
  console.log("Icon fixed.");
} else {
  console.log("Icon not found!");
}
