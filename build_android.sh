set -e
echo "Updating apt..."
apt-get update -qq
echo "Installing java, unzip, wget, curl..."
apt-get install -y -qq openjdk-17-jdk-headless unzip wget curl

echo "Downloading Android SDK..."
mkdir -p /opt/android-sdk/cmdline-tools
curl -sL -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools/
mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk

echo "Accepting licenses..."
yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null

echo "Installing platform-tools, platforms;android-34, build-tools;34.0.0..."
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" > /dev/null

echo "Downloading Gradle..."
curl -sL -o /tmp/gradle.zip https://services.gradle.org/distributions/gradle-8.7-bin.zip
unzip -q /tmp/gradle.zip -d /opt/

echo "Building Android App..."
cd /app/applet/android
/opt/gradle-8.7/bin/gradle assembleDebug --no-daemon > /tmp/build.log 2>&1
echo "Build finished."
