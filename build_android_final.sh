set -e
export DEBIAN_FRONTEND=noninteractive

echo "Checking environment..."
echo "Java Version:"
java -version 2>&1 || true

echo "Gradle Version:"
/opt/gradle-8.13/bin/gradle --version 2>&1 || true

echo "SDKManager Version:"
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --version 2>&1 || true

export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk

echo "Building Android App..."
cd /app/applet/android
export GRADLE_OPTS="-Dorg.gradle.jvmargs='-Xmx512m -XX:MaxMetaspaceSize=256m' -Dorg.gradle.daemon=false"
/opt/gradle-8.13/bin/gradle assembleDebug --no-daemon --max-workers=1 --stacktrace > /tmp/build_final.log 2>&1
echo "Build finished."
