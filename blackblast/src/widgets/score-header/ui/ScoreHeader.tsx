import { AiMoveButton } from '@/features/ai-move';

interface Props {
  score: number;
  best: number;
  aiDisabled: boolean;
  onAiMove: () => void;
  onRestart: () => void;
}

/** widgets/score-header: компактная шапка — счёт, рекорд, ИИ, рестарт */
export function ScoreHeader({ score, best, aiDisabled, onAiMove, onRestart }: Props) {
  return (
    <header className="top">
      <div className="logo" aria-hidden>
        🧱
      </div>
      <div className="score-main">
        <span>SCORE</span>
        <b>{score}</b>
      </div>
      <div className="best-pill" title="Рекорд">
        🏆 {best}
      </div>
      <AiMoveButton disabled={aiDisabled} onMove={onAiMove} />
      <button className="icon-btn" onClick={onRestart} title="Новая игра" aria-label="Новая игра">
        ↻
      </button>
    </header>
  );
}
