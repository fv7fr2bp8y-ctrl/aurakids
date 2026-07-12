# Качване в магазините — AuraKids Приказки & Комикси

Две приложения, всяко за Google Play и App Store. Уебът е **безплатно демо**
(1 приказка + 1 комикс); магазинните приложения зареждат сайта с `?full=1`,
което **отключва неограничено генериране** завинаги на устройството.

| | Приказки | Комикси |
|---|---|---|
| Package / App ID | `fun.aurakids.stories` | `fun.aurakids.comics` |
| URL (пълна версия) | `https://aurakids.fun/prikazki?full=1` | `https://aurakids.fun/komiksi?full=1` |
| TWA manifest | `store/twa-manifest.story.json` | `store/twa-manifest.comic.json` |
| Capacitor config | `store/capacitor.story.json` | `store/capacitor.comic.json` |
| Икона | `/api/icon?app=story` | `/api/icon?app=comic` |

Текстовете за листингите са в `store/listings.md`.

---

## 0. Преди всичко

Аккаунти (твоя стъпка):
- **Google Play Console** — $25 еднократно
- **Apple Developer** — $99/год + Mac с Xcode за iOS билд

---

## 1. Android (TWA чрез Bubblewrap)

За **всяко** приложение:

```bash
npm i -g @bubblewrap/cli

# Приказки
bubblewrap init --manifest store/twa-manifest.story.json
bubblewrap build            # създава app-release-signed.aab + подписващ ключ

# Комикси (в отделна папка)
bubblewrap init --manifest store/twa-manifest.comic.json
bubblewrap build
```

При първия `build` Bubblewrap създава keystore. Вземи SHA-256 отпечатъка:

```bash
keytool -list -v -keystore android.keystore -alias aurakids | grep SHA256
```

### Digital Asset Links (верификация на домейна)
Домейнът вече отдава `/.well-known/assetlinks.json` динамично. Задай във Vercel env:

```
ANDROID_PACKAGE_STORY=fun.aurakids.stories
ANDROID_PACKAGE_COMIC=fun.aurakids.comics
ANDROID_FINGERPRINTS_STORY=<SHA256 на ключа за Приказки>
ANDROID_FINGERPRINTS_COMIC=<SHA256 на ключа за Комикси>
```

Провери: `https://aurakids.fun/.well-known/assetlinks.json` показва двата пакета.
> Play подписва наново с App Signing — добави и **онзи** SHA-256 от Play Console
> (App integrity → App signing) към същата env променлива, разделено със запетая.

Качи всеки `.aab` в Play Console → нов app → Production.

---

## 2. iOS (Capacitor обвивка)

За **всяко** приложение (на Mac):

```bash
npm i @capacitor/core @capacitor/ios
npx cap init            # или копирай store/capacitor.story.json → capacitor.config.json
npx cap add ios
npx cap sync ios
npx cap open ios        # отваря Xcode → Archive → Distribute
```

Използвай `store/capacitor.story.json` за Приказки и `store/capacitor.comic.json`
за Комикси (сменяш `appId`, `appName`, `server.url`). Обвивката зарежда живия сайт,
така че всяка промяна по уеба важи веднага, без нов билд.

В Xcode задай Bundle ID = `fun.aurakids.stories` / `fun.aurakids.comics`, иконата
(изтегли от `/api/icon?size=1024&app=story|comic`) и качи през App Store Connect.

---

## 3. Икони и screenshots

- **Икона 1024×1024:** `https://aurakids.fun/api/icon?size=1024&app=story` (и `=comic`)
- **Feature graphic / screenshots:** заснеми `/prikazki` и `/komiksi` на телефон
  (или Chrome DevTools device mode 1080×1920). Нужни са 2–8 на приложение.

---

## 4. Финален чеклист

- [ ] `ADMIN_KEY` зададен във Vercel (иначе `/admin` и диагностиката са заключени)
- [ ] Всички API ключове в production env (Anthropic, OpenAI, Google/Gemini, Supabase)
- [ ] `ANDROID_FINGERPRINTS_*` зададени → assetlinks.json верен
- [ ] `.aab` × 2 качени в Play
- [ ] `.ipa` × 2 качени в App Store Connect
- [ ] Листинги от `store/listings.md`, възрастов рейтинг 4+, категория Kids/Education
- [x] Privacy policy URL: **https://aurakids.fun/privacy** (BG + EN, готова)
