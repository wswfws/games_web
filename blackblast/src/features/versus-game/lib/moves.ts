import { BOARD_SIZE } from '@/shared/config/game';
import { applyPlace, clearFullLines, type Board } from '@/entities/board';
import { randomPiece, shapeCellCount, type TrayPiece } from '@/entities/piece';
import { scoreForMove } from '@/entities/score';

export type VersusSide = 'human' | 'bot';

export interface VersusPlaced {
  board: Board;
  tray: TrayPiece[];
  gained: number;
  streak: number;
  flashKeys: Set<string>;
  comboText: string | null;
  /** Клетки поставленной фигуры, которые остались на поле после сжигания */
  placedKeys: Set<string>;
}

/**
 * features/versus-game: чистая функция хода на общем поле.
 * Очки — той же формулой, что в соло; фигура восполняется сразу.
 */
export function commitVersusMove(
  board: Board,
  tray: TrayPiece[],
  piece: TrayPiece,
  row: number,
  col: number,
  streakIn: number,
): VersusPlaced {
  const placed = shapeCellCount(piece.shape);
  const afterPlace = applyPlace(board, piece.shape.cells, row, col, piece.color);
  const cleared = clearFullLines(afterPlace);
  const lines = cleared.clearedRows.length + cleared.clearedCols.length;
  const effectiveStreak = cleared.clearedCells > 0 ? streakIn : 0;
  const { gained, comboBonus } = scoreForMove(placed, cleared.clearedCells, lines, effectiveStreak);

  const flashKeys = new Set<string>();
  for (const r of cleared.clearedRows) for (let c = 0; c < BOARD_SIZE; c++) flashKeys.add(`${r}:${c}`);
  for (const c of cleared.clearedCols) for (let r = 0; r < BOARD_SIZE; r++) flashKeys.add(`${r}:${c}`);

  const placedKeys = new Set<string>();
  for (let pr = 0; pr < piece.shape.cells.length; pr++) {
    for (let pc = 0; pc < piece.shape.cells[0].length; pc++) {
      if (!piece.shape.cells[pr][pc]) continue;
      const rr = row + pr;
      const cc = col + pc;
      if (cleared.board[rr][cc] !== 0) placedKeys.add(`${rr}:${cc}`);
    }
  }

  let comboText: string | null = null;
  if (lines >= 2) {
    comboText = lines >= 3 ? `🔥 Комбо x${lines}!` : `Комбо x${lines}!`;
  } else if (effectiveStreak > 0) {
    comboText = `Стрик ${effectiveStreak + 1}! +${comboBonus}`;
  }

  return {
    board: cleared.board,
    tray: tray.map((p) => (p.uid === piece.uid ? randomPiece() : p)),
    gained,
    streak: cleared.clearedCells > 0 ? streakIn + 1 : 0,
    flashKeys,
    comboText,
    placedKeys,
  };
}
