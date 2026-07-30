#!/bin/bash
set -e

echo "1. Generating icons..."
export DEBIAN_FRONTEND=noninteractive

SOURCE="/app/applet/public/icon-512.png"
RES_DIR="/app/applet/android/app/src/main/res"

if [ ! -f "$SOURCE" ]; then
    echo "Source image not found!"
    exit 1
fi

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
    
  # Background icon (adaptive)
  convert -size ${ADAPT_SIZE}x${ADAPT_SIZE} xc:#ffffff "$MIPMAP_DIR/ic_launcher_background.png"
done

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

echo "2. Setting up Android SDK..."
if [ ! -d /opt/android-sdk/cmdline-tools ]; then
    mkdir -p /opt/android-sdk/cmdline-tools
    cd /opt/android-sdk/cmdline-tools
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip
    unzip -q -o cmdline-tools.zip
    rm cmdline-tools.zip
    mv cmdline-tools latest
    mkdir -p /opt/android-sdk/cmdline-tools/latest
    mv latest/* /opt/android-sdk/cmdline-tools/latest/ || true
fi

export ANDROID_HOME=/opt/android-sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
yes | sdkmanager --licenses >/dev/null 2>&1 || true

echo "3. Setting up Gradle..."
if [ ! -d /opt/gradle-8.13/bin ]; then
    cd /opt
    wget -q https://services.gradle.org/distributions/gradle-8.13-bin.zip -O gradle.zip
    unzip -q -o gradle.zip
    rm gradle.zip
    chmod -R +rx gradle-8.13/bin/
fi
export PATH="/opt/gradle-8.13/bin:$PATH"

echo "4. Fixing Java Versions..."
find /app/applet/android -name "*.gradle" -type f -exec sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' {} +
if [ -d /app/applet/node_modules/@capacitor ]; then
    find /app/applet/node_modules/@capacitor -name "*.gradle" -type f -exec sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' {} +
    find /app/applet/node_modules/@capacitor -name "*.js" -type f -exec sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' {} +
fi

echo "5. Building APK..."
cd /app/applet/android
export GRADLE_OPTS="-Dorg.gradle.jvmargs='-Xmx512m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC' -Dorg.gradle.parallel=false -Dorg.gradle.vfs.watch=false -Dorg.gradle.daemon=false"
gradle clean assembleDebug --no-daemon --max-workers=1

echo "6. Saving APK..."
cp /app/applet/android/app/build/outputs/apk/debug/app-debug.apk /app/applet/NoorTime.apk
