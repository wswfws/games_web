import { useCallback, useEffect, useRef, useState } from 'react';
import { VERSUS_MAX_PIECES } from '@/shared/config/game';
import { boardCellFromPoint } from '@/shared/lib/dom';
import { anyFit, canPlace, emptyBoard, type Board } from '@/entities/board';
import {
  newTray,
  type DragState,
  type TrayPiece,
} from '@/entities/piece';
import { AI_TUNING, suggestVersusMove } from '@/features/ai-move';
import { commitVersusMove, type VersusSide } from '../lib/moves';
import type { FloatMsg } from '@/features/game-session';

export type { VersusSide } from '../lib/moves';

export type VersusWinner = 'human' | 'bot' | 'draw' | null;

interface VersusState {
  board: Board;
  humanTray: TrayPiece[];
  botTray: TrayPiece[];
  humanScore: number;
  botScore: number;
  humanStreak: number;
  botStreak: number;
  turn: VersusSide;
  placed: number;
  passes: number;
  done: boolean;
  winner: VersusWinner;
  selectedUid: string | null;
  drag: DragState | null;
  flash: Set<string>;
  msgs: FloatMsg[];
  lastHuman: Set<string>;
  lastBot: Set<string>;
}

function initialState(): VersusState {
  return {
    board: emptyBoard(),
    humanTray: newTray(),
    botTray: newTray(),
    humanScore: 0,
    botScore: 0,
    humanStreak: 0,
    botStreak: 0,
    turn: 'human',
    placed: 0,
    passes: 0,
    done: false,
    winner: null,
    selectedUid: null,
    drag: null,
    flash: new Set(),
    msgs: [],
    lastHuman: new Set(),
    lastBot: new Set(),
  };
}

function decideWinner(humanScore: number, botScore: number): VersusWinner {
  if (humanScore > botScore) return 'human';
  if (botScore > humanScore) return 'bot';
  return 'draw';
}

export interface VersusSession {
  board: Board;
  humanTray: TrayPiece[];
  botTray: TrayPiece[];
  humanScore: number;
  botScore: number;
  turn: VersusSide;
  botThinking: boolean;
  placed: number;
  done: boolean;
  winner: VersusWinner;
  selectedUid: string | null;
  drag: DragState | null;
  flash: Set<string>;
  msgs: FloatMsg[];
  lastHuman: Set<string>;
  lastBot: Set<string>;
  ghosts: (number | null)[][];
  boardRef: React.RefObject<HTMLDivElement | null>;
  pieceByUid: (uid: string) => TrayPiece | undefined;
  restart: () => void;
  onPiecePointerDown: (e: React.PointerEvent, piece: TrayPiece) => void;
  onBoardClick: (row: number, col: number) => void;
  selectPiece: (uid: string) => void;
}

/**
 * features/versus-game: партия на общем поле. Ходы по очереди, человек первый.
 * Лоток восполняется сразу после траты фигуры. Конец — 100 фигур на двоих
 * или два паса подряд. Очки у каждого свои.
 */
export function useVersusSession(): VersusSession {
  const [state, setState] = useState<VersusState>(initialState);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const msgId = useRef(0);

  const pushMsgs = useCallback((prev: FloatMsg[], texts: string[]): FloatMsg[] => {
    const next = [...prev];
    for (const text of texts) next.push({ id: ++msgId.current, text });
    return next.slice(-3);
  }, []);

  // --- ход бота: планируем после хода человека, чистый переход внутри setState ---
  useEffect(() => {
    if (state.turn !== 'bot' || state.done) return;
    const timer = window.setTimeout(() => {
      setState((st) => {
        if (st.done || st.turn !== 'bot') return st;
        const suggestion = suggestVersusMove(
          st.board,
          st.botTray,
          st.humanTray,
          AI_TUNING.versusDepth,
          AI_TUNING,
          st.botStreak,
          st.humanStreak,
        );
        if (!suggestion) {
          const passes = st.passes + 1;
          const done = passes >= 2;
          return {
            ...st,
            passes,
            done,
            winner: done ? decideWinner(st.humanScore, st.botScore) : null,
            turn: 'human' as VersusSide,
            msgs: pushMsgs(st.msgs, ['У бота нет ходов — пас']),
          };
        }
        const piece = st.botTray.find((p) => p.uid === suggestion.move.uid);
        if (!piece) return { ...st, turn: 'human' as VersusSide };
        const out = commitVersusMove(st.board, st.botTray, piece, suggestion.move.row, suggestion.move.col, st.botStreak);
        const placed = st.placed + 1;
        const done = placed >= VERSUS_MAX_PIECES;
        const botScore = st.botScore + out.gained;
        if (done) {
          return {
            ...st,
            board: out.board,
            botTray: out.tray,
            botScore,
            botStreak: out.streak,
            placed,
            passes: 0,
            done: true,
            winner: decideWinner(st.humanScore, botScore),
            flash: out.flashKeys,
            lastBot: out.placedKeys,
            msgs: pushMsgs(st.msgs, out.comboText ? [out.comboText] : []),
          };
        }
        // автопас человека, если ему некуда ходить
        const humanStuck = !st.humanTray.some((p) => anyFit(out.board, p.shape.cells));
        if (humanStuck) {
          const passes = st.passes + 1;
          const stuckDone = passes >= 2;
          return {
            ...st,
            board: out.board,
            botTray: out.tray,
            botScore,
            botStreak: out.streak,
            placed,
            passes,
            done: stuckDone,
            winner: stuckDone ? decideWinner(st.humanScore, botScore) : null,
            turn: 'bot' as VersusSide,
            flash: out.flashKeys,
            lastBot: out.placedKeys,
            msgs: pushMsgs(st.msgs, [...(out.comboText ? [out.comboText] : []), 'Некуда ходить — пас']),
          };
        }
        return {
          ...st,
          board: out.board,
          botTray: out.tray,
          botScore,
          botStreak: out.streak,
          placed,
          passes: 0,
          turn: 'human' as VersusSide,
          flash: out.flashKeys,
          lastBot: out.placedKeys,
          msgs: pushMsgs(st.msgs, out.comboText ? [out.comboText] : []),
        };
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [state.turn, state.done, pushMsgs]);

  // --- гасим подсветку сжигания ---
  useEffect(() => {
    if (state.flash.size === 0) return;
    const timer = window.setTimeout(() => setState((st) => ({ ...st, flash: new Set() })), 350);
    return () => window.clearTimeout(timer);
  }, [state.flash]);

  // --- тосты исчезают сами ---
  useEffect(() => {
    if (state.msgs.length === 0) return;
    const timer = window.setTimeout(() => setState((st) => ({ ...st, msgs: [] })), 1400);
    return () => window.clearTimeout(timer);
  }, [state.msgs]);

  const pieceByUid = useCallback(
    (uid: string) => state.humanTray.find((p) => p.uid === uid),
    [state.humanTray],
  );

  const restart = useCallback(() => {
    msgId.current = 0;
    setState(initialState());
  }, []);

  const humanPlace = useCallback(
    (piece: TrayPiece, row: number, col: number): boolean => {
      let ok = false;
      setState((st) => {
        if (st.done || st.turn !== 'human') return st;
        if (!canPlace(st.board, piece.shape.cells, row, col)) return st;
        ok = true;
        const out = commitVersusMove(st.board, st.humanTray, piece, row, col, st.humanStreak);
        const placed = st.placed + 1;
        const done = placed >= VERSUS_MAX_PIECES;
        const humanScore = st.humanScore + out.gained;
        return {
          ...st,
          board: out.board,
          humanTray: out.tray,
          humanScore,
          humanStreak: out.streak,
          placed,
          passes: 0,
          done,
          winner: done ? decideWinner(humanScore, st.botScore) : null,
          turn: 'bot' as VersusSide,
          selectedUid: null,
          drag: null,
          flash: out.flashKeys,
          lastHuman: out.placedKeys,
          msgs: pushMsgs(st.msgs, out.comboText ? [out.comboText] : []),
        };
      });
      return ok;
    },
    [pushMsgs],
  );

  const selectPiece = useCallback(
    (uid: string) => {
      const p = state.humanTray.find((x) => x.uid === uid);
      if (p && !p.used && !state.done && state.turn === 'human') {
        setState((st) => ({ ...st, selectedUid: uid }));
      }
    },
    [state.humanTray, state.done, state.turn],
  );

  // --- drag & drop человека (как в соло) ---
  const cellFromPointer = useCallback((clientX: number, clientY: number, piece: TrayPiece) => {
    const el = boardRef.current;
    if (!el) return { row: null as number | null, col: null as number | null };
    return boardCellFromPoint(el.getBoundingClientRect(), clientX, clientY, piece.shape.cells);
  }, []);

  const onPiecePointerDown = useCallback(
    (e: React.PointerEvent, piece: TrayPiece) => {
      if (piece.used || state.done || state.turn !== 'human') return;
      const st = state;
      const { row, col } = cellFromPointer(e.clientX, e.clientY, piece);
      const valid = row !== null && col !== null && canPlace(st.board, piece.shape.cells, row, col);
      setState((s) => ({ ...s, drag: { uid: piece.uid, x: e.clientX, y: e.clientY, row, col, valid }, selectedUid: piece.uid }));
    },
    [state, cellFromPointer],
  );

  useEffect(() => {
    const drag = state.drag;
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setState((st) => {
        const piece = st.humanTray.find((p) => p.uid === drag.uid);
        if (!piece || !boardRef.current) return st;
        const { row, col } = boardCellFromPoint(
          boardRef.current.getBoundingClientRect(),
          e.clientX,
          e.clientY,
          piece.shape.cells,
        );
        const valid = row !== null && col !== null && canPlace(st.board, piece.shape.cells, row, col);
        return { ...st, drag: { uid: drag.uid, x: e.clientX, y: e.clientY, row, col, valid } };
      });
    };
    const up = () => {
      setState((st) => {
        const d = st.drag;
        if (!d) return st;
        const piece = st.humanTray.find((p) => p.uid === d.uid);
        if (piece && d.row !== null && d.col !== null && d.valid && st.turn === 'human' && !st.done) {
          if (!canPlace(st.board, piece.shape.cells, d.row, d.col)) return { ...st, drag: null };
          const out = commitVersusMove(st.board, st.humanTray, piece, d.row, d.col, st.humanStreak);
          const placed = st.placed + 1;
          const done = placed >= VERSUS_MAX_PIECES;
          const humanScore = st.humanScore + out.gained;
          return {
            ...st,
            board: out.board,
            humanTray: out.tray,
            humanScore,
            humanStreak: out.streak,
            placed,
            passes: 0,
            done,
            winner: done ? decideWinner(humanScore, st.botScore) : null,
            turn: 'bot' as VersusSide,
            selectedUid: null,
            drag: null,
            flash: out.flashKeys,
            lastHuman: out.placedKeys,
            msgs: pushMsgs(st.msgs, out.comboText ? [out.comboText] : []),
          };
        }
        return { ...st, drag: null };
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [state.drag, pushMsgs]);

  const onBoardClick = useCallback(
    (r: number, c: number) => {
      const st = state;
      if (st.done || st.turn !== 'human' || !st.selectedUid || st.drag) return;
      const piece = st.humanTray.find((p) => p.uid === st.selectedUid);
      if (!piece || piece.used) return;
      for (let pr = 0; pr < piece.shape.cells.length; pr++) {
        for (let pc = 0; pc < piece.shape.cells[0].length; pc++) {
          if (!piece.shape.cells[pr][pc]) continue;
          if (humanPlace(piece, r - pr, c - pc)) return;
        }
      }
    },
    [state, humanPlace],
  );

  // ghost-подсветка перетаскиваемой фигуры
  const ghosts: (number | null)[][] = state.board.map((rowArr) => rowArr.map(() => null));
  const drag = state.drag;
  if (drag && drag.row !== null && drag.col !== null && drag.valid) {
    const active = state.humanTray.find((p) => p.uid === drag.uid);
    if (active && !active.used) {
      const h = active.shape.cells.length;
      const w = active.shape.cells[0].length;
      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          if (active.shape.cells[r][c]) ghosts[drag.row + r][drag.col + c] = active.color;
        }
      }
    }
  }

  return {
    board: state.board,
    humanTray: state.humanTray,
    botTray: state.botTray,
    humanScore: state.humanScore,
    botScore: state.botScore,
    turn: state.turn,
    botThinking: state.turn === 'bot' && !state.done,
    placed: state.placed,
    done: state.done,
    winner: state.winner,
    selectedUid: state.selectedUid,
    drag: state.drag,
    flash: state.flash,
    msgs: state.msgs,
    lastHuman: state.lastHuman,
    lastBot: state.lastBot,
    ghosts,
    boardRef,
    pieceByUid,
    restart,
    onPiecePointerDown,
    onBoardClick,
    selectPiece,
  };
}
