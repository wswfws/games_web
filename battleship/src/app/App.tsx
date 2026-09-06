import { useState } from 'react';
import './styles/index.css';

type Cell = 'water' | 'ship' | 'hit' | 'miss';

const N = 10;
const SHIP_SIZES = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

interface Ship {
  cells: Array<{ r: number; c: number }>;
  sunk?: boolean;
}

function makeBoard(): Cell[][] {
  return Array.from({ length: N }, () => Array<Cell>(N).fill('water'));
}

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/** Cells of a ship of `size` starting at (r, c) and extending right/down. */
function shipCells(
  r: number,
  c: number,
  size: number,
  orientation: 'h' | 'v',
): Array<{ r: number; c: number }> {
  const cells: Array<{ r: number; c: number }> = [];
  for (let i = 0; i < size; i++) {
    cells.push(orientation === 'h' ? { r, c: c + i } : { r: r + i, c });
  }
  return cells;
}

/** Generate a placement of all ships that don't touch (incl. diagonals). */
function generateRandomShips(): Ship[] {
  const board = makeBoard();
  const ships: Ship[] = [];

  const canPlace = (r: number, c: number, size: number, vertical: boolean): boolean => {
    for (let i = 0; i < size; i++) {
      const rr = vertical ? r + i : r;
      const cc = vertical ? c : c + i;
      if (rr >= N || cc >= N) return false;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = rr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < N && nc >= 0 && nc < N && board[nr][nc] === 'ship') return false;
        }
      }
    }
    return true;
  };

  const occupy = (r: number, c: number, size: number, vertical: boolean): Array<{ r: number; c: number }> => {
    const cells: Array<{ r: number; c: number }> = [];
    for (let i = 0; i < size; i++) {
      const rr = vertical ? r + i : r;
      const cc = vertical ? c : c + i;
      board[rr][cc] = 'ship';
      cells.push({ r: rr, c: cc });
    }
    return cells;
  };

  for (const size of SHIP_SIZES) {
    const options: Array<{ r: number; c: number; vertical: boolean }> = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (canPlace(r, c, size, false)) options.push({ r, c, vertical: false });
        if (canPlace(r, c, size, true)) options.push({ r, c, vertical: true });
      }
    }
    const pick = options[randInt(options.length)];
    const cells = occupy(pick.r, pick.c, size, pick.vertical);
    ships.push({ cells });
  }

  return ships;
}

function shipCellsSet(ships: Ship[]): Set<string> {
  const set = new Set<string>();
  for (const ship of ships) {
    for (const cell of ship.cells) set.add(`${cell.r},${cell.c}`);
  }
  return set;
}

function applyStrike(
  board: Cell[][],
  r: number,
  c: number,
  ships: Ship[],
): { board: Cell[][]; newSunk: boolean } {
  if (board[r][c] === 'hit' || board[r][c] === 'miss') return { board, newSunk: false };
  const next = board.map((row) => [...row]);
  const isShip = shipCellsSet(ships).has(`${r},${c}`);
  next[r][c] = isShip ? 'hit' : 'miss';

  let newSunk = false;
  if (isShip) {
    for (const ship of ships) {
      if (ship.sunk) continue;
      const hits = ship.cells.filter((cell) => next[cell.r][cell.c] === 'hit').length;
      if (hits === ship.cells.length) {
        ship.sunk = true;
        newSunk = true;
      }
    }
  }
  return { board: next, newSunk };
}

function allSunk(ships: Ship[]): boolean {
  return ships.every((ship) => ship.sunk);
}

/** Hunt/target bot: after a hit, prioritise adjacent cells. */
function botMove(
  playerBoard: Cell[][],
  playerShips: Ship[],
  lastHit: { r: number; c: number } | null,
): { r: number; c: number } | null {
  const hitSet = shipCellsSet(playerShips);
  const openCell = (r: number, c: number): boolean =>
    r >= 0 && r < N && c >= 0 && c < N &&
    playerBoard[r][c] !== 'hit' && playerBoard[r][c] !== 'miss';

  // Target mode: continue around the last hit.
  if (lastHit) {
    const around: Array<[number, number]> = [
      [lastHit.r - 1, lastHit.c],
      [lastHit.r + 1, lastHit.c],
      [lastHit.r, lastHit.c - 1],
      [lastHit.r, lastHit.c + 1],
    ];

    for (const [r, c] of around) {
      if (openCell(r, c) && hitSet.has(`${r},${c}`)) return { r, c };
    }
    for (const [r, c] of around) {
      if (openCell(r, c)) return { r, c };
    }
  }

  // Hunt: cells adjacent to any existing hit.
  const nearMiss: Array<{ r: number; c: number }> = [];
  const farMiss: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!openCell(r, c)) continue;
      const nearHit =
        (r > 0 && playerBoard[r - 1][c] === 'hit') ||
        (r < N - 1 && playerBoard[r + 1][c] === 'hit') ||
        (c > 0 && playerBoard[r][c - 1] === 'hit') ||
        (c < N - 1 && playerBoard[r][c + 1] === 'hit');
      (nearHit ? nearMiss : farMiss).push({ r, c });
    }
  }
  const pool = nearMiss.length > 0 ? nearMiss : farMiss;
  if (pool.length > 0) return pool[randInt(pool.length)];
  return null;
}

