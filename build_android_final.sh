#!/bin/bash
set -e
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
export ANDROID_HOME="/opt/android-sdk"
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

cd /app/applet/android
/usr/bin/chmod +x gradlew
./gradlew assembleDebug --no-daemon --max-workers=1
echo "Build finished successfully!"
