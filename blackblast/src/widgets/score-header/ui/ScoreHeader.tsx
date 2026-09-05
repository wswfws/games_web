interface Props {
  score: number;
  best: number;
  onRestart: () => void;
  onMenu: () => void;
}

/** widgets/score-header: компактная шапка соло-режима */
export function ScoreHeader({ score, best, onRestart, onMenu }: Props) {
  return (
    <header className="top">
      <button className="icon-btn" onClick={onMenu} title="В меню" aria-label="В меню">
        ☰
      </button>
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
