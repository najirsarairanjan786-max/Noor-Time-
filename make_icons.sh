#!/bin/bash
set -e

cat << 'SVGEOF' > /tmp/icon.svg
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1e3a8a"/>
  <circle cx="256" cy="150" r="60" fill="#fbbf24"/>
  <line x1="256" y1="150" x2="256" y2="110" stroke="#1e3a8a" stroke-width="6" stroke-linecap="round"/>
  <line x1="256" y1="150" x2="280" y2="150" stroke="#1e3a8a" stroke-width="6" stroke-linecap="round"/>
  <path d="M 156 400 L 156 250 A 50 50 0 0 1 256 250 L 256 400 Z" fill="#fbbf24"/>
  <path d="M 256 400 L 256 200 A 70 70 0 0 1 356 200 L 356 400 Z" fill="#fbbf24"/>
  <rect x="100" y="300" width="40" height="100" fill="#fbbf24"/>
  <polygon points="100,300 120,250 140,300" fill="#fbbf24"/>
  <rect x="370" y="280" width="40" height="120" fill="#fbbf24"/>
  <polygon points="370,280 390,220 410,280" fill="#fbbf24"/>
</svg>
SVGEOF

cat << 'SVGEOF' > /tmp/icon_fg.svg
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <circle cx="256" cy="150" r="60" fill="#fbbf24"/>
  <line x1="256" y1="150" x2="256" y2="110" stroke="#1e3a8a" stroke-width="6" stroke-linecap="round"/>
  <line x1="256" y1="150" x2="280" y2="150" stroke="#1e3a8a" stroke-width="6" stroke-linecap="round"/>
  <path d="M 156 400 L 156 250 A 50 50 0 0 1 256 250 L 256 400 Z" fill="#fbbf24"/>
  <path d="M 256 400 L 256 200 A 70 70 0 0 1 356 200 L 356 400 Z" fill="#fbbf24"/>
  <rect x="100" y="300" width="40" height="100" fill="#fbbf24"/>
  <polygon points="100,300 120,250 140,300" fill="#fbbf24"/>
  <rect x="370" y="280" width="40" height="120" fill="#fbbf24"/>
  <polygon points="370,280 390,220 410,280" fill="#fbbf24"/>
</svg>
SVGEOF

convert -background none /tmp/icon.svg /tmp/ic_launcher.png
convert -background none /tmp/icon_fg.svg /tmp/ic_launcher_foreground.png
convert -size 512x512 xc:"#1e3a8a" /tmp/ic_launcher_background.png

convert -size 512x512 xc:none -fill white -draw "circle 256,256 256,1" /tmp/mask.png
convert /tmp/ic_launcher.png -resize 512x512 \
    /tmp/mask.png -alpha off -compose CopyOpacity -composite \
    /tmp/ic_launcher_round.png

RES="/app/applet/android/app/src/main/res"

for size in "mdpi:48:108" "hdpi:72:162" "xhdpi:96:216" "xxhdpi:144:324" "xxxhdpi:192:432"; do
    IFS=":" read -r name dim fgdim <<< "$size"
    dir="$RES/mipmap-$name"
    mkdir -p "$dir"
    convert /tmp/ic_launcher.png -resize "${dim}x${dim}" "$dir/ic_launcher.png"
    convert /tmp/ic_launcher_round.png -resize "${dim}x${dim}" "$dir/ic_launcher_round.png"
    convert /tmp/ic_launcher_foreground.png -resize "${fgdim}x${fgdim}" "$dir/ic_launcher_foreground.png"
    convert /tmp/ic_launcher_background.png -resize "${fgdim}x${fgdim}" "$dir/ic_launcher_background.png"
done

echo "Icons mapped successfully"

