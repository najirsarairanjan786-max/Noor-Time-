#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq openjdk-17-jdk-headless unzip wget curl
mkdir -p /opt/android-sdk/cmdline-tools
curl -sL -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools/
rm -rf /opt/android-sdk/cmdline-tools/latest
mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" > /dev/null
curl -sL -o /tmp/gradle.zip https://services.gradle.org/distributions/gradle-8.7-bin.zip
unzip -q /tmp/gradle.zip -d /opt/
cd /app/applet/android
/opt/gradle-8.7/bin/gradle assembleDebug --no-daemon > /tmp/build_clean.log 2>&1
echo "Done"
