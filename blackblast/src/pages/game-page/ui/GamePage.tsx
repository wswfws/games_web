import { DragPreview } from '@/entities/piece';
import { useGameSession } from '@/features/game-session';
import { BoardWidget } from '@/widgets/board';
import { FloatMessages } from '@/widgets/float-messages';
import { GameOverModal } from '@/widgets/game-over-modal';
import { PieceTray } from '@/widgets/piece-tray';
import { ScoreHeader } from '@/widgets/score-header';
import type { PageKind } from '@/shared/lib/navigation';

interface Props {
  onNavigate: (page: PageKind) => void;
}

/**
 * pages/game-page: композиция виджетов соло-режима, логика — в features/game-session.
 */
export function GamePage({ onNavigate }: Props) {
  const s = useGameSession();

  return (
    <div className="page">
      <div className="game">
        <ScoreHeader
          score={s.score}
          best={s.best}
          onRestart={s.restart}
          onMenu={() => onNavigate('menu')}
        />

        <div className="board-wrap">
          <FloatMessages msgs={s.msgs} />
          <BoardWidget
            board={s.board}
            flash={s.flash}
            ghosts={s.ghosts}
            marks={s.lastMove.size > 0 ? [{ cells: s.lastMove, cls: 'lm-solo' }] : undefined}
            boardRef={s.boardRef}
            onCellClick={s.onBoardClick}
          />
        </div>

        {s.gameOver ? (
          <GameOverModal score={s.score} best={s.best} onRestart={s.restart} onMenu={() => onNavigate('menu')} />
        ) : (
          <PieceTray
            tray={s.tray}
            board={s.board}
            selectedUid={s.selectedUid}
            onPiecePointerDown={s.onPiecePointerDown}
            onSelect={s.selectPiece}
          />
        )}

        {s.drag && <DragPreview drag={s.drag} piece={s.pieceByUid(s.drag.uid) ?? null} />}
      </div>
    </div>
  );
}