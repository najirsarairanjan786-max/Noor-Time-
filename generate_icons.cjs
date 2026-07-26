const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#0D2B20"/>
  
  <g stroke="#D4AF37" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Dome outline -->
    <path d="M 312 450 C 312 250, 412 180, 512 140 C 612 180, 712 250, 712 450" />
    
    <!-- Outer Arch -->
    <path d="M 212 550 L 212 350 C 212 150, 812 150, 812 350 L 812 550" />
    <path d="M 212 550 C 150 550, 150 600, 150 600" />
    <path d="M 812 550 C 874 550, 874 600, 874 600" />
    
    <!-- Minaret -->
    <rect x="732" y="250" width="40" height="300" />
    <path d="M 722 250 L 782 250" />
    <path d="M 732 250 L 752 180 L 772 250" />
    <circle cx="752" cy="170" r="10" fill="#D4AF37" />
    
    <!-- Crescent & Star -->
    <path d="M 350 200 A 40 40 0 1 1 300 150 A 50 50 0 1 0 350 200 Z" fill="#D4AF37" />
    <polygon points="370,140 375,155 390,155 378,165 382,180 370,170 358,180 362,165 350,155 365,155" fill="#D4AF37" stroke="none" />
    
    <!-- Main Clock Circle -->
    <circle cx="512" cy="460" r="180" fill="#0D2B20" />
    <circle cx="512" cy="460" r="160" />
    <circle cx="512" cy="460" r="170" stroke-width="4" />
    
    <!-- Clock Ticks -->
    <line x1="512" y1="320" x2="512" y2="340" />
    <line x1="512" y1="580" x2="512" y2="600" />
    <line x1="372" y1="460" x2="392" y2="460" />
    <line x1="632" y1="460" x2="652" y2="460" />
    
    <!-- Clock Hands -->
    <line x1="512" y1="460" x2="570" y2="420" stroke-width="16" />
    <line x1="512" y1="460" x2="430" y2="420" stroke-width="12" />
    <circle cx="512" cy="460" r="16" fill="#D4AF37" stroke="none" />
  </g>
  
  <!-- Text NoorTime -->
  <text x="512" y="720" font-family="serif" font-size="120" font-weight="bold" text-anchor="middle">
    <tspan fill="#D4AF37">Noor</tspan><tspan fill="#FFFFFF">Time</tspan>
  </text>
  
  <line x1="250" y1="780" x2="774" y2="780" stroke="#D4AF37" stroke-width="2" />
  
  <rect x="502" y="770" width="20" height="20" fill="#0D2B20" />
  <polygon points="512,760 517,770 527,770 519,778 522,788 512,782 502,788 505,778 497,770 507,770" fill="#D4AF37" />
</svg>
`;

const foregroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#D4AF37" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 312 450 C 312 250, 412 180, 512 140 C 612 180, 712 250, 712 450" />
    <path d="M 212 550 L 212 350 C 212 150, 812 150, 812 350 L 812 550" />
    <rect x="732" y="250" width="40" height="300" />
    <path d="M 732 250 L 752 180 L 772 250" />
    <circle cx="512" cy="460" r="180" fill="none" />
    <circle cx="512" cy="460" r="160" />
    <line x1="512" y1="460" x2="570" y2="420" stroke-width="20" />
    <line x1="512" y1="460" x2="430" y2="420" stroke-width="15" />
    <circle cx="512" cy="460" r="20" fill="#D4AF37" />
  </g>
  <text x="512" y="750" font-family="serif" font-size="140" font-weight="bold" text-anchor="middle">
    <tspan fill="#D4AF37">Noor</tspan><tspan fill="#FFFFFF">Time</tspan>
  </text>
</svg>
`;

const backgroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#0D2B20"/>
</svg>
`;

const sizes = {
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192
};

async function generate() {
  const baseDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
  
  for (const [density, size] of Object.entries(sizes)) {
    const dir = path.join(baseDir, `mipmap-${density}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    // ic_launcher.png and round
    const iconPath = path.join(dir, 'ic_launcher.png');
    const roundPath = path.join(dir, 'ic_launcher_round.png');
    const fgPath = path.join(dir, 'ic_launcher_foreground.png');
    const bgPath = path.join(dir, 'ic_launcher_background.png');
    
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(iconPath);
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(roundPath);
    
    // For adaptive icons, foreground and background are usually 108dp base, but here we can just scale
    // them to the same size or slightly larger. We'll use the same size for simplicity.
    const adaptiveSize = Math.round(size * (108 / 48)); // standard adaptive icon sizing
    
    await sharp(Buffer.from(foregroundSvg)).resize(adaptiveSize, adaptiveSize).png().toFile(fgPath);
    await sharp(Buffer.from(backgroundSvg)).resize(adaptiveSize, adaptiveSize).png().toFile(bgPath);
    console.log(`Generated icons for ${density}`);
  }
  
  // anydpi-v26 XMLs (these should already exist, but we must make sure they point to foreground and background)
  // Actually, wait, the instructions ask for PNG files in anydpi-v26?!
  // "Generate valid PNG files for: ic_launcher.png ... Update all mipmap folders: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi, anydpi-v26"
  // Android anydpi-v26 usually holds XML, but if the user asked for PNGs there, I'll generate them just in case.
  const anyDpiDir = path.join(baseDir, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anyDpiDir)) fs.mkdirSync(anyDpiDir, { recursive: true });
  
  const anySize = 192;
  await sharp(Buffer.from(svg)).resize(anySize, anySize).png().toFile(path.join(anyDpiDir, 'ic_launcher.png'));
  await sharp(Buffer.from(svg)).resize(anySize, anySize).png().toFile(path.join(anyDpiDir, 'ic_launcher_round.png'));
  await sharp(Buffer.from(foregroundSvg)).resize(anySize, anySize).png().toFile(path.join(anyDpiDir, 'ic_launcher_foreground.png'));
  await sharp(Buffer.from(backgroundSvg)).resize(anySize, anySize).png().toFile(path.join(anyDpiDir, 'ic_launcher_background.png'));
  console.log(`Generated icons for anydpi-v26`);
  
  // Create XML files for adaptive icons in anydpi-v26 just to be safe
  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
  // Usually the xml is named ic_launcher.xml and ic_launcher_round.xml
  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), xmlContent);
  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), xmlContent);
  
}

generate().catch(console.error);
