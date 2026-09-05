import { BOARD_SIZE } from '@/shared/config/game';
import { applyPlace, canPlace, clearFullLines, type Board } from '@/entities/board';
import { shapeCellCount, type TrayPiece } from '@/entities/piece';
import { AI_TUNING, type AiTuning } from '../config/tuning';

export interface AiMove {
  uid: string;
  row: number;
  col: number;
}

export interface AiSuggestion {
  move: AiMove;
  score: number;
}

function allPlacements(board: Board, cells: number[][]): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, cells, r, c)) out.push({ row: r, col: c });
    }
  }
  return out;
}

interface SimResult {
  board: Board;
  gain: number;
  streakOut: number;
}

/**
 * Симуляция хода: положить фигуру, сжечь линии, начислить очки.
 * Стрик ведём как в игре (useGameSession): серия очисток подряд даёт бонус.
 */
function simulate(
  board: Board,
  piece: TrayPiece,
  row: number,
  col: number,
  streakIn: number,
  t: AiTuning = AI_TUNING,
): SimResult {
  const placed = shapeCellCount(piece.shape);
  const cleared = clearFullLines(applyPlace(board, piece.shape.cells, row, col, piece.color));
  const lines = cleared.clearedRows.length + cleared.clearedCols.length;
  const effectiveStreak = cleared.clearedCells > 0 ? streakIn : 0;
  let gain = placed + cleared.clearedCells * t.clearCellPoints + effectiveStreak * t.streakBonus;
  if (lines > 1)
    gain += (lines - 1) * t.comboPerExtraLine + (lines >= t.megaComboMinLines ? t.megaComboBonus : 0);
  return { board: cleared.board, gain, streakOut: cleared.clearedCells > 0 ? streakIn + 1 : 0 };
}

/** Вес почти собранной линии — аналог evaluateThreat из примера (3→100, 2→10, 1→1) */
function lineSetupWeight(filled: number, t: AiTuning = AI_TUNING): number {
  if (filled === 7) return t.setupWeight7;
  if (filled === 6) return t.setupWeight6;
  if (filled === 5) return t.setupWeight5;
  return 0;
}

/**
 * Эвристика позиции — аналог evaluatePosition из примера:
 * заделы под будущие очистки минус занятость поля и «дыры».
 */
export function evaluateBoard(board: Board, t: AiTuning = AI_TUNING): number {
  let score = 0;
  let filledTotal = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    let rowFilled = 0;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) {
        rowFilled++;
        filledTotal++;
      }
    }
    score += lineSetupWeight(rowFilled, t);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    let colFilled = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] !== 0) colFilled++;
    }
    score += lineSetupWeight(colFilled, t);
  }
  score -= filledTotal * t.filledCellPenalty;
  // «дыры» — пустые клетки, зажатые со всех сторон: их потом трудно закрыть.
  // Заодно считаем периметр занятой области: рваный край мешает крупным фигурам.
  let holes = 0;
  let perimeter = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) {
        if (r > 0 && board[r - 1][c] === 0) perimeter++;
        if (r < BOARD_SIZE - 1 && board[r + 1][c] === 0) perimeter++;
        if (c > 0 && board[r][c - 1] === 0) perimeter++;
        if (c < BOARD_SIZE - 1 && board[r][c + 1] === 0) perimeter++;
        continue;
      }
      const blocked =
        (r === 0 || board[r - 1][c] !== 0) &&
        (r === BOARD_SIZE - 1 || board[r + 1][c] !== 0) &&
        (c === 0 || board[r][c - 1] !== 0) &&
        (c === BOARD_SIZE - 1 || board[r][c + 1] !== 0);
      if (blocked) holes++;
    }
  }
  score -= holes * t.holePenalty + perimeter * t.perimeterPenalty;
  return score;
}

/**
 * Рекурсивный перебор — аналог GetNextMoveBot из примера:
 * лучший суммарный счёт из оставшихся фигур на глубину depth.
 */
function searchBest(
  board: Board,
  pieces: TrayPiece[],
  depth: number,
  streakIn: number,
  t: AiTuning,
): number {
  if (pieces.length === 0 || depth <= 0) return evaluateBoard(board, t);
  let best = -Infinity;
  let found = false;
  for (const piece of pieces) {
    for (const p of allPlacements(board, piece.shape.cells)) {
      found = true;
      const sim = simulate(board, piece, p.row, p.col, streakIn, t);
      const rest = pieces.filter((x) => x.uid !== piece.uid);
      const total = sim.gain + searchBest(sim.board, rest, depth - 1, sim.streakOut, t);
      if (total > best || (total === best && Math.random() > 0.5)) best = total;
    }
  }
  // остаток фигур не влезает — такой путь ведёт к концу игры, штрафуем
  return found ? best : evaluateBoard(board, t) - t.deadEndPenalty;
}

/**
 * Лучший первый ход: свой ход + лучший ответ из остатка лотка
 * на глубину из AI_TUNING.defaultDepth.
 */
export function suggestAiMove(
  board: Board,
  tray: TrayPiece[],
  depth = AI_TUNING.defaultDepth,
  t: AiTuning = AI_TUNING,
  streak = 0,
): AiSuggestion | null {
  const avail = tray.filter((p) => !p.used);
  if (avail.length === 0) return null;
  let bestMove: AiMove | null = null;
  let bestScore = -Infinity;
  for (const piece of avail) {
    for (const p of allPlacements(board, piece.shape.cells)) {
      const sim = simulate(board, piece, p.row, p.col, streak, t);
      const rest = avail.filter((x) => x.uid !== piece.uid);
      const total = sim.gain + searchBest(sim.board, rest, depth - 1, sim.streakOut, t);
      if (total > bestScore || (total === bestScore && Math.random() > 0.5)) {
        bestScore = total;
        bestMove = { uid: piece.uid, row: p.row, col: p.col };
      }
    }
  }
  return bestMove ? { move: bestMove, score: bestScore } : null;
}
