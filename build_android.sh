export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
export PATH="/opt/gradle-8.13/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

cd /app/applet/android
export GRADLE_OPTS="-Dorg.gradle.jvmargs='-Xmx1024m -XX:MaxMetaspaceSize=512m -XX:+UseSerialGC' -Dorg.gradle.parallel=false -Dorg.gradle.vfs.watch=false -Dorg.gradle.daemon=false"
gradle clean assembleDebug --no-daemon --max-workers=1

mkdir -p /app/applet/.build-outputs
mkdir -p /app/applet/APK_DOWNLOAD
cp /app/applet/android/app/build/outputs/apk/debug/app-debug.apk /app/applet/.build-outputs/app-debug.apk
cp /app/applet/android/app/build/outputs/apk/debug/app-debug.apk /app/applet/APK_DOWNLOAD/app-debug.apk
