interface Props {
  cells: number[][];
  color: string;
  small?: boolean;
}

/** entities/piece: отрисовка фигуры */
export function PieceView({ cells, color, small }: Props) {
  return (
    <div
      className="piece"
      style={{ gridTemplateColumns: `repeat(${cells[0].length}, ${small ? 19 : 30}px)` }}
    >
      {cells.map((row, r) =>
        row.map((v, c) => (
          <div
            key={`${r}:${c}`}
            className={'pcell' + (v ? ' on' : '')}
            style={
              v
                ? { background: `linear-gradient(145deg, ${color}, color-mix(in srgb, ${color} 62%, #000))` }
                : undefined
            }
          />
        )),
      )}
    </div>
  );
}
