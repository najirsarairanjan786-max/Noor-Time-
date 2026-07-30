const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgCode = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="1024" height="1024">
  <defs>
    <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#006633" />
      <stop offset="100%" stop-color="#003319" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCEABB" />
      <stop offset="50%" stop-color="#F8B500" />
      <stop offset="100%" stop-color="#B38000" />
    </linearGradient>
  </defs>
  <!-- Mosque Dome -->
  <path d="M14,90 C14,50 14,50 54,12 C94,50 94,50 94,90 Z" fill="url(#domeGrad)" stroke="url(#goldGrad)" stroke-width="4" stroke-linejoin="round"/>
  <path d="M12,90 L96,90" stroke="url(#goldGrad)" stroke-width="4" stroke-linecap="round"/>
  <!-- Minaret -->
  <rect x="76" y="40" width="12" height="50" fill="url(#goldGrad)" />
  <rect x="74" y="38" width="16" height="4" fill="url(#goldGrad)" />
  <rect x="78" y="20" width="8" height="18" fill="url(#goldGrad)" />
  <rect x="75" y="24" width="14" height="3" fill="url(#goldGrad)" />
  <path d="M78,20 L82,10 L86,20 Z" fill="url(#goldGrad)" />
  <circle cx="82" cy="8" r="1.5" fill="url(#goldGrad)" />
  <!-- Clock -->
  <circle cx="54" cy="58" r="28" fill="#002211" stroke="url(#goldGrad)" stroke-width="4" />
  <!-- Clock ticks -->
  <rect x="53" y="32" width="2" height="6" fill="url(#goldGrad)" rx="1"/>
  <rect x="53" y="78" width="2" height="6" fill="url(#goldGrad)" rx="1"/>
  <rect x="28" y="57" width="6" height="2" fill="url(#goldGrad)" rx="1"/>
  <rect x="74" y="57" width="6" height="2" fill="url(#goldGrad)" rx="1"/>
  <circle cx="66" cy="37" r="1.5" fill="url(#goldGrad)"/>
  <circle cx="75" cy="46" r="1.5" fill="url(#goldGrad)"/>
  <circle cx="75" cy="70" r="1.5" fill="url(#goldGrad)"/>
  <circle cx="66" cy="79" r="1.5" fill="url(#goldGrad)"/>
  <circle cx="42" cy="79" r="1.5" fill="url(#goldGrad)"/>
  <circle cx="33" cy="70" r="1.5" fill="url(#goldGrad)"/>
  <circle cx="33" cy="46" r="1.5" fill="url(#goldGrad)"/>
  <circle cx="42" cy="37" r="1.5" fill="url(#goldGrad)"/>
  <!-- Clock Hands (10:10) -->
  <line x1="54" y1="58" x2="38" y2="48" stroke="url(#goldGrad)" stroke-width="4" stroke-linecap="round" />
  <line x1="54" y1="58" x2="70" y2="46" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" />
  <circle cx="54" cy="58" r="3.5" fill="url(#goldGrad)" />
  <!-- Crescent and Star -->
  <path d="M26,14 A12,12 0 1,0 26,38 A14,14 0 1,1 26,14 Z" fill="url(#goldGrad)" />
  <polygon points="36,20 38,24 42,24 39,26.5 40,30.5 36,28 32,30.5 33,26.5 30,24 34,24" fill="url(#goldGrad)" />
</svg>
`;

async function main() {
  const sizes = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
  };
  
  const basePath = '/app/applet/android/app/src/main/res';
  
  for (const [res, size] of Object.entries(sizes)) {
    const dir = path.join(basePath, `mipmap-${res}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    // Foreground
    await sharp(Buffer.from(svgCode))
      .resize(size, size)
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
      
    // Background (solid white for now)
    await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .png()
      .toFile(path.join(dir, 'ic_launcher_background.png'));
      
    // ic_launcher (flattened)
    await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite([{ input: await sharp(Buffer.from(svgCode)).resize(size, size).png().toBuffer() }])
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));
      
    // ic_launcher_round (flattened, round crop)
    const circleSvg = `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`;
    await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite([{ input: await sharp(Buffer.from(svgCode)).resize(size, size).png().toBuffer() }])
      .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));
  }
}

main().catch(console.error);
