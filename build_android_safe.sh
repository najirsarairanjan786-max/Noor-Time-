set -e
export DEBIAN_FRONTEND=noninteractive

echo "Fixing dpkg..."
dpkg --configure -a --force-confdef --force-confold > /dev/null 2>&1 || true

echo "Updating apt..."
apt-get update -qq

echo "Installing dependencies..."
apt-get install -y -qq -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" openjdk-17-jdk-headless unzip wget curl > /dev/null

echo "Downloading Android SDK..."
mkdir -p /opt/android-sdk/cmdline-tools
curl -sL -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q -o /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools/ > /dev/null
rm -rf /opt/android-sdk/cmdline-tools/latest || true
mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk

echo "Accepting SDK licenses..."
yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null

echo "Installing Android platform tools..."
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" > /dev/null

echo "Downloading Gradle..."
curl -sL -o /tmp/gradle.zip https://services.gradle.org/distributions/gradle-8.14.3-bin.zip
unzip -q -o /tmp/gradle.zip -d /opt/ > /dev/null

echo "Building Android App..."
cd /app/applet/android
export GRADLE_OPTS="-Dorg.gradle.jvmargs='-Xmx512m -XX:MaxMetaspaceSize=256m' -Dorg.gradle.daemon=false"
/opt/gradle-8.14.3/bin/gradle assembleDebug --no-daemon --max-workers=1 > /tmp/build_android.log 2>&1
echo "Build finished successfully!"
