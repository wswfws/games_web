# Block Blast

Клон головоломки Block Blast на React + TypeScript (Vite). Поле 8×8, лоток на 3 фигуры, очистка полных строк и столбцов, комбо-бонусы, рекорд в localStorage. Фулскрин-лейаут под десктоп и мобильные.

## Запуск

```bash
npm install
npm run dev      # дев-сервер
npm run build    # проверка типов + прод-сборка
npm run preview  # предпросмотр сборки
```

Требуется Node.js 20+.

## Правила

- Перетащи фигуру из нижнего дока на поле (или выбери фигуру и кликни клетку).
- Полные строки и столбцы сгорают.
- Очки: +1 за каждую клетку фигуры, +10 за каждую сгоревшую клетку, бонус за несколько линий сразу и за серию очисток подряд.
- Когда в лотке закончились фигуры — выдаётся новый набор.
- Игра заканчивается, когда ни одну оставшуюся фигуру некуда поставить.

## Стек

- React 19, TypeScript (strict), Vite
- Без стейт-менеджеров и UI-библиотек — только React-хуки и CSS
- Архитектура — Feature-Sliced Design, импорт через алиас `@` → `src/`

## Структура `src/`

```
app/                      композиция: App, глобальные стили
pages/game-page/          страница: раскладка виджетов
widgets/                  score-header, board, piece-tray,
                          float-messages, game-over-modal
features/game-session/    хук useGameSession — вся механика:
                          установка, стрик/комбо, drag&drop,
                          выбор фигуры, рестарт, конец игры
entities/
  board/                  типы, чистые функции поля
                          (canPlace/applyPlace/clearFullLines),
                          презентационный BoardGrid
  piece/                  ShapeDef/TrayPiece/DragState, каталог
                          из 30+ фигур, рандом, PieceView/DragPreview
  score/                  подсчёт очков, рекорд (localStorage)
shared/                   константы (размеры, палитра),
                          геометрия указателя, Button
```

Зависимости идут строго сверху вниз: `app → pages → widgets → features → entities → shared`. Игровая логика — чистые функции в `entities`, состояние и оркестрация — в `features/game-session`, компоненты — презентационные.
