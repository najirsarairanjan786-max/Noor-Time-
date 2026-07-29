#!/bin/bash
set -e

mkdir -p /app/applet/build-tools
cd /app/applet/build-tools

if [ ! -d cmdline-tools/latest/bin ]; then
  echo "Downloading Android SDK..."
  curl -sL -o cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q -o cmdline-tools.zip -d /app/applet/build-tools/
  rm -rf /app/applet/build-tools/cmdline-tools/latest || true
  mkdir -p /app/applet/build-tools/cmdline-tools/latest
  mv /app/applet/build-tools/cmdline-tools/bin /app/applet/build-tools/cmdline-tools/latest/
  mv /app/applet/build-tools/cmdline-tools/lib /app/applet/build-tools/cmdline-tools/latest/
  mv /app/applet/build-tools/cmdline-tools/source.properties /app/applet/build-tools/cmdline-tools/latest/ || true
  mv /app/applet/build-tools/cmdline-tools/NOTICE.txt /app/applet/build-tools/cmdline-tools/latest/ || true
fi
chmod -R +rx /app/applet/build-tools/cmdline-tools/latest/bin/

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/app/applet/build-tools

echo "Accepting licenses..."
yes | /app/applet/build-tools/cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null

echo "Installing SDK packages..."
/app/applet/build-tools/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" > /dev/null

if [ ! -d gradle-8.13 ]; then
  curl -sL -o gradle.zip https://services.gradle.org/distributions/gradle-8.13-bin.zip
  unzip -q -o gradle.zip
fi
chmod -R +rx /app/applet/build-tools/gradle-8.13/bin/
export PATH="/app/applet/build-tools/gradle-8.13/bin:$PATH"

cd /app/applet/android
cat << 'PROP' > local.properties
sdk.dir=/app/applet/build-tools
PROP

echo "Fixing Java versions..."
sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' /app/applet/android/app/capacitor.build.gradle || true
sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' /app/applet/android/capacitor-cordova-android-plugins/build.gradle || true
if [ -d /app/applet/node_modules/\@capacitor/android/capacitor ]; then
    sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' /app/applet/node_modules/\@capacitor/android/capacitor/build.gradle || true
fi

echo "Running gradle..."
# limit memory to avoid OOM
gradle clean assembleDebug --no-daemon -Dorg.gradle.jvmargs="-Xmx1024m -XX:MaxMetaspaceSize=256m" > /app/applet/build_final.log 2>&1
echo "Build Done"
