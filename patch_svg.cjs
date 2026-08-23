const fs = require('fs');
const file = 'src/pages/QuranView.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                    <svg
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

const replacementStr = `                    <svg
                      width="76"
                      height="84"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#fb6060]"
                    >
                      {/* Folder Outline */}
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      {/* Mic Outline inside */}
                      <path d="M12 9a2 2 0 0 0-2 2v2a2 2 0 0 0 4 0v-2a2 2 0 0 0-2-2z" />
                      <path d="M9 13a3 3 0 0 0 6 0" />
                      <path d="M12 16v3" />
                      <path d="M10 19h4" />
                    </svg>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Success");
} else {
  console.log("Target string not found in the file.");
}
