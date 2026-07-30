#!/bin/bash
set -e

apt-get update -qq && apt-get install -y imagemagick

SOURCE="/app/applet/android/app/src/main/assets/file_0000000011687209909e5ba88758be2b.png"
RES_DIR="/app/applet/android/app/src/main/res"

# Clean existing mipmap folders
rm -rf "$RES_DIR"/mipmap-*

# Sizes for standard launcher icons
declare -A LAUNCHER_SIZES=(
  ["mdpi"]=48
  ["hdpi"]=72
  ["xhdpi"]=96
  ["xxhdpi"]=144
  ["xxxhdpi"]=192
)

# Sizes for adaptive foreground/background
declare -A ADAPTIVE_SIZES=(
  ["mdpi"]=108
  ["hdpi"]=162
  ["xhdpi"]=216
  ["xxhdpi"]=324
  ["xxxhdpi"]=432
)

for DENSITY in "${!LAUNCHER_SIZES[@]}"; do
  SIZE="${LAUNCHER_SIZES[$DENSITY]}"
  ADAPT_SIZE="${ADAPTIVE_SIZES[$DENSITY]}"
  
  MIPMAP_DIR="$RES_DIR/mipmap-$DENSITY"
  mkdir -p "$MIPMAP_DIR"
  
  echo "Generating for $DENSITY..."
  
  # Standard icon
  convert "$SOURCE" -resize ${SIZE}x${SIZE} "$MIPMAP_DIR/ic_launcher.png"
  
  # Round icon (circle crop)
  convert "$SOURCE" -resize ${SIZE}x${SIZE} \
    \( +clone -alpha transparent -fill white -draw "circle $((SIZE/2)),$((SIZE/2)) $((SIZE/2)),0" \) \
    -compose copyopacity -composite "$MIPMAP_DIR/ic_launcher_round.png"
    
  # Foreground icon (adaptive) - scale it to fit within the safe zone (66% of ADAPT_SIZE)
  SAFE_SIZE=$(echo "$ADAPT_SIZE * 0.66" | bc | cut -d'.' -f1)
  # Create transparent background of ADAPT_SIZE, center the scaled image
  convert -size ${ADAPT_SIZE}x${ADAPT_SIZE} xc:transparent \
    \( "$SOURCE" -resize ${SAFE_SIZE}x${SAFE_SIZE} \) \
    -gravity center -composite "$MIPMAP_DIR/ic_launcher_foreground.png"
    
  # Background icon (adaptive) - let's make it a solid color (e.g., white)
  convert -size ${ADAPT_SIZE}x${ADAPT_SIZE} xc:#ffffff "$MIPMAP_DIR/ic_launcher_background.png"
done

# Create mipmap-anydpi-v26 for adaptive icons xml
mkdir -p "$RES_DIR/mipmap-anydpi-v26"
cat << 'XML_EOF' > "$RES_DIR/mipmap-anydpi-v26/ic_launcher.xml"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
XML_EOF

cp "$RES_DIR/mipmap-anydpi-v26/ic_launcher.xml" "$RES_DIR/mipmap-anydpi-v26/ic_launcher_round.xml"

echo "Icons generated successfully!"
