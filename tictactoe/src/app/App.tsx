import { useState } from 'react';
import './styles/index.css';

type Cell = 'X' | 'O' | null;
type Board = Cell[];

const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winnerOf(board: Board): Cell {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function emptyCells(board: Board): number[] {
  return board.flatMap((cell, i) => (cell ? [] : [i]));
}

/** лёгкий противник: победа → блок → центр → случайная клетка */
function aiMove(board: Board): number {
  const me: Cell = 'O';
  const you: Cell = 'X';

  for (const line of LINES) {
    const cells = line.map((i) => board[i]);
    if (cells.filter((x) => x === me).length === 2) {
      const empty = line.find((i) => !board[i]);
      if (empty !== undefined) return empty;
    }
  }
  for (const line of LINES) {
    const cells = line.map((i) => board[i]);
    if (cells.filter((x) => x === you).length === 2) {
      const empty = line.find((i) => !board[i]);
      if (empty !== undefined) return empty;
    }
  }
  const available = emptyCells(board);
  if (available.includes(4)) return 4;
  return available[Math.floor(Math.random() * available.length)];
}

export default function App() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [over, setOver] = useState(false);

  const winner = winnerOf(board);

  function reset() {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setOver(false);
  }

  function moveAt(boardBefore: Board, index: number, value: Cell) {
    if (boardBefore[index]) return;
    const next = [...boardBefore];
    next[index] = value;
    setBoard(next);
    const w = winnerOf(next);
    if (w) {
      setOver(true);
      setScores((s) => ({ ...s, [w]: s[w] + 1 }));
    } else if (next.every(Boolean)) {
      setOver(true);
    } else {
      setTurn((t) => (t === 'X' ? 'O' : 'X'));
    }
    return next;
  }

  function onPlayerMove(index: number) {
    if (over || turn !== 'X' || board[index]) return;
    const next = moveAt(board, index, 'X');
    if (next && !winnerOf(next) && !next.every(Boolean)) {
      setTurn('O');
      setTimeout(() => {
        setBoard((current) => {
          const aiIndex = aiMove(current);
          if (current[aiIndex] || winnerOf(current)) return current;
          const after = [...current];
          after[aiIndex] = 'O';
          const w = winnerOf(after);
          if (w) {
            setOver(true);
            setScores((s) => ({ ...s, O: s.O + 1 }));
          } else if (after.every(Boolean)) {
            setOver(true);
          } else {
            setTurn('X');
          }
          return after;
        });
      }, 280);
    }
  }

  return (
    <div className="ttt">
      <header className="ttt-header">
        <h1>Крестики-нолики</h1>
        <div className="ttt-scores">
          <span className="ttt-score ttt-score--x">X: {scores.X}</span>
          <span className="ttt-score ttt-score--o">O: {scores.O}</span>
        </div>
      </header>

      <div className="ttt-status">
        {over
          ? winner
            ? `Победил ${winner}!`
            : 'Ничья!'
          : turn === 'X'
            ? 'Твой ход (X)'
            : 'Ход соперника (O)…'}
      </div>

      <div className="ttt-board">
        {board.map((cell, i) => (
          <button
            key={i}
            className={`ttt-cell ${cell ? `ttt-cell--${cell.toLowerCase()}` : ''}`}
            onClick={() => onPlayerMove(i)}
            disabled={over || turn !== 'X' || cell !== null}
          >
            {cell}
          </button>
        ))}
      </div>

      <button className="ttt-restart" onClick={reset}>
        Заново
      </button>
    </div>
  );
}