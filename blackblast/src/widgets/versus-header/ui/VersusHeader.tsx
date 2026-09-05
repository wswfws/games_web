import { VERSUS_MAX_PIECES } from '@/shared/config/game';
import type { VersusSide, VersusWinner } from '@/features/versus-game';

interface Props {
  humanScore: number;
  botScore: number;
  turn: VersusSide;
  done: boolean;
  winner: VersusWinner;
  placed: number;
  botThinking: boolean;
  onMenu: () => void;
  onRestart: () => void;
}

const WINNER_TEXT: Record<Exclude<VersusWinner, null>, string> = {
  human: 'Победа!',
  bot: 'Бот победил',
  draw: 'Ничья',
};

/** widgets/versus-header: счёт на двоих + индикатор хода */
export function VersusHeader({
  humanScore,
  botScore,
  turn,
  done,
  winner,
  placed,
  botThinking,
  onMenu,
  onRestart,
}: Props) {
  const bar = Math.round((placed / VERSUS_MAX_PIECES) * 100);
  const humanActive = !done && turn === 'human';
  const botActive = !done && turn === 'bot';

  return (
    <header className="top versus-top">
      <button className="icon-btn" onClick={onMenu} title="В меню" aria-label="В меню">
        ☰
      </button>
      <h1 className="mode-title">Против бота</h1>
      <button className="icon-btn" onClick={onRestart} title="Новая игра" aria-label="Новая игра">
        ↻
      </button>

      <div className="versus-scores">
        <div className={'vs-pill' + (humanActive ? ' active' : '')}>
          <span>Вы</span>
          <b>{humanScore}</b>
        </div>
        <div className={'vs-pill' + (botActive ? ' active bot-thinking' : '')}>
          <span>{botThinking ? '🤖 думает…' : 'Бот'}</span>
          <b>{botScore}</b>
        </div>
      </div>

      <div className="progress">
        <div className="progress-bar" style={{ width: `${bar}%` }} />
        <span>{placed} / {VERSUS_MAX_PIECES}</span>
      </div>

      {done && winner && (
        <div className={'versus-result' + (winner === 'human' ? ' win' : winner === 'bot' ? ' lose' : '')}>
          {WINNER_TEXT[winner]}{' '}
          <span className="result-score">
            {humanScore} : {botScore}
          </span>
        </div>
      )}
    </header>
  );
}