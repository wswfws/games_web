import { COLORS } from '@/shared/config/game';
import type { Board } from '../model/types';

interface Props {
  board: Board;
  flash: Set<string>;
  /** ghostColors[r][c] = цвет подсветки либо null */
  ghosts: (number | null)[][];
  onCellClick: (row: number, col: number) => void;
}

/** entities/board: презентационная сетка, без игровой логики */
export function BoardGrid({ board, flash, ghosts, onCellClick }: Props) {
  return (
    <>
      {board.map((rowArr, r) =>
        rowArr.map((v, c) => {
          const ghost = ghosts[r]?.[c] ?? null;
          const key = `${r}:${c}`;
          return (
            <div
              key={key}
              onClick={() => onCellClick(r, c)}
              className={
                'cell' +
                (v ? ' filled' : '') +
                (ghost ? ' ghost' : '') +
                (flash.has(key) ? ' flash' : '')
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
