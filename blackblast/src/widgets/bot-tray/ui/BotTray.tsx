import { anyFit, type Board } from '@/entities/board';
import { COLORS } from '@/shared/config/game';
import { PieceView, type TrayPiece } from '@/entities/piece';

interface Props {
  tray: TrayPiece[];
  board: Board;
  placing: boolean;
}

/** widgets/bot-tray: фигуры противника (видны, ставить нельзя) */
export function BotTray({ tray, board, placing }: Props) {
  return (
    <div className={'tray' + (placing ? ' thinking' : '')}>
      {tray.map((p) => {
        const fits = !p.used && anyFit(board, p.shape.cells);
        return (
          <div key={p.uid} className={'tray-slot bot-slot' + (!fits ? ' nofit' : '')} title={placing ? 'Бот думает…' : ''}>
            {!p.used && <PieceView cells={p.shape.cells} color={COLORS[p.color]} small />}
          </div>
        );
      })}
    </div>
  );
}