const fs = require('fs');
let code = fs.readFileSync('src/pages/QuranView.tsx', 'utf8');

const target = `                    <svg
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

const replacement = `                    <svg
                      width="76"
                      height="84"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Folder back solid */}
                      <path d="M4 20C3.45 20 2.97917 19.8042 2.5875 19.4125C2.19583 19.0208 2 18.55 2 18V6C2 5.45 2.19583 4.97917 2.5875 4.5875C2.97917 4.19583 3.45 4 4 4H10L12 6H20C20.55 6 21.0208 6.19583 21.4125 6.5875C21.8042 6.97917 22 7.45 22 8V18C22 18.55 21.8042 19.0208 21.4125 19.4125C21.0208 19.8042 20.55 20 20 20H4Z" fill="#fb6060"/>
                      {/* Mic inside */}
                      <path d="M12 9V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/QuranView.tsx', code.replace(target, replacement));
  console.log("Icon fixed.");
} else {
  console.log("Icon not found!");
}
