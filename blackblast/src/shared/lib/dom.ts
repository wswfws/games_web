import { BOARD_SIZE } from '@/shared/config/game';

/**
 * Переводит координаты указателя в клетку поля (якорь — верх-лево фигуры,
 * фигура центрируется под курсором). Чистая функция, удобна для тестов.
 */
export function boardCellFromPoint(
  rect: { left: number; top: number; width: number },
  clientX: number,
  clientY: number,
  shapeCells: number[][],
  gap = 4,
): { row: number | null; col: number | null } {
  const h = shapeCells.length;
  const w = shapeCells[0].length;
  const cell = (rect.width - gap * (BOARD_SIZE - 1)) / BOARD_SIZE;
  const px = clientX - rect.left - ((w * cell + (w - 1) * gap) / 2);
  const py = clientY - rect.top - ((h * cell + (h - 1) * gap) / 2);
  const col = Math.round(px / (cell + gap));
  const row = Math.round(py / (cell + gap));
  return { row, col };
}
