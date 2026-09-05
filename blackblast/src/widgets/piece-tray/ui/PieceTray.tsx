import { anyFit, type Board } from '@/entities/board';
import { COLORS } from '@/shared/config/game';
import { PieceView, type TrayPiece } from '@/entities/piece';

interface Props {
  tray: TrayPiece[];
  board: Board;
  selectedUid: string | null;
  onPiecePointerDown: (e: React.PointerEvent, piece: TrayPiece) => void;
  onSelect: (uid: string) => void;
}

/** widgets/piece-tray: лоток из 3 фигур */
export function PieceTray({ tray, board, selectedUid, onPiecePointerDown, onSelect }: Props) {
  return (
    <div className="tray">
      {tray.map((p) => {
        const fits = !p.used && anyFit(board, p.shape.cells);
        return (
          <button
            key={p.uid}
            className={
              'tray-slot' +
              (p.used ? ' used' : '') +
              (selectedUid === p.uid && !p.used ? ' selected' : '') +
              (!fits && !p.used ? ' nofit' : '')
            }
            onPointerDown={(e) => onPiecePointerDown(e, p)}
            onClick={() => onSelect(p.uid)}
            title={p.used ? 'Использовано' : fits ? 'Можно поставить' : 'Некуда поставить'}
          >
            {!p.used && <PieceView cells={p.shape.cells} color={COLORS[p.color]} small />}
          </button>
        );
      })}
    </div>
  );
}
