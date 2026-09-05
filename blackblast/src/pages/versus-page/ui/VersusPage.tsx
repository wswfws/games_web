import { DragPreview } from '@/entities/piece';
import { useVersusSession } from '@/features/versus-game';
import { BoardWidget } from '@/widgets/board';
import { BotTray } from '@/widgets/bot-tray';
import { FloatMessages } from '@/widgets/float-messages';
import { PieceTray } from '@/widgets/piece-tray';
import { VersusHeader } from '@/widgets/versus-header';
import type { PageKind } from '@/shared/lib/navigation';

interface Props {
  onNavigate: (page: PageKind) => void;
}

/** pages/versus-page: партия «против бота» на общем поле */
export function VersusPage({ onNavigate }: Props) {
  const s = useVersusSession();

  return (
    <div className="page">
      <div className="game">
        <VersusHeader
          humanScore={s.humanScore}
          botScore={s.botScore}
          turn={s.turn}
          done={s.done}
          winner={s.winner}
          placed={s.placed}
          botThinking={s.botThinking}
          onMenu={() => onNavigate('menu')}
          onRestart={s.restart}
        />

        <div className="board-wrap">
          <FloatMessages msgs={s.msgs} />
          <BoardWidget
            board={s.board}
            flash={s.flash}
            ghosts={s.ghosts}
            marks={[
              { cells: s.lastHuman, cls: 'lm-human' },
              { cells: s.lastBot, cls: 'lm-bot' },
            ]}
            boardRef={s.boardRef}
            onCellClick={s.onBoardClick}
          />
        </div>

        {s.done ? (
          <div className="versus-over">
            <b>Вы {s.humanScore}</b>
            <span>:</span>
            <b>{s.botScore} Бот</b>
            <button className="menu-btn primary" onClick={s.restart}>
              Ещё раз
            </button>
            <button className="menu-btn" onClick={() => onNavigate('menu')}>
              В меню
            </button>
          </div>
        ) : (
          <>
            <BotTray tray={s.botTray} board={s.board} placing={s.botThinking} />
            <div className="tray-label">Вы</div>
            <div className={'tray-wrap' + (s.turn === 'bot' ? ' disabled' : '')}>
              <PieceTray
                tray={s.humanTray}
                board={s.board}
                selectedUid={s.selectedUid}
                onPiecePointerDown={s.onPiecePointerDown}
                onSelect={s.selectPiece}
              />
            </div>
          </>
        )}

        {s.drag && <DragPreview drag={s.drag} piece={s.pieceByUid(s.drag.uid) ?? null} />}
      </div>
    </div>
  );
}