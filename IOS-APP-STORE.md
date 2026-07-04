# AuraKids → App Store (iOS през Capacitor)

Обвиваме живия сайт aurakids.fun в native iOS контейнер.
`capacitor.config.json` вече е в репото.

## Изисквания (задължително Mac)
- **macOS** + **Xcode** (безплатен от App Store)
- **Apple Developer акаунт** — $99/година
- Node.js (имаш го)

## 1. Инсталирай Capacitor
```bash
npm install @capacitor/core @capacitor/ios @capacitor/splash-screen
npx cap add ios
```

## 2. Синхронизирай конфигурацията
```bash
npx cap sync ios
```

## 3. Отвори в Xcode
```bash
npx cap open ios
```
В Xcode:
- **Signing & Capabilities** → избери своя Apple Developer team
- **Bundle Identifier**: `fun.aurakids.app`
- Сложи иконата: App → Assets → AppIcon (използвай `public/icon-512.png`, мащабирано)
- Стартирай на симулатор или реален iPhone (▶)

## 4. Икони и splash
Генерирай пълния комплект икони:
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --ios
```
(сложи изходна икона 1024×1024 в `assets/icon.png` първо)

## 5. Качи в App Store
- Xcode → Product → Archive
- Distribute App → App Store Connect → Upload
- В **App Store Connect**: попълни описание, screenshots (задължителни за
  6.7" и 5.5" екрани), политика за поверителност, категория (Education / Kids)
- Изпрати за ревю (1–3 дни обикновено)

## ⚠️ Риск от отхвърляне (Guideline 4.2)
Apple може да откаже "само обвивка на сайт". За да минеш:
- Приложението има реална стойност (генериране на приказки, глас, offline четене)
- Добави поне 1–2 native функции: push нотификации (@capacitor/push-notifications)
  или native споделяне (@capacitor/share) — вече ползваме Web Share, но native е по-силен аргумент
- В описанието подчертай уникалната функционалност, не "разгледай нашия сайт"

## Ъпдейти
Понеже съдържанието идва от aurakids.fun, промените се виждат веднага —
нов билд трябва само при смяна на икона/native настройки.
