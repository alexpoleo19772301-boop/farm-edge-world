# Автообновления — Ферма на краю света

## Как работает
1. При старте игры вызывается `checkForUpdates()`.
2. Приложение GET-запросом читает публичный `version.json` (URL из `localStorage.farm_manifest_url` или встроенный `DEFAULT_MANIFEST_URL`).
3. Сравнивает `versionCode` / semver с встроенной версией APK и `webVersion` live-контента.
4. Если новее **webBundleUrl** — диалог «Доступно обновление», скачивание ZIP, распаковка в `files/live-www`, `bridge.setServerBasePath` + reload (без переустановки APK).
5. Если новее **apkUrl** — скачивание APK в cache, установка через `FileProvider` + `REQUEST_INSTALL_PACKAGES` (иначе fallback: открыть URL в браузере).

## Манифест
```json
{
  "version": "1.1.0",
  "versionCode": 2,
  "apkUrl": "https://example.com/farm-edge-1.1.0-debug.apk",
  "webVersion": "1.1.0",
  "webBundleUrl": "https://example.com/www.zip",
  "force": false,
  "changelog": "• пункт"
}
```

## Публикация
```bash
./scripts/publish-update.sh 1.2.0 $'• Новое\n• Фикс'
# залить dist/* на HTTPS-хост, прописать URL в version.json, залить version.json
```

## Настройка URL в уже установленном приложении
В любом WebView-консольном доступе или временной кнопке:
`localStorage.setItem('farm_manifest_url','https://YOUR/version.json')`

Либо замените `DEFAULT_MANIFEST_URL` в `www/index.html` и пересоберите APK.

## Хостинг
Нужен стабильный HTTPS без обязательного логина в приложении.
На этой машине: `gh` не авторизован; catbox.moe сейчас не принимает загрузки.
Подходит: GitHub Releases (нужен ваш аккаунт), Cloudflare R2/Pages, любой VPS/S3 public object.

## CORS
Браузерный режим требует `Access-Control-Allow-Origin: *` на `version.json` (и желательно на zip/apk).
В установленном APK манифест читается **нативно** (`AppUpdate.fetchManifest`) — CORS не нужен.
