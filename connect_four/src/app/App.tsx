import { useState } from 'react';
import './styles/index.css';

type Cell = 'R' | 'Y' | null;
type Board = Cell[][];

const COLS = 7;
const ROWS = 6;

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

function dropRow(board: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return -1;
}

function winnerOf(board: Board): Cell {
  const has = (r: number, c: number): Cell | null => board[r]?.[c] ?? null;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = has(r, c);
      if (!cell) continue;
      const dirs: Array<[number, number]> = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1],
      ];
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let k = 1; k < 4; k++) {
          if (has(r + dr * k, c + dc * k) === cell) count++;
          else break;
        }
        for (let k = 1; k < 4; k++) {
          if (has(r - dr * k, c - dc * k) === cell) count++;
          else break;
        }
        if (count >= 4) return cell;
      }
    }
  }
  return null;
}

function dropped(board: Board, col: number, me: Cell): Board | null {
  const r = dropRow(board, col);
  if (r < 0) return null;
  const next = board.map((row) => [...row]);
  next[r][col] = me;
  return next;
}

function isFull(board: Board): boolean {
  return board.every((row) => row.every(Boolean));
}

/** ИИ: победа → блок → ближе к центру → случайный столбец */
function aiCol(board: Board): number {
  const me: Cell = 'Y';
  const you: Cell = 'R';
  for (let c = 0; c < COLS; c++) {
    const next = dropped(board, c, me);
    if (next && winnerOf(next) === me) return c;
  }
  for (let c = 0; c < COLS; c++) {
    const next = dropped(board, c, you);
    if (next && winnerOf(next) === you) return c;
  }
  const ordered = [3, 2, 4, 1, 5, 0, 6];
  const open = ordered.filter((c) => dropRow(board, c) >= 0);
  return open.length ? open[0] : -1;
}

export default function App() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [over, setOver] = useState(false);
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  const winner = winnerOf(board);

  function reset() {
    setBoard(emptyBoard());
    setTurn('player');
    setOver(false);
  }

  function play(col: number, who: 'player' | 'ai') {
    const me: Cell = who === 'player' ? 'R' : 'Y';
    setBoard((current) => {
      const next = dropped(current, col, me);
      if (!next || over) return current;
      const w = winnerOf(next);
      if (w) {
        setOver(true);
        setScores((s) => ({ ...s, [who]: s[who] + 1 }));
      } else if (isFull(next)) {
        setOver(true);
      } else {
        setTurn((t) => (t === 'player' ? 'ai' : 'player'));
      }
      return next;
    });
  }

  function onColClick(col: number) {
    if (over || turn !== 'player' || dropRow(board, col) < 0) return;
    play(col, 'player');
    setTimeout(() => {
      setOver((currentOver) => {
        if (currentOver) return currentOver;
        setBoard((current) => {
          const next = dropped(current, aiCol(current), 'Y');
          if (!next) return current;
          const w = winnerOf(next);
          if (w) {
            setOver(true);
            setScores((s) => ({ ...s, ai: s.ai + 1 }));
          } else if (isFull(next)) {
            setOver(true);
          } else {
            setTurn('player');
          }
          return next;
        });
        return currentOver;
      });
    }, 300);
  }

  return (
    <div className="cf">
      <header className="cf-header">
        <h1>4 в ряд</h1>
        <div className="cf-scores">
          <span className="cf-score cf-score--player">Ты: {scores.player}</span>
          <span className="cf-score cf-score--ai">Бот: {scores.ai}</span>
        </div>
      </header>

      <div className="cf-status">
        {over
          ? winner
            ? winner === 'R'
              ? 'Ты победил!'
              : 'Победил бот!'
            : 'Ничья!'
          : turn === 'player'
            ? 'Твой ход'
            : 'Ход бота…'}
      </div>

      <div className="cf-board">
        {Array.from({ length: COLS }, (_, c) => (
          <button
            key={c}
            className="cf-col"
            onClick={() => onColClick(c)}
            disabled={over || turn !== 'player' || dropRow(board, c) < 0}
          >
            {board.map((row, r) => (
              <span
                key={r}
                className={`cf-cell ${row[c] ? `cf-cell--${row[c].toLowerCase()}` : ''}`}
              />
            ))}
          </button>
        ))}
      </div>

      <button className="cf-restart" onClick={reset}>
        Заново
      </button>
    </div>
  );
}