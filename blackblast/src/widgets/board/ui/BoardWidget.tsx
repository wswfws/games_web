import type { RefObject } from 'react';
import { BoardGrid, type Board } from '@/entities/board';

interface Props {
  board: Board;
  flash: Set<string>;
  ghosts: (number | null)[][];
  boardRef: RefObject<HTMLDivElement | null>;
  onCellClick: (row: number, col: number) => void;
}

/** widgets/board: поле (обёртка .board-wrap с тостами — на странице) */
export function BoardWidget({ board, flash, ghosts, boardRef, onCellClick }: Props) {
  return (
    <div ref={boardRef} className="board">
      <BoardGrid board={board} flash={flash} ghosts={ghosts} onCellClick={onCellClick} />
    </div>
  );
}
