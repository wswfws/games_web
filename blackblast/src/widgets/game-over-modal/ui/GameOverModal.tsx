import { Button } from '@/shared/ui/Button';

interface Props {
  score: number;
  best: number;
  onRestart: () => void;
}

/** widgets/game-over-modal: финал — только цифры и кнопка */
export function GameOverModal({ score, best, onRestart }: Props) {
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
        <Button variant="primary" onClick={onRestart}>
          Играть снова
        </Button>
      </div>
    </div>
  );
}
