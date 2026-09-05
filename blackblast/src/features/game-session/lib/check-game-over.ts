import { anyFit } from '@/entities/board';
import type { Board } from '@/entities/board';
import type { TrayPiece } from '@/entities/piece';

/** features/game-session: конец игры — ни одна оставшаяся фигура не влезает */
export function checkGameOver(board: Board, tray: TrayPiece[]): boolean {
  const rest = tray.filter((p) => !p.used);
  if (rest.length === 0) return false; // будет выдан новый набор
  return !rest.some((p) => anyFit(board, p.shape.cells));
}
