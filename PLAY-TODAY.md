# Google Play — качване днес (без инструменти на компютъра)

Най-бързият път: **PWABuilder** прави подписан `.aab` направо от URL-а, в браузъра.
Правим двете приложения (можеш да започнеш само с едното).

| | Приказки | Комикси |
|---|---|---|
| URL за пакетиране | `https://aurakids.fun/prikazki` | `https://aurakids.fun/komiksi` |
| Package name | `fun.aurakids.stories` | `fun.aurakids.comics` |
| **Launch URL** (важно!) | `/prikazki?full=1` | `/komiksi?full=1` |
| Vercel env за отпечатъка | `ANDROID_FINGERPRINTS_STORY` | `ANDROID_FINGERPRINTS_COMIC` |

> „Launch URL" с `?full=1` отключва пълната (платена) версия само в приложението.
> Уебът остава демо (1 приказка + 1 комикс).

## Стъпки

### 1. Google Play Console
Създай акаунт: https://play.google.com/console → $25 еднократно. (Понякога проверката
на самоличност отнема време — направи го първо.)

### 2. Пакетирай с PWABuilder
1. Отвори https://www.pwabuilder.com → въведи `https://aurakids.fun/prikazki` → **Start**.
2. Горе → **Package For Stores** → **Android** → **Generate Package**.
3. В опциите (Android):
   - **Package ID:** `fun.aurakids.stories`
   - **App name:** `AuraKids Приказки`
   - **Launcher name:** `Приказки`
   - **Start URL / Launch URL:** `/prikazki?full=1`  ← смени от `/prikazki`
   - Signing key: **New** (PWABuilder генерира ключ)
4. **Download** → получаваш ZIP с:
   - `app-release-signed.aab` ← това качваш в Play
   - подписващ ключ `.keystore` + паролите → **ПАЗИ ГИ** (без тях няма ъпдейти!)
   - `assetlinks.json` → съдържа SHA-256 отпечатъка

### 3. Свържи домейна (assetlinks)
От `assetlinks.json` (или PWABuilder екрана) вземи `sha256_cert_fingerprints`.
Във Vercel → проект aurakids → Settings → Environment Variables:
```
ANDROID_FINGERPRINTS_STORY = <SHA256 отпечатъка>
```
Redeploy. Провери: `https://aurakids.fun/.well-known/assetlinks.json` вече показва пакета.

> ⚠️ След качване Google подписва наново (Play App Signing). Отвори Play Console →
> **App integrity → App signing → SHA-256** и **добави и този отпечатък** към същата
> env променлива, разделен със запетая. Иначе TWA-то ще показва адрес-бар.

### 4. Създай приложението в Play Console
- **Create app** → име `AuraKids Приказки`, език BG, App, Free.
- **Production** (или първо Internal testing) → **Create release** → качи `.aab`.
- Store listing: текстовете от `store/listings.md`.
- Икона 512×512: `https://aurakids.fun/api/icon?size=512&app=story`
  Feature graphic 1024×500: направи от корицата (или ми кажи да генерирам).
- Screenshots: 2–8 бр. от телефон на `/prikazki` (или Chrome DevTools 1080×1920).
- **Content rating** въпросник → ще излезе 3+/PEGI 3.
- **Data safety**: събира „App activity" (създадено съдържание), без споделяне, без реклами.
- **Privacy policy:** `https://aurakids.fun/privacy`
- Изпрати за преглед.

### 5. Повтори за Комикси
Същото с `https://aurakids.fun/komiksi`, package `fun.aurakids.comics`,
Launch URL `/komiksi?full=1`, отпечатъкът → `ANDROID_FINGERPRINTS_COMIC`.

---

**Обобщено днес:** акаунт → PWABuilder × (1 или 2) → отпечатъци в env → качи `.aab` +
листинг → submit. Прегледът на Google обикновено отнема от няколко часа до 2–3 дни.
