# AuraKids → Google Play (TWA през Bubblewrap)

AuraKids вече е PWA. За Play Store го опаковаме като **Trusted Web Activity** —
тънко Android приложение, което показва aurakids.fun на цял екран без браузър.

## Какво ти трябва (еднократно)
- Node.js (имаш го)
- Java JDK 17+  → `java -version`
- Регистрация в **Google Play Console** (еднократна такса $25)

## 1. Инсталирай Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

## 2. Инициализирай проекта
```bash
bubblewrap init --manifest https://aurakids.fun/manifest.webmanifest
```
Отговори на въпросите:
- **Package name**: `fun.aurakids.twa`  (трябва да съвпада с assetlinks.json)
- **App name**: AuraKids
- **Display mode**: standalone
- **Orientation**: portrait
- Останалите — Enter за default (взима се от manifest-а)

Bubblewrap ще генерира signing ключ — **запази паролата и .keystore файла на сигурно място!**
Без тях не можеш да пускаш ъпдейти.

## 3. Вземи SHA-256 отпечатъка
```bash
bubblewrap fingerprint
```
Копирай `SHA-256` стойността.

## 4. Обнови assetlinks.json
Замени `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` в
`public/.well-known/assetlinks.json` с отпечатъка от стъпка 3,
после commit + push + deploy. Провери, че се отваря:
`https://aurakids.fun/.well-known/assetlinks.json`

## 5. Билдни приложението
```bash
bubblewrap build
```
Получаваш `app-release-bundle.aab` (за Play Store) и `app-release-signed.apk` (за тест).

## 6. Качи в Play Console
- Create app → качи `.aab` в Production (или Internal testing първо)
- Попълни: описание, икона (512×512 → има я в `public/icon-512.png`),
  screenshots (2+ от телефона), политика за поверителност (задължителна)
- Изпрати за ревю (обикновено 1–3 дни)

## Ъпдейти на съдържанието
Понеже TWA показва живия сайт, всяка промяна на aurakids.fun се вижда
веднага в приложението — **не трябва нов билд**. Нов `.aab` е нужен само
при смяна на икона, име или Android настройки.
```
```
