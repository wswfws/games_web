import { useCallback, useEffect, useRef, useState } from 'react';
import { BOARD_SIZE } from '@/shared/config/game';
import { boardCellFromPoint } from '@/shared/lib/dom';
import {
  applyPlace,
  canPlace,
  clearFullLines,
  emptyBoard,
  type Board,
} from '@/entities/board';
import { newTray, shapeCellCount, type DragState, type TrayPiece } from '@/entities/piece';
import { loadBest, saveBest, scoreForMove } from '@/entities/score';
import { checkGameOver } from '../lib/check-game-over';
import type { FloatMsg } from './types';

export interface GameSession {
  board: Board;
  tray: TrayPiece[];
  score: number;
  best: number;
  selectedUid: string | null;
  gameOver: boolean;
  streak: number;
  lastMove: Set<string>;
  drag: DragState | null;
  flash: Set<string>;
  msgs: FloatMsg[];
  ghosts: (number | null)[][];
  boardRef: React.RefObject<HTMLDivElement | null>;
  pieceByUid: (uid: string) => TrayPiece | undefined;
  commitPlace: (piece: TrayPiece, row: number, col: number) => boolean;
  restart: () => void;
  onPiecePointerDown: (e: React.PointerEvent, piece: TrayPiece) => void;
  onBoardClick: (row: number, col: number) => void;
  selectPiece: (uid: string) => void;
}

/**
 * features/game-session: вся механика игры в одном хуке.
 * widgets/pages получают готовое состояние через пропсы — без прямых импортов entities.
 */
export function useGameSession(): GameSession {
  const [board, setBoard] = useState<Board>(() => emptyBoard());
  const [tray, setTray] = useState<TrayPiece[]>(() => newTray());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const [msgs, setMsgs] = useState<FloatMsg[]>([]);
  const [lastMove, setLastMove] = useState<Set<string>>(new Set());
  const boardRef = useRef<HTMLDivElement | null>(null);
  const msgId = useRef(0);

  const pushMsg = useCallback((text: string) => {
    const id = ++msgId.current;
    setMsgs((m) => [...m.slice(-3), { id, text }]);
    window.setTimeout(() => setMsgs((m) => m.filter((x) => x.id !== id)), 1200);
  }, []);

  const pieceByUid = useCallback((uid: string) => tray.find((p) => p.uid === uid), [tray]);

  const commitPlace = useCallback(
    (piece: TrayPiece, row: number, col: number) => {
      if (gameOver) return false;
      // валидация против актуального board из замыкания
      if (!canPlace(board, piece.shape.cells, row, col)) return false;

      const placed = shapeCellCount(piece.shape);
      const afterPlace = applyPlace(board, piece.shape.cells, row, col, piece.color);
      const cleared = clearFullLines(afterPlace);
      const next = cleared.board;
      const lines = cleared.clearedRows.length + cleared.clearedCols.length;
      const effectiveStreak = cleared.clearedCells > 0 ? streak : 0;
      const { gained, comboBonus } = scoreForMove(
        placed,
        cleared.clearedCells,
        lines,
        effectiveStreak,
      );

      if (cleared.clearedCells > 0) {
        const keys = new Set<string>();
        for (const r of cleared.clearedRows)
          for (let c = 0; c < BOARD_SIZE; c++) keys.add(`${r}:${c}`);
        for (const c of cleared.clearedCols)
          for (let r = 0; r < BOARD_SIZE; r++) keys.add(`${r}:${c}`);
        setFlash(keys);
        window.setTimeout(() => setFlash(new Set()), 350);
        setStreak((s) => s + 1);
        if (lines >= 2)
          pushMsg(lines >= 3 ? `🔥 Комбо x${lines}! +${comboBonus}` : `Комбо x${lines}! +${comboBonus}`);
        else if (effectiveStreak > 0) pushMsg(`Стрик ${effectiveStreak + 1}! +${comboBonus}`);
        else if (cleared.clearedCells >= 8) pushMsg(`+${gained}`);
      } else {
        setStreak(0);
      }

      let nextTray = tray.map((p) => (p.uid === piece.uid ? { ...p, used: true } : p));
      if (nextTray.every((p) => p.used)) nextTray = newTray();

      const over = checkGameOver(next, nextTray);
      setBoard(next);
      setTray(nextTray);
      setSelectedUid(null);
      setLastMove(() => {
        const survivorCells = new Set<string>();
        for (let pr = 0; pr < piece.shape.cells.length; pr++) {
          for (let pc = 0; pc < piece.shape.cells[0].length; pc++) {
            if (!piece.shape.cells[pr][pc]) continue;
            const rr = row + pr;
            const cc = col + pc;
            if (next[rr][cc] !== 0) survivorCells.add(`${rr}:${cc}`);
          }
        }
        return survivorCells;
      });
      setScore((s) => {
        const ns = s + gained;
        setBest((b) => {
          if (ns > b) {
            saveBest(ns);
            return ns;
          }
          return b;
        });
        return ns;
      });
      if (over) setGameOver(true);
      return true;
    },
    [board, tray, gameOver, streak, pushMsg],
  );

  const restart = useCallback(() => {
    setBoard(emptyBoard());
    setTray(newTray());
    setScore(0);
    setStreak(0);
    setSelectedUid(null);
    setGameOver(false);
    setFlash(new Set());
    setMsgs([]);
    setDrag(null);
    setLastMove(new Set());
  }, []);

  const selectPiece = useCallback(
    (uid: string) => {
      const p = tray.find((x) => x.uid === uid);
      if (p && !p.used && !gameOver) setSelectedUid(uid);
    },
    [tray, gameOver],
  );

  // --- Drag & drop на Pointer Events ---
  const cellFromPointer = useCallback((clientX: number, clientY: number, piece: TrayPiece) => {
    const el = boardRef.current;
    if (!el) return { row: null as number | null, col: null as number | null };
    return boardCellFromPoint(el.getBoundingClientRect(), clientX, clientY, piece.shape.cells);
  }, []);

  const onPiecePointerDown = useCallback(
    (e: React.PointerEvent, piece: TrayPiece) => {
      if (piece.used || gameOver) return;
      const { row, col } = cellFromPointer(e.clientX, e.clientY, piece);
      const valid = row !== null && col !== null && canPlace(board, piece.shape.cells, row, col);
      setDrag({ uid: piece.uid, x: e.clientX, y: e.clientY, row, col, valid });
      setSelectedUid(piece.uid);
    },
    [board, gameOver, cellFromPointer],
  );

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const piece = tray.find((p) => p.uid === drag.uid);
      if (!piece) return;
      const el = boardRef.current;
      if (!el) return;
      const { row, col } = boardCellFromPoint(
        el.getBoundingClientRect(),
        e.clientX,
        e.clientY,
        piece.shape.cells,
      );
      const valid =
        row !== null && col !== null && canPlace(board, piece.shape.cells, row, col);
      setDrag({ uid: drag.uid, x: e.clientX, y: e.clientY, row, col, valid });
    };
    const up = () => {
      const piece = tray.find((p) => p.uid === drag.uid);
      if (piece && drag.row !== null && drag.col !== null && drag.valid) {
        // commitPlace из замыкания — берём актуальный через ref-safe вызов:
        // проще вызвать логику напрямую, т.к. effect зависит от commitPlace
        commitRef.current?.(piece, drag.row, drag.col);
      }
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag, board, tray]);

  // ref чтобы pointerup всегда вызывал свежий commitPlace без перезапуска effect
  const commitRef = useRef(commitPlace);
  commitRef.current = commitPlace;

  const onBoardClick = useCallback(
    (r: number, c: number) => {
      if (gameOver || !selectedUid || drag) return;
      const piece = tray.find((p) => p.uid === selectedUid);
      if (!piece || piece.used) return;
      for (let pr = 0; pr < piece.shape.cells.length; pr++) {
        for (let pc = 0; pc < piece.shape.cells[0].length; pc++) {
          if (!piece.shape.cells[pr][pc]) continue;
          const row = r - pr;
          const col = c - pc;
          if (canPlace(board, piece.shape.cells, row, col)) {
            commitPlace(piece, row, col);
            return;
          }
        }
      }
    },
    [gameOver, selectedUid, drag, tray, board, commitPlace],
  );

  // ghost-подсветка для активного drag / выбранной фигуры
  const ghosts: (number | null)[][] = board.map((rowArr) => rowArr.map(() => null));
  const activeUid = drag?.uid ?? selectedUid;
  const active = activeUid ? tray.find((p) => p.uid === activeUid) : undefined;
  if (
    active &&
    !active.used &&
    drag &&
    drag.uid === active.uid &&
    drag.row !== null &&
    drag.col !== null &&
    drag.valid
  ) {
    const h = active.shape.cells.length;
    const w = active.shape.cells[0].length;
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        if (active.shape.cells[r][c]) ghosts[drag.row + r][drag.col + c] = active.color;
      }
    }
  }

  return {
    board,
    tray,
    score,
    best,
    selectedUid,
    gameOver,
    streak,
    lastMove,
    drag,
    flash,
    msgs,
    ghosts,
    boardRef,
    pieceByUid,
    commitPlace,
    restart,
    onPiecePointerDown,
    onBoardClick,
    selectPiece,
  };
}
