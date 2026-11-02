#!/usr/bin/env bash
# Publish a farm-edge update: bump, build web zip + APK, write version.json
# Usage:
#   ./scripts/publish-update.sh 1.2.0 "• Фикс полива\n• Новый гибрид"
# Then host the three artifacts (version.json, apk, www.zip) on ANY HTTPS host
# and put the public version.json URL into the app:
#   localStorage.setItem('farm_manifest_url', 'https://YOUR_HOST/version.json')
# Or rebuild the APK after editing DEFAULT_MANIFEST_URL in www/index.html.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VER="${1:?version e.g. 1.2.0}"
CHANGELOG="${2:-• Обновление $VER}"
export JAVA_HOME="${JAVA_HOME:-/home/box/android/jdk-17.0.21+9}"
export ANDROID_HOME="${ANDROID_HOME:-/home/box/android/sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$PATH"

# derive versionCode from semver: major*10000+minor*100+patch
IFS=. read -r MA MI PA <<<"$VER"
CODE=$((10#$MA * 10000 + 10#$MI * 100 + 10#$PA))

cd "$ROOT"
mkdir -p dist
# sync web
cp -f index.html www/index.html
# patch embedded APP_VERSION in html if present
python3 - "$VER" "$CODE" <<'PY'
import sys,re,pathlib
ver,code=sys.argv[1],sys.argv[2]
for rel in ['index.html','www/index.html']:
 p=pathlib.Path(rel)
 t=p.read_text()
 t=re.sub(r"version:\s*'[^']*'", f"version: '{ver}'", t, count=1)
 t=re.sub(r"versionCode:\s*\d+", f"versionCode: {code}", t, count=1)
 t=re.sub(r"webVersion:\s*'[^']*'", f"webVersion: '{ver}'", t, count=1)
 t=re.sub(r">v[0-9.]+<", f">v{ver}<", t, count=1)
 p.write_text(t)
print('html version ->', ver, code)
PY

# android version
sed -i "s/versionCode [0-9]*/versionCode $CODE/" android/app/build.gradle
sed -i "s/versionName \"[^\"]*\"/versionName \"$VER\"/" android/app/build.gradle

# web bundle
rm -f dist/www.zip
python3 - <<'PYZ'
import zipfile, pathlib
r=pathlib.Path("www"); o=pathlib.Path("dist/www.zip")
with zipfile.ZipFile(o,"w",zipfile.ZIP_DEFLATED) as z:
  for p in r.rglob("*"):
    if p.is_file(): z.write(p, p.relative_to(r).as_posix())
print("wrote", o, o.stat().st_size)
PYZ
npx cap sync android >/dev/null
( cd android && ./gradlew assembleDebug --quiet )
cp -f android/app/build/outputs/apk/debug/app-debug.apk "dist/farm-edge-$VER-debug.apk"
cp -f "dist/farm-edge-$VER-debug.apk" farm-edge-world-debug.apk

# version.json with empty URLs — fill after upload
python3 - "$VER" "$CODE" "$CHANGELOG" <<'PY'
import json,sys,pathlib
ver,code,log=sys.argv[1],int(sys.argv[2]),sys.argv[3]
doc={
  "version": ver,
  "versionCode": code,
  "apkUrl": "",
  "webVersion": ver,
  "webBundleUrl": "",
  "force": False,
  "changelog": log.encode().decode('unicode_escape') if '\\n' in log else log,
}
pathlib.Path('version.json').write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n')
pathlib.Path('dist/version.json').write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n')
pathlib.Path('www/version.json').write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(doc,ensure_ascii=False,indent=2))
PY

cat <<MSG

Artifacts in $ROOT/dist :
  - farm-edge-$VER-debug.apk
  - www.zip
  - version.json

Host them on HTTPS (GitHub Release, Cloudflare R2 public, your VPS, etc.),
then edit dist/version.json apkUrl + webBundleUrl to the public links,
re-upload version.json, and set the app manifest URL:

  In Chrome remote console / Книга → or rebuild with DEFAULT_MANIFEST_URL set.
  localStorage.setItem('farm_manifest_url','https://HOST/version.json')

MSG
