# Две отделни приложения от една кодова база

Едно repo, три възможни build-а, избирани чрез променливата `NEXT_PUBLIC_APP`:

| `NEXT_PUBLIC_APP` | Приложение | Начален екран | Библиотека (localStorage) | Икона |
|---|---|---|---|---|
| _(празно)_ / `both` | AuraKids (комбинирано) | Двете „врати" + маркетинг секции | `ak-library` | `app-icon.png` |
| `story` | AuraKids Приказки | Директно към приказки | `ak-library-story` | `app-icon.png` |
| `comic` | AuraKids Комикси | Директно към комикси | `ak-library-comic` | `app-icon-comic.png` |

Всичко останало (API маршрути, генериране, TTS, i18n) е споделено — поправка на едно място важи и за трите.

## Как се пускат двете приложения (само уеб/PWA)

Всяко приложение = **отделен Vercel проект от същото repo и branch**, различаващ се само по env променливата и домейна.

### 1. AuraKids Приказки
- Нов Vercel проект → import на repo `fv7fr2bp8y-ctrl/aurakids`
- Production branch: същия
- Environment Variables: `NEXT_PUBLIC_APP=story` (плюс същите ключове като основния проект: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, Supabase, TTS и т.н.)
- Домейн: напр. `prikazki.aurakids.fun`

### 2. AuraKids Комикси
- Още един Vercel проект от същото repo
- Environment Variables: `NEXT_PUBLIC_APP=comic` + същите ключове
- Домейн: напр. `komiksi.aurakids.fun`

### 3. Комбинираното (по избор)
- Текущият проект `aurakids` остава без `NEXT_PUBLIC_APP` (или `both`) на `aurakids.fun`.

## Локално

```bash
NEXT_PUBLIC_APP=story npm run dev   # приказки
NEXT_PUBLIC_APP=comic npm run dev   # комикси
npm run dev                          # комбинирано
```

## Икони

`/api/icon?app=story|comic|both&size=NNN[&padded=1]` генерира всеки размер on-the-fly
от съответната брандова икона в Supabase. Manifest, favicon и apple-touch-icon
на всеки build сочат автоматично към правилния вариант.

> Комикс иконата (`app-icon-comic.png`) сега е комикс логото от кита. Ако искаш
> различна/по-квадратна икона за комикс приложението, качи я в Supabase като
> `app-icon-comic.png` (или ми кажи кой файл от кита) и се сменя без промяна в кода.
