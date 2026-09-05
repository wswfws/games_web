import type { RefObject } from 'react';
import { BoardGrid, type Board, type GridMark } from '@/entities/board';

interface Props {
  board: Board;
  flash: Set<string>;
  ghosts: (number | null)[][];
  marks?: GridMark[];
  boardRef: RefObject<HTMLDivElement | null>;
  onCellClick: (row: number, col: number) => void;
}

/** widgets/board: поле (обёртка .board-wrap с тостами — на странице) */
export function BoardWidget({ board, flash, ghosts, marks, boardRef, onCellClick }: Props) {
  return (
    <div ref={boardRef} className="board">
      <BoardGrid
        board={board}
        flash={flash}
        ghosts={ghosts}
        marks={marks}
        onCellClick={onCellClick}
      />
    </div>
  );
}
