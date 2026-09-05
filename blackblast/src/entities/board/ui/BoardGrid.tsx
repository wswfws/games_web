import { COLORS } from '@/shared/config/game';
import type { Board } from '../model/types';

export interface GridMark {
  cells: Set<string>;
  cls: string;
}

interface Props {
  board: Board;
  flash: Set<string>;
  /** ghostColors[r][c] = цвет подсветки либо null */
  ghosts: (number | null)[][];
  /** дополнительные подсветки клеток (например, последний ход каждого игрока) */
  marks?: GridMark[];
  onCellClick: (row: number, col: number) => void;
}

/** entities/board: презентационная сетка, без игровой логики */
export function BoardGrid({ board, flash, ghosts, marks = [], onCellClick }: Props) {
  return (
    <>
      {board.map((rowArr, r) =>
        rowArr.map((v, c) => {
          const ghost = ghosts[r]?.[c] ?? null;
          const key = `${r}:${c}`;
          let markCls = '';
          for (const m of marks) {
            if (m.cells.has(key)) {
              markCls += ` ${m.cls}`;
              break;
            }
          }
          return (
            <div
              key={key}
              onClick={() => onCellClick(r, c)}
              className={
                'cell' +
                (v ? ' filled' : '') +
                (ghost ? ' ghost' : '') +
                (flash.has(key) ? ' flash' : '') +
                markCls
              }
              style={
                v
                  ? {
                      background: `linear-gradient(145deg, ${COLORS[v]}, color-mix(in srgb, ${COLORS[v]} 62%, #000))`,
                    }
                  : ghost
                    ? { background: `${COLORS[ghost]}66` }
                    : undefined
              }
            />
          );
        }),
      )}
    </>
  );
}
