/**
 * Общая симуляция для скриптов (bench, tune). Повторяет useGameSession 1-в-1:
 * выдача лотка, установка, сжигание линий, стрик в очках, конец игры.
 */
import { applyPlace, clearFullLines, emptyBoard } from '@/entities/board';
import { newTray, shapeCellCount } from '@/entities/piece';
import { scoreForMove } from '@/entities/score';
import { suggestAiMove, type AiTuning } from '@/features/ai-move';
import { checkGameOver } from '@/features/game-session/lib/check-game-over';

/** Детерминированный RNG, чтобы прогоны были сравнимы между собой */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GameResult {
  score: number;
  moves: number;
}

export function playGame(depth: number, tuning: AiTuning): GameResult {
  let board = emptyBoard();
  let tray = newTray();
  let score = 0;
  let moves = 0;
  let streak = 0;
  for (;;) {
    if (tray.every((p) => p.used)) tray = newTray();
    if (checkGameOver(board, tray)) break;
    const suggestion = suggestAiMove(board, tray, depth, tuning);
    if (!suggestion) break;
    const piece = tray.find((p) => p.uid === suggestion.move.uid);
    if (!piece) break;
    const placed = shapeCellCount(piece.shape);
    const cleared = clearFullLines(
      applyPlace(board, piece.shape.cells, suggestion.move.row, suggestion.move.col, piece.color),
    );
    const lines = cleared.clearedRows.length + cleared.clearedCols.length;
    const { gained } = scoreForMove(
      placed,
      cleared.clearedCells,
      lines,
      cleared.clearedCells > 0 ? streak : 0,
    );
    score += gained;
    streak = cleared.clearedCells > 0 ? streak + 1 : 0;
    board = cleared.board;
    tray = tray.map((p) => (p.uid === piece.uid ? { ...p, used: true } : p));
    moves++;
    if (moves > 10000) break; // страховка от бесконечной игры
  }
  return { score, moves };
}

/**
 * Средний счёт тюнинга на фиксированных сидах (common random numbers —
 * все кандидаты играют одни и те же партии, сравнение честное).
 */
export function evaluateTuning(
  tuning: AiTuning,
  depth: number,
  games: number,
  seedBase: number,
): { avg: number; moves: number } {
  let sum = 0;
  let moves = 0;
  for (let i = 0; i < games; i++) {
    Math.random = mulberry32(seedBase + i);
    const r = playGame(depth, tuning);
    sum += r.score;
    moves += r.moves;
  }
  return { avg: sum / games, moves: moves / games };
}
