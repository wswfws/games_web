import { Button } from '@/shared/ui/Button';

interface Props {
  score: number;
  best: number;
  onRestart: () => void;
  onMenu?: () => void;
}

/** widgets/game-over-modal: финал — только цифры и кнопки */
export function GameOverModal({ score, best, onRestart, onMenu }: Props) {
  const isRecord = score >= best && score > 0;
  return (
    <div className="overlay">
      <div className="modal">
        <h2>Игра окончена</h2>
        <div className="modal-score">{score}</div>
        <p className="modal-best">
          🏆 <b>{best}</b>
          {isRecord && (
            <>
              <br />
              <span className="new-record">Новый рекорд!</span>
            </>
          )}
        </p>
        <div className="modal-actions">
          <Button variant="primary" onClick={onRestart}>
            Играть снова
          </Button>
          {onMenu && (
            <Button variant="ghost" onClick={onMenu}>
              В меню
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
