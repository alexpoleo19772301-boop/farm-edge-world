#!/usr/bin/env bash
# Publish farm-edge update to GitHub Pages + Release
# Usage: ./scripts/publish-update.sh 1.2.0 $'• Changelog line\n• Another'
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
VER="${1:?version e.g. 1.2.0}"
CHANGELOG="${2:-• Обновление $VER}"
OWNER="${GITHUB_OWNER:-alexpoleo19772301-boop}"
REPO="${GITHUB_REPO:-farm-edge-world}"
export JAVA_HOME="${JAVA_HOME:-/home/box/android/jdk-17.0.21+9}"
export ANDROID_HOME="${ANDROID_HOME:-/home/box/android/sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$PATH"

gh auth status >/dev/null
gh auth setup-git >/dev/null 2>&1 || true

IFS=. read -r MA MI PA <<<"$VER"
CODE=$((10#$MA * 10000 + 10#$MI * 100 + 10#$PA))
MANIFEST_URL="https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@main/docs/version.json"
WEB_ZIP_URL="https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@main/docs/www.zip"
# Also mirrored on Pages: https://${OWNER}.github.io/${REPO}/
APK_URL="https://github.com/${OWNER}/${REPO}/releases/latest/download/farm-edge-world-debug.apk"

mkdir -p dist docs www

python3 - "$VER" "$CODE" "$CHANGELOG" "$APK_URL" "$WEB_ZIP_URL" <<'PY'
import json,sys,pathlib,re
ver,code,log,apk,web=sys.argv[1],int(sys.argv[2]),sys.argv[3],sys.argv[4],sys.argv[5]
if '\\n' in log:
  try: log=log.encode().decode('unicode_escape')
  except Exception: pass
doc={"version":ver,"versionCode":code,"apkUrl":apk,"webVersion":ver,"webBundleUrl":web,"force":False,"changelog":log}
text=json.dumps(doc,ensure_ascii=False,indent=2)+"\n"
for p in ["version.json","www/version.json","docs/version.json","dist/version.json"]:
  pathlib.Path(p).write_text(text)
url=f"https://cdn.jsdelivr.net/gh/alexpoleo19772301-boop/farm-edge-world@main/docs/version.json"
for rel in ["index.html","www/index.html"]:
  path=pathlib.Path(rel)
  if not path.exists(): continue
  t=path.read_text()
  t=re.sub(r"version:\s*'[^']*'","version: '%s'"%ver,t,count=1)
  t=re.sub(r"versionCode:\s*\d+","versionCode: %d"%code,t,count=1)
  t=re.sub(r"webVersion:\s*'[^']*'","webVersion: '%s'"%ver,t,count=1)
  t=re.sub(r">v[0-9.]+<",">v%s<"%ver,t,count=1)
  t=re.sub(r"DEFAULT_MANIFEST_URL = localStorage\.getItem\('farm_manifest_url'\) \|\| '[^']*'",
           "DEFAULT_MANIFEST_URL = localStorage.getItem('farm_manifest_url') || '%s'"%url, t)
  path.write_text(t)
print(text)
PY

cp -f index.html www/index.html
cp -f version.json www/version.json
sed -i "s/versionCode [0-9]*/versionCode $CODE/" android/app/build.gradle
sed -i "s/versionName \"[^\"]*\"/versionName \"$VER\"/" android/app/build.gradle

python3 - <<'PY'
import zipfile, pathlib
r=pathlib.Path("www"); 
for o in [pathlib.Path("docs/www.zip"), pathlib.Path("dist/www.zip")]:
  with zipfile.ZipFile(o,"w",zipfile.ZIP_DEFLATED) as z:
    for p in r.rglob("*"):
      if p.is_file() and p.name!="version-test.json":
        z.write(p, p.relative_to(r).as_posix())
  print("wrote", o, o.stat().st_size)
PY

npx cap sync android
( cd android && ./gradlew assembleDebug --quiet )
cp -f android/app/build/outputs/apk/debug/app-debug.apk farm-edge-world-debug.apk
cp -f farm-edge-world-debug.apk "dist/farm-edge-$VER-debug.apk"

# refresh docs zip after apk rebuild (www already set)
python3 - <<'PY'
import zipfile, pathlib
r=pathlib.Path("www"); o=pathlib.Path("docs/www.zip")
with zipfile.ZipFile(o,"w",zipfile.ZIP_DEFLATED) as z:
  for p in r.rglob("*"):
    if p.is_file() and p.name!="version-test.json":
      z.write(p, p.relative_to(r).as_posix())
PY

git add -A
git status --short | head -50
git commit -m "Release v${VER}" || echo "nothing to commit"
git push origin HEAD:main

TAG="v${VER}"
if gh release view "$TAG" >/dev/null 2>&1; then
  gh release upload "$TAG" farm-edge-world-debug.apk --clobber
  gh release edit "$TAG" --notes "v${VER}

${CHANGELOG}

Манифест: ${MANIFEST_URL}
APK: ${APK_URL}
"
else
  gh release create "$TAG" farm-edge-world-debug.apk \
    --title "v${VER}" \
    --notes "v${VER}

${CHANGELOG}

Манифест: ${MANIFEST_URL}
APK: ${APK_URL}
"
fi

echo
echo "Manifest: $MANIFEST_URL"
echo "Web ZIP:  $WEB_ZIP_URL"
echo "APK:      $APK_URL"
echo "Repo:     https://github.com/${OWNER}/${REPO}"
echo "Wait ~30-60s for GitHub Pages to rebuild, then:"
echo "  curl -sI $MANIFEST_URL"
