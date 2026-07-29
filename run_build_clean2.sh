#!/bin/bash
set -e
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
export PATH="/opt/gradle-8.7/bin:$PATH"
cd /app/applet/android
gradle assembleDebug --no-daemon > /tmp/build_clean.log 2>&1
echo "Done"
