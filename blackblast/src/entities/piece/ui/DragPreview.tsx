import { COLORS } from '@/shared/config/game';
import type { DragState, TrayPiece } from '../model/types';
import { PieceView } from './PieceView';

interface Props {
  drag: DragState;
  piece: TrayPiece | null;
}

/** entities/piece: плавающий призрак фигуры под курсором */
export function DragPreview({ drag, piece }: Props) {
  if (!piece) return null;
  return (
    <div
      className="drag-preview"
      style={{ left: drag.x, top: drag.y, opacity: drag.valid ? 1 : 0.6 }}
    >
      <PieceView cells={piece.shape.cells} color={COLORS[piece.color]} />
    </div>
  );
}
