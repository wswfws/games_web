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

export type AiMode = 'solo' | 'versus';

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

/**
 * Вес почти собранной линии — аналог evaluateThreat из примера (3→100, 2→10, 1→1).
 * В соло задел — это будущие очки (бонус). В versus почти собранная линия —
 * «утечка»: её может добить соперник, поэтому веса идут со знаком минус.
 */
function lineWeight(filled: number, t: AiTuning = AI_TUNING, mode: AiMode = 'solo'): number {
  if (mode === 'versus') {
    if (filled === 7) return -t.leakWeight7;
    if (filled === 6) return -t.leakWeight6;
    if (filled === 5) return -t.leakWeight5;
    return 0;
  }
  if (filled === 7) return t.setupWeight7;
  if (filled === 6) return t.setupWeight6;
  if (filled === 5) return t.setupWeight5;
  return 0;
}

/**
 * Эвристика позиции — аналог evaluatePosition из примера:
 * заделы/утечки линий минус занятость поля, «дыры» и рваный периметр.
 */
export function evaluateBoard(board: Board, t: AiTuning = AI_TUNING, mode: AiMode = 'solo'): number {
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
    score += lineWeight(rowFilled, t, mode);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    let colFilled = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] !== 0) colFilled++;
    }
    score += lineWeight(colFilled, t, mode);
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

/**
 * Versus-режим: минимакс на «своих» бот / соперник. Лотки обоих видны,
 * поэтому ход бота оценивается вместе с лучшим ответом соперника
 * (тот максимизирует свой марж — для бота это ухудшение значения узла).
 * Значение узла — очки бота минус очки соперника; листья — эвристика versus.
 */
function versusSearch(
  board: Board,
  myPieces: TrayPiece[],
  oppPieces: TrayPiece[],
  streak: number,
  oppStreak: number,
  depthLeft: number,
  myTurn: boolean,
  t: AiTuning,
): number {
  if (depthLeft <= 0) return evaluateBoard(board, t, 'versus');

  // соперник играет оптимально против нас (min по нашей марже, gain — с минусом)
  const pieces = myTurn ? myPieces : oppPieces;
  const piecesStreak = myTurn ? streak : oppStreak;
  let found = false;
  let best = myTurn ? -Infinity : Infinity;
  for (const piece of pieces) {
    for (const p of allPlacements(board, piece.shape.cells)) {
      found = true;
      const sim = simulate(board, piece, p.row, p.col, piecesStreak, t);
      const rest = pieces.filter((x) => x.uid !== piece.uid);
      const child = myTurn
        ? versusSearch(sim.board, rest, oppPieces, sim.streakOut, oppStreak, depthLeft - 1, false, t)
        : versusSearch(sim.board, myPieces, rest, streak, sim.streakOut, depthLeft - 1, true, t);
      const total = myTurn ? sim.gain + child : child - sim.gain * t.oppGainPenalty;
      if (myTurn) {
        if (total > best || (total === best && Math.random() > 0.5)) best = total;
      } else if (total < best) {
        best = total;
      }
    }
  }
  if (found) return best;
  // ходить нечем: своему — тупик, сопернику — пас без последствий
  return myTurn ? evaluateBoard(board, t, 'versus') - t.deadEndPenalty : evaluateBoard(board, t, 'versus');
}

/**
 * Лучший первый ход для versus: свой ход + ответы соперника (минимакс).
 * Глубина — AI_TUNING.versusDepth (быстрее соло, чтобы партия не тормозила).
 */
export function suggestVersusMove(
  board: Board,
  myTray: TrayPiece[],
  oppTray: TrayPiece[],
  depth = AI_TUNING.versusDepth,
  t: AiTuning = AI_TUNING,
  streak = 0,
  oppStreak = 0,
): AiSuggestion | null {
  const avail = myTray.filter((p) => !p.used);
  const opp = oppTray.filter((p) => !p.used);
  if (avail.length === 0) return null;
  let bestMove: AiMove | null = null;
  let bestScore = -Infinity;
  for (const piece of avail) {
    for (const p of allPlacements(board, piece.shape.cells)) {
      const sim = simulate(board, piece, p.row, p.col, streak, t);
      const rest = avail.filter((x) => x.uid !== piece.uid);
      const total = sim.gain + versusSearch(sim.board, rest, opp, sim.streakOut, oppStreak, depth - 1, false, t);
      if (total > bestScore || (total === bestScore && Math.random() > 0.5)) {
        bestScore = total;
        bestMove = { uid: piece.uid, row: p.row, col: p.col };
      }
    }
  }
  return bestMove ? { move: bestMove, score: bestScore } : null;
}
