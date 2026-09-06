# Factory Grid (build_cat)

Стратегия-градостроитель на React 19 + TypeScript + Tailwind 4 (Vite).
Микрофронт в каталоге игр — модуль Module Federation (`remoteEntry.js`).

## Запуск

Из корня монорепо `games_web`:

```bash
npm install
npm run build -w build_cat   # прод-сборка (отдельно)
npm run dev -w build_cat     # дев-сервер на :5174
```

Или через корневой скрипт: `npm run dev` (поднимает каталог + обе игры).

## Структура

```
src/
  app/              App (роутер game/wiki) + глобальные стили
  pages/wiki/       вики игры
  features/game/    чистые функции механики (модель, тики, ресурсы)
  widgets/          game-screen, game-board, building-toolbar
  shared/           entities (типы, константы, поколение карты), правила
```

Вся игровая логика — чистый TypeScript без зависимостей от фреймворка.
Приложение экспортирует `./src/app/App.tsx` как модуль `build_cat/App`.

## Wiki

Правила игры живут в `src/pages/wiki/WikiPage.tsx` — обновляй вместе с новыми механиками.
Проверка: `npm run build`.