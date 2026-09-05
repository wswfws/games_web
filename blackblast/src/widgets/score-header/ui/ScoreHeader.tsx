interface Props {
  score: number;
  best: number;
  onRestart: () => void;
}

/** widgets/score-header: компактная шапка — счёт, рекорд, рестарт */
export function ScoreHeader({ score, best, onRestart }: Props) {
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
      <button className="icon-btn" onClick={onRestart} title="Новая игра" aria-label="Новая игра">
        ↻
      </button>
    </header>
  );
}
