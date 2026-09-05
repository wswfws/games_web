import { DragPreview } from '@/entities/piece';
import { useGameSession } from '@/features/game-session';
import { BoardWidget } from '@/widgets/board';
import { FloatMessages } from '@/widgets/float-messages';
import { GameOverModal } from '@/widgets/game-over-modal';
import { PieceTray } from '@/widgets/piece-tray';
import { ScoreHeader } from '@/widgets/score-header';

/**
 * pages/game-page: композиция виджетов, вся логика — в features/game-session.
 * Правило FSD: page знает про widgets/features, но не про внутренности entities.
 */
export function GamePage() {
  const s = useGameSession();

  return (
    <div className="page">
      <div className="game">
        <ScoreHeader score={s.score} best={s.best} onRestart={s.restart} />

        <div className="board-wrap">
          <FloatMessages msgs={s.msgs} />
          <BoardWidget
            board={s.board}
            flash={s.flash}
            ghosts={s.ghosts}
            boardRef={s.boardRef}
            onCellClick={s.onBoardClick}
          />
        </div>

        <PieceTray
          tray={s.tray}
          board={s.board}
          selectedUid={s.selectedUid}
          onPiecePointerDown={s.onPiecePointerDown}
          onSelect={s.selectPiece}
        />

        {s.gameOver && <GameOverModal score={s.score} best={s.best} onRestart={s.restart} />}

        {s.drag && <DragPreview drag={s.drag} piece={s.pieceByUid(s.drag.uid) ?? null} />}
      </div>
    </div>
  );
}
