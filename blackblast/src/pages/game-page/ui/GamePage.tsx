import { useMemo } from 'react';
import { anyFit } from '@/entities/board';
import { DragPreview } from '@/entities/piece';
import { AI_TUNING, suggestAiMove } from '@/features/ai-move';
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

  // Кнопка ИИ активна, пока есть хотя бы один влезающий ход (дешёвая проверка)
  const aiDisabled = useMemo(
    () => s.gameOver || !s.tray.some((p) => !p.used && anyFit(s.board, p.shape.cells)),
    [s.gameOver, s.tray, s.board],
  );

  const onAiMove = () => {
    const suggestion = suggestAiMove(s.board, s.tray, AI_TUNING.defaultDepth, AI_TUNING, s.streak);
    if (!suggestion) return;
    const piece = s.pieceByUid(suggestion.move.uid);
    if (piece) s.commitPlace(piece, suggestion.move.row, suggestion.move.col);
  };

  return (
    <div className="page">
      <div className="game">
        <ScoreHeader
          score={s.score}
          best={s.best}
          aiDisabled={aiDisabled}
          onAiMove={onAiMove}
          onRestart={s.restart}
        />

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
