import { BOARD_SIZE } from '@/shared/config/game';
import type { Board } from '../model/types';

/**
 * entities/board: чистые функции поля 8x8.
 * Работают с матрицей `cells: number[][]`, чтобы не зависеть от entities/piece.
 */
export function emptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

export function canPlace(board: Board, cells: number[][], row: number, col: number): boolean {
  const h = cells.length;
  const w = cells[0].length;
  if (row < 0 || col < 0 || row + h > BOARD_SIZE || col + w > BOARD_SIZE) return false;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (cells[r][c] && board[row + r][col + c] !== 0) return false;
    }
  }
  return true;
}

export function findPlacements(board: Board, cells: number[][]): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, cells, r, c)) out.push({ row: r, col: c });
    }
  }
  return out;
}

export function anyFit(board: Board, cells: number[][]): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, cells, r, c)) return true;
    }
  }
  return false;
}

export function applyPlace(
  board: Board,
  cells: number[][],
  row: number,
  col: number,
  color: number,
): Board {
  const next = board.map((r) => [...r]);
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[0].length; c++) {
      if (cells[r][c]) next[row + r][col + c] = color;
    }
  }
  return next;
}

export interface ClearResult {
  board: Board;
  clearedRows: number[];
  clearedCols: number[];
  clearedCells: number;
}

/** Найти полные строки/столбцы и очистить их */
export function clearFullLines(board: Board): ClearResult {
  const clearedRows: number[] = [];
  const clearedCols: number[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every((v) => v !== 0)) clearedRows.push(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === 0) {
        full = false;
        break;
      }
    }
    if (full) clearedCols.push(c);
  }
  if (clearedRows.length === 0 && clearedCols.length === 0) {
    return { board, clearedRows, clearedCols, clearedCells: 0 };
  }
  const next = board.map((r) => [...r]);
  const mark = new Set<string>();
  for (const r of clearedRows) for (let c = 0; c < BOARD_SIZE; c++) mark.add(`${r}:${c}`);
  for (const c of clearedCols) for (let r = 0; r < BOARD_SIZE; r++) mark.add(`${r}:${c}`);
  for (const key of mark) {
    const [r, c] = key.split(':').map(Number);
    next[r][c] = 0;
  }
  return { board: next, clearedRows, clearedCols, clearedCells: mark.size };
}
