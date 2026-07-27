const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#0D2B20"/>
  
  <g stroke="#D4AF37" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Dome outline -->
    <path d="M 312 550 C 312 350, 412 280, 512 240 C 612 280, 712 350, 712 550" />
    
    <!-- Outer Arch -->
    <path d="M 212 650 L 212 450 C 212 250, 812 250, 812 450 L 812 650" />
    <path d="M 212 650 C 150 650, 150 700, 150 700" />
    <path d="M 812 650 C 874 650, 874 700, 874 700" />
    
    <!-- Minaret -->
    <rect x="732" y="350" width="40" height="300" />
    <path d="M 722 350 L 782 350" />
    <path d="M 732 350 L 752 280 L 772 350" />
    <circle cx="752" cy="270" r="10" fill="#D4AF37" />
    
    <!-- Crescent & Star -->
    <path d="M 350 300 A 40 40 0 1 1 300 250 A 50 50 0 1 0 350 300 Z" fill="#D4AF37" />
    <polygon points="370,240 375,255 390,255 378,265 382,280 370,270 358,280 362,265 350,255 365,255" fill="#D4AF37" stroke="none" />
    
    <!-- Main Clock Circle -->
    <circle cx="512" cy="560" r="180" fill="#0D2B20" />
    <circle cx="512" cy="560" r="160" />
    <circle cx="512" cy="560" r="170" stroke-width="4" />
    
    <!-- Clock Ticks -->
    <line x1="512" y1="420" x2="512" y2="440" />
    <line x1="512" y1="680" x2="512" y2="700" />
    <line x1="372" y1="560" x2="392" y2="560" />
    <line x1="632" y1="560" x2="652" y2="560" />
    
    <!-- Clock Hands -->
    <line x1="512" y1="560" x2="570" y2="520" stroke-width="16" />
    <line x1="512" y1="560" x2="430" y2="520" stroke-width="12" />
    <circle cx="512" cy="560" r="16" fill="#D4AF37" stroke="none" />
  </g>
</svg>`;

const foregroundSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#D4AF37" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 312 550 C 312 350, 412 280, 512 240 C 612 280, 712 350, 712 550" />
    <path d="M 212 650 L 212 450 C 212 250, 812 250, 812 450 L 812 650" />
    <rect x="732" y="350" width="40" height="300" />
    <path d="M 732 350 L 752 280 L 772 350" />
    <circle cx="512" cy="560" r="180" fill="none" />
    <circle cx="512" cy="560" r="160" />
    <line x1="512" y1="560" x2="570" y2="520" stroke-width="20" />
    <line x1="512" y1="560" x2="430" y2="520" stroke-width="15" />
    <circle cx="512" cy="560" r="20" fill="#D4AF37" />
  </g>
</svg>`;

const backgroundSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#0D2B20"/>
</svg>`;

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
    const dir = path.join(baseDir, "mipmap-" + density);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const iconPath = path.join(dir, 'ic_launcher.png');
    const roundPath = path.join(dir, 'ic_launcher_round.png');
    const fgPath = path.join(dir, 'ic_launcher_foreground.png');
    const bgPath = path.join(dir, 'ic_launcher_background.png');
    
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(iconPath);
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(roundPath);
    
    const adaptiveSize = Math.round(size * (108 / 48));
    
    await sharp(Buffer.from(foregroundSvg)).resize(adaptiveSize, adaptiveSize).png().toFile(fgPath);
    await sharp(Buffer.from(backgroundSvg)).resize(adaptiveSize, adaptiveSize).png().toFile(bgPath);
    console.log("Generated icons for " + density);
  }
  
  const anyDpiDir = path.join(baseDir, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anyDpiDir)) fs.mkdirSync(anyDpiDir, { recursive: true });
  
  const xmlContent = '<?xml version="1.0" encoding="utf-8"?><adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@mipmap/ic_launcher_background"/><foreground android:drawable="@mipmap/ic_launcher_foreground"/></adaptive-icon>';

  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), xmlContent);
  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), xmlContent);
}

generate().catch(console.error);
