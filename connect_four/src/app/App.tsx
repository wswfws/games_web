import { useMemo, useRef, useState } from 'react';
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

function winnerPlayer(board: Board): Cell {
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

function isFull(board: Board): boolean {
  return board.every((row) => row.every(Boolean));
}

function placed(board: Board, col: number, me: Cell): Board | null {
  const r = dropRow(board, col);
  if (r < 0) return null;
  const next = board.map((row) => [...row]) as Board;
  next[r][col] = me;
  return next;
}

/**
 * Бот — адаптация https://github.com/wswfws/four-in-row
 * minimax с глубиной 3, эвристическая оценка угроз по 4 направлениям.
 */
const BOT_DEPTH = 3;

function evaluateThreat(count: number, empty: number): number {
  if (count === 4) return 10000;
  if (count === 3 && empty === 1) return 100;
  if (count === 2 && empty === 2) return 10;
  if (count === 1 && empty === 3) return 1;
  return 0;
}

function aiScore(board: Board, botPlayer: Cell): number {
  const me = botPlayer;
  const you: Cell = botPlayer === 'R' ? 'Y' : 'R';

  const evaluateLine = (cells: Cell[]): number => {
    let meCount = 0;
    let youCount = 0;
    let emptyCount = 0;
    for (const c of cells) {
      if (c === me) meCount++;
      else if (c === you) youCount++;
      else emptyCount++;
    }
    if (meCount > 0 && youCount > 0) return 0;
    if (meCount > 0) return evaluateThreat(meCount, emptyCount);
    if (youCount > 0) return -evaluateThreat(youCount, emptyCount) * 1.1;
    return 0;
  };

  let score = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c <= COLS - 4) score += evaluateLine([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]);
      if (r <= ROWS - 4) score += evaluateLine([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
      if (c <= COLS - 4 && r <= ROWS - 4) score += evaluateLine([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]);
      if (c >= 3 && r <= ROWS - 4) score += evaluateLine([board[r][c], board[r + 1][c - 1], board[r + 2][c - 2], board[r + 3][c - 3]]);
    }
  }
  return score;
}

function aiNextCol(board: Board, botPlayer: Cell, depth: number): [number, number] {
  let bestCol = 0;
  let bestScore = -Infinity;

  for (let col = 0; col < COLS; col++) {
    const next = placed(board, col, botPlayer);
    if (!next) continue;

    const w = winnerPlayer(next);
    if (w === botPlayer) {
      return [col, 100000 - (BOT_DEPTH - depth)];
    }

    let score: number;
    if (depth > 1) {
      const [, rec] = aiNextCol(next, botPlayer === 'R' ? 'Y' : 'R', depth - 1);
      score = -rec;
    } else {
      score = aiScore(next, botPlayer);
    }

    if (score > bestScore || (score === bestScore && Math.random() > 0.5)) {
      bestCol = col;
      bestScore = score;
    }
  }

  return [bestCol, bestScore];
}

export default function App() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [over, setOver] = useState(false);
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  const boardRef = useRef(board);
  const overRef = useRef(over);
  boardRef.current = board;
  overRef.current = over;

  const winner = winnerPlayer(board);

  const winnerLabel = useMemo(
    () => (winner ? (winner === 'R' ? 'Ты победил!' : 'Победил бот!') : null),
    [winner],
  );

  function commit(next: Board, who: 'player' | 'ai') {
    if (overRef.current) return;
    setBoard(next);
    boardRef.current = next;
    const w = winnerPlayer(next);
    if (w) {
      setOver(true);
      overRef.current = true;
      setScores((s) => ({ ...s, [who]: s[who] + 1 }));
    } else if (isFull(next)) {
      setOver(true);
      overRef.current = true;
    } else {
      setTurn(who === 'player' ? 'ai' : 'player');
    }
  }

  function reset() {
    setBoard(emptyBoard());
    setTurn('player');
    setOver(false);
    overRef.current = false;
  }

  function botWhenFree() {
    setTimeout(() => {
      if (overRef.current) return;
      const current = boardRef.current;
      if (winnerPlayer(current) || isFull(current)) return;
      const [col] = aiNextCol(current, 'Y', BOT_DEPTH);
      const afterBot = placed(current, col, 'Y');
      if (afterBot) commit(afterBot, 'ai');
    }, 320);
  }

  function onColClick(col: number) {
    if (overRef.current || turn !== 'player') return;
    const afterPlayer = placed(boardRef.current, col, 'R');
    if (!afterPlayer) return;
    commit(afterPlayer, 'player');
    if (winnerPlayer(afterPlayer) || isFull(afterPlayer)) return;
    botWhenFree();
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
            ? winnerLabel
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