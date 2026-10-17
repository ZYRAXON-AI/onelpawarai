#!/usr/bin/env bash
# Built by ZYRAXON-Pro. Wraps a web directory into a signed, installable APK.
set -euo pipefail
APP_NAME="${1:-App}"
PKG_ID="${2:-com.zyraxon.app}"
WEB_DIR="${3:-web}"

SDK_ROOT="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/sdk}}"
# Runner images move the build-tools version around, so take whatever is there
# and fall back to the one this workflow asked for.
BT="$(ls -d "$SDK_ROOT"/build-tools/* 2>/dev/null | sort -V | tail -1)"
if [ -z "$BT" ]; then
  echo "No Android build-tools found under $SDK_ROOT" >&2
  exit 1
fi
AJ="$(ls "$SDK_ROOT"/platforms/android-*/android.jar 2>/dev/null | sort -V | tail -1)"
if [ -z "$AJ" ]; then
  echo "No Android platform found under $SDK_ROOT" >&2
  exit 1
fi
echo "Using build-tools $BT and $AJ"
WORK="$(pwd)/.zyraxon-apk"
rm -rf "$WORK" && mkdir -p "$WORK"/{res/values,res/mipmap-hdpi,assets,src,classes,gen}
PKG_PATH="$(echo "$PKG_ID" | tr '.' '/')"
mkdir -p "$WORK/src/$PKG_PATH"

cp -r "$WEB_DIR"/. "$WORK/assets/" 2>/dev/null || true
if [ ! -f "$WORK/assets/index.html" ]; then
  printf '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>%s</title><h1>%s</h1>' "$APP_NAME" "$APP_NAME" > "$WORK/assets/index.html"
fi

cat > "$WORK/AndroidManifest.xml" <<XML
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="$PKG_ID">
  <uses-permission android:name="android.permission.INTERNET"/>
  <application android:label="$APP_NAME" android:icon="@mipmap/ic_launcher" android:usesCleartextTraffic="true">
    <activity android:name=".MainActivity" android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN"/>
        <category android:name="android.intent.category.LAUNCHER"/>
      </intent-filter>
    </activity>
  </application>
</manifest>
XML

printf '<?xml version="1.0" encoding="utf-8"?>\n<resources><string name="app_name">%s</string></resources>\n' "$APP_NAME" > "$WORK/res/values/strings.xml"

python3 - "$WORK/res/mipmap-hdpi/ic_launcher.png" <<'PY'
import struct, sys, zlib
def chunk(t, d):
    c = t + d
    return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
size = 96
raw = b''.join(b'\x00' + b'\x2a\x2a\x2a' * size for _ in range(size))
png = (b'\x89PNG\r\n\x1a\n'
       + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
       + chunk(b'IDAT', zlib.compress(raw))
       + chunk(b'IEND', b''))
open(sys.argv[1], 'wb').write(png)
PY

cat > "$WORK/src/$PKG_PATH/MainActivity.java" <<JAVA
package $PKG_ID;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    WebView web = new WebView(this);
    web.getSettings().setJavaScriptEnabled(true);
    web.getSettings().setDomStorageEnabled(true);
    web.setWebViewClient(new WebViewClient());
    web.loadUrl("file:///android_asset/index.html");
    setContentView(web);
  }
}
JAVA

cd "$WORK"
"$BT/aapt2" compile --dir res -o res.zip
API_LEVEL="$(basename "$(dirname "$AJ")" | sed 's/android-//')"
"$BT/aapt2" link -o base.apk -I "$AJ" --manifest AndroidManifest.xml -R res.zip \
  -A assets --java gen --auto-add-overlay --min-sdk-version 21 --target-sdk-version "$API_LEVEL"
javac -source 8 -target 8 -bootclasspath "$AJ" -cp "$AJ" -d classes \
  $(find src gen -name '*.java') 2>/dev/null || javac -bootclasspath "$AJ" -cp "$AJ" -d classes $(find src gen -name '*.java')
"$BT/d8" --lib "$AJ" --min-api 21 --output . $(find classes -name '*.class')
cp base.apk unsigned.apk && zip -q -j unsigned.apk classes.dex
"$BT/zipalign" -f 4 unsigned.apk aligned.apk
keytool -genkeypair -keystore release.jks -storepass zyraxon -keypass zyraxon \
  -alias zyraxon -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=$APP_NAME,OU=Lab,O=OnlyPowerAI,C=BD"
mkdir -p "$(dirname "$WORK")/out"
"$BT/apksigner" sign --ks release.jks --ks-pass pass:zyraxon --key-pass pass:zyraxon \
  --out "$(pwd)/../out/app-release.apk" aligned.apk
"$BT/apksigner" verify "$(pwd)/../out/app-release.apk"
# A signed APK without its dex installs and then shows nothing, so fail here
# rather than publish a hollow build.
unzip -l "$(pwd)/../out/app-release.apk" | grep -q "classes.dex" \
  || { echo "classes.dex missing from the signed APK" >&2; exit 1; }
echo "APK ready: $(pwd)/../out/app-release.apk"