type Phase = 'place' | 'battle';

export default function App() {
  const [phase, setPhase] = useState<Phase>('place');
  const [placing, setPlacing] = useState(0);

  const [playerBoard, setPlayerBoard] = useState<Cell[][]>(makeBoard);
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [enemyBoard, setEnemyBoard] = useState<Cell[][]>(makeBoard);
  const [enemyShips, setEnemyShips] = useState<Ship[]>([]);

  const [turn, setTurn] = useState<'player' | 'bot'>('player');
  const [over, setOver] = useState(false);
  const [lastHit, setLastHit] = useState<{ r: number; c: number } | null>(null);
  const [message, setMessage] = useState('Расставь корабли и нажми «В бой»');
  const [orientation, setOrientation] = useState<'h' | 'v'>('h');
  const [preview, setPreview] = useState<{ r: number; c: number } | null>(null);
  const [scores, setScores] = useState({ player: 0, bot: 0 });
  const [busy, setBusy] = useState(false);

  /** Cells a ship would occupy starting at (r, c); null when nothing to place. */
  function prospectiveCells(
    r: number,
    c: number,
  ): { cells: Array<{ r: number; c: number }>; valid: boolean } | null {
    if (phase !== 'place') return null;
    const size = SHIP_SIZES[placing];
    if (size === undefined) return null;
    const raw = shipCells(r, c, size, orientation);
    const cells = raw.filter((cell) => cell.r < N && cell.c < N);
    const outOfBounds = cells.length !== raw.length;
    const collision = cells.some((cell) => playerBoard[cell.r][cell.c] !== 'water');
    return { cells, valid: !outOfBounds && !collision };
  }

  function placeShip(r: number, c: number) {
    const prospective = prospectiveCells(r, c);
    if (!prospective || !prospective.valid) return;
    const next = playerBoard.map((row) => [...row]);
    for (const cell of prospective.cells) next[cell.r][cell.c] = 'ship';
    setPlayerBoard(next);
    setPlayerShips((prev) => [...prev, { cells: prospective.cells }]);
    setPlacing(placing + 1);
  }

  function undoPlace() {
    if (phase !== 'place' || placing === 0) return;
    const removed = playerShips[playerShips.length - 1];
    const next = playerBoard.map((row) => [...row]);
    for (const cell of removed.cells) next[cell.r][cell.c] = 'water';
    setPlayerBoard(next);
    setPlayerShips(playerShips.slice(0, -1));
    setPlacing(placing - 1);
  }

  function randomPlace() {
    const ships = generateRandomShips();
    const board = makeBoard();
    for (const ship of ships) {
      for (const cell of ship.cells) board[cell.r][cell.c] = 'ship';
    }
    setPlayerBoard(board);
    setPlayerShips(ships);
    setPlacing(SHIP_SIZES.length);
  }

  function resetBoard() {
    setPhase('place');
    setPlacing(0);
    setPlayerBoard(makeBoard());
    setPlayerShips([]);
    setEnemyBoard(makeBoard());
    setEnemyShips([]);
    setTurn('player');
    setOver(false);
    setLastHit(null);
    setMessage('Расставь корабли и нажми «В бой»');
    setBusy(false);
    setPreview(null);
  }

  function startBattle() {
    const ships = generateRandomShips();
    const board = makeBoard();
    for (const ship of ships) {
      for (const cell of ship.cells) board[cell.r][cell.c] = 'ship';
    }
    setEnemyBoard(board);
    setEnemyShips(ships);
    setPhase('battle');
    setTurn('player');
    setMessage('Твой ход');
  }

  function onPlayerStrike(r: number, c: number) {
    if (phase !== 'battle' || turn !== 'player' || over || busy) return;
    if (enemyBoard[r][c] === 'hit' || enemyBoard[r][c] === 'miss') return;

    const { board: next, newSunk } = applyStrike(enemyBoard, r, c, enemyShips);
    setEnemyBoard(next);

    if (next[r][c] === 'hit') {
      if (newSunk) {
        setMessage('Корабль потоплен! 🔥 Ещё выстрел');
      } else {
        setMessage('Попадание! 🔥 Ещё выстрел');
      }
      if (allSunk(enemyShips)) {
        setOver(true);
        setMessage('Ты победил! Все корабли противника уничтожены 🎉');
        setScores((s) => ({ ...s, player: s.player + 1 }));
        return;
      }
      return; // extra strike
    }

    setTurn('bot');
    setMessage('Мимо. Ходит бот…');
    botTurn(playerBoard);
  }

  function botTurn(currentPlayerBoard: Cell[][]) {
    setBusy(true);
    setTimeout(() => {
      const move = botMove(currentPlayerBoard, playerShips, lastHit);
      if (!move) {
        setTurn('player');
        setBusy(false);
        setMessage('Бот не нашёл куда бить. Твой ход');
        return;
      }
      const { board: next, newSunk } = applyStrike(currentPlayerBoard, move.r, move.c, playerShips);
      setPlayerBoard(next);
      setLastHit(next[move.r][move.c] === 'hit' ? { r: move.r, c: move.c } : null);

      if (next[move.r][move.c] === 'hit') {
        if (newSunk) {
          setMessage('Бот потопил твой корабль! 😬');
        } else {
          setMessage('Бот попал в тебя!');
        }
        if (allSunk(playerShips)) {
          setOver(true);
          setBusy(false);
          setScores((s) => ({ ...s, bot: s.bot + 1 }));
          setMessage('Бот победил… Попробуй ещё раз!');
          return;
        }
        botTurn(next);
        return;
      }

      setTurn('player');
      setBusy(false);
      setMessage('Бот промахнулся. Твой ход');
    }, 400);
  }

  return (
    <div className="bs">
      <header className="bs-header">
        <h1>Морской бой</h1>
        <div className="bs-scores">
          <span className="bs-score bs-score--player">Ты: {scores.player}</span>
          <span className="bs-score bs-score--bot">Бот: {scores.bot}</span>
        </div>
      </header>

      <div className="bs-status">{message}</div>

      {phase === 'place' && (
        <div className="bs-place-controls">
          <div className="bs-place-info">
            {placing < SHIP_SIZES.length ? (
              <>
                Ставишь корабль на <strong>{SHIP_SIZES[placing]}</strong> клетки (
                {SHIP_SIZES.length - placing} осталось). Зелёная подсветка — можно ставить, красная — нельзя.
              </>
            ) : (
              <>Все корабли расставлены.</>
            )}
          </div>
          <div className="bs-controls-row">
            <button
              className="bs-btn"
              onClick={() => setOrientation((o) => (o === 'h' ? 'v' : 'h'))}
              disabled={placing >= SHIP_SIZES.length}
              title="Или нажми правой кнопкой мыши по полю"
            >
              Повернуть: {orientation === 'h' ? '⟶ вправо' : '⟱ вниз'}
            </button>
            <button className="bs-btn" onClick={undoPlace} disabled={placing === 0}>
              Убрать последний
            </button>
            <button className="bs-btn" onClick={randomPlace}>
              Случайно
            </button>
            <button
              className="bs-btn bs-btn--primary"
              onClick={startBattle}
              disabled={placing < SHIP_SIZES.length}
            >
              В бой!
            </button>
          </div>
        </div>
      )}

      <div className="bs-boards">
        <div
            className="bs-board"
            onContextMenu={(e) => {
              e.preventDefault();
              if (phase === 'place' && placing < SHIP_SIZES.length) {
                setOrientation((o) => (o === 'h' ? 'v' : 'h'));
              }
            }}
            onMouseLeave={() => setPreview(null)}
          >
            <div className="bs-board-title bs-board-title--mine">Твои корабли</div>
            {playerBoard.map((row, r) => (
              <div className="bs-row" key={`p-row-${r}`}>
                {row.map((cell, c) => {
                  const cls = ['bs-cell'];
                  if (cell === 'ship') cls.push('bs-cell--ship');
                  if (cell === 'hit') cls.push('bs-cell--hit');
                  if (cell === 'miss') cls.push('bs-cell--miss');
                  const hover = preview ? prospectiveCells(preview.r, preview.c) : null;
                  const previewing = hover && hover.cells.some((p) => p.r === r && p.c === c);
                  if (previewing) cls.push(hover.valid ? 'bs-cell--preview' : 'bs-cell--preview-invalid');
                  return (
                    <button
                      key={`p-cell-${r}-${c}`}
                      className={cls.join(' ')}
                      onClick={() => phase === 'place' && placeShip(r, c)}
                      onMouseEnter={() => phase === 'place' && setPreview({ r, c })}
                    >
                      {cell === 'hit' ? '✕' : cell === 'miss' ? '·' : ''}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

        <div className="bs-board">
          <div className="bs-board-title bs-board-title--enemy">Корабли бота</div>
          {enemyBoard.map((row, r) => (
            <div className="bs-row" key={`e-row-${r}`}>
              {row.map((cell, c) => {
                const cls = ['bs-cell'];
                if (cell === 'hit') cls.push('bs-cell--hit');
                if (cell === 'miss') cls.push('bs-cell--miss');
                return (
                  <button
                    key={`e-cell-${r}-${c}`}
                    className={cls.join(' ')}
                    onClick={() => onPlayerStrike(r, c)}
                    disabled={phase !== 'battle' || turn !== 'player' || over || busy}
                  >
                    {cell === 'hit' ? '✕' : cell === 'miss' ? '·' : ''}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="bs-footer">
        <button className="bs-btn bs-btn--primary" onClick={resetBoard}>
          Заново
        </button>
      </div>
    </div>
  );
}