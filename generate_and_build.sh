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

echo "Icons generated externally!"

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
