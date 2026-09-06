import {useCallback, useEffect, useRef, useState} from "react";
import {createInitialGame, rotateBuilding, updateGameTick} from "@/features/game";
import {GameBoard} from "@/widgets/game-board/ui/game-board";
import {BuildingToolbar} from "@/widgets/building-toolbar/ui/building-toolbar";
import { PlayPauseButton } from "@/widgets/game-screen/ui/play-pause-button";
import { HelpButton } from "@/widgets/game-screen/ui/help-button";
import type {GameState} from "@/shared/entities/game";

import { BUILDINGS, BUILDING_DEFS, DEFAULT_DIRECTION, TICK_INTERVAL_MS, STARVATION_INTERVAL, HOUSE_CATS_BONUS, FEEDINGS_PER_KITTEN, INITIAL_MAX_CATS } from "@/shared/entities/game";

export function GameScreen({ onOpenWiki }: { onOpenWiki?: () => void }) {
  const initial = createInitialGame();
  const gameRef = useRef<GameState>(initial);
  const [viewGame, setViewGame] = useState<GameState>(initial);
  const hoveredCell = useRef<[number, number] | null>(null);

  const flush = useCallback((next?: GameState) => {
    if (next) gameRef.current = next;
    setViewGame({...gameRef.current});
  }, []);

  const onSelect = useCallback((index: number) => {
    flush({...gameRef.current, selectedSlot: index});
  }, [flush]);

  const togglePaused = useCallback(() => {
    flush({...gameRef.current, paused: !gameRef.current.paused});
  }, [flush]);

  const restart = useCallback(() => {
    const fresh = createInitialGame();
    gameRef.current = fresh;
    setViewGame(fresh);
  }, []);

  const onCellClick = useCallback((x: number, y: number) => {
    if (gameRef.current.gameOver) return;
    const selected = BUILDINGS[gameRef.current.selectedSlot];
    const newGrid = structuredClone(gameRef.current.grid);
    const cell = newGrid[y][x];

    if (cell.building) return;

    const def = BUILDING_DEFS[selected];
    if (def.requiresFloor && cell.floor !== def.requiresFloor) return;

    if (def.catWorkers > 0) {
      const assigned = newGrid.reduce(
        (sum, row) => sum + row.reduce((s, c) => s + (c.building?.assignedCats ?? 0), 0),
        0,
      );
      const free = gameRef.current.totalCats - assigned;
      if (free < def.catWorkers) return;
    }

    const next: Partial<GameState> = { grid: newGrid };

    if (selected === "house") {
      next.maxCats = gameRef.current.maxCats + HOUSE_CATS_BONUS;
    }

    cell.building = {
      type: selected,
      direction: DEFAULT_DIRECTION,
      resources: [],
      output: def.output,
      assignedCats: def.catWorkers,
    };

    flush({...gameRef.current, ...next});
  }, [flush]);

  const onCellRightClick = useCallback((x: number, y: number) => {
    if (gameRef.current.gameOver) return;
    const newGrid = structuredClone(gameRef.current.grid);
    const cell = newGrid[y][x];
    if (cell.building && BUILDING_DEFS[cell.building.type].canRemove) {
      const next: Partial<GameState> = { grid: newGrid };

      if (cell.building.type === "house") {
        next.maxCats = Math.max(INITIAL_MAX_CATS, gameRef.current.maxCats - HOUSE_CATS_BONUS);
      }

      cell.building = undefined;
      flush({...gameRef.current, ...next});
    } else {
      flush({...gameRef.current, grid: newGrid});
    }
  }, [flush]);

  const onCellRotate = useCallback((x: number, y: number) => {
    if (gameRef.current.gameOver) return;
    const newGrid = structuredClone(gameRef.current.grid);
    const cell = newGrid[y][x];
    if (cell.building) cell.building.direction = rotateBuilding(cell.building.direction);
    flush({...gameRef.current, grid: newGrid});
  }, [flush]);

  useEffect(() => {
    const id = setInterval(() => flush(updateGameTick(gameRef.current)), TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [flush]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key >= "0" && key <= "9") {
        const slot = key === "0" ? 9 : parseInt(key) - 1;
        flush({...gameRef.current, selectedSlot: slot});
        return;
      }

      if (key === " ") {
        e.preventDefault();
        flush({...gameRef.current, paused: !gameRef.current.paused});
        return;
      }

      if (key === "r" && hoveredCell.current) {
        e.preventDefault();
        const [x, y] = hoveredCell.current;
        onCellRotate(x, y);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCellRotate, flush]);

  const assignedCats = viewGame.grid.reduce(
    (sum, row) => sum + row.reduce((s, c) => s + (c.building?.assignedCats ?? 0), 0),
    0,
  );
  const freeCats = viewGame.totalCats - assignedCats;
  const tickProgress = viewGame.tick % STARVATION_INTERVAL;
  const fishNeeded = isNaN(viewGame.totalCats) ? 0 : viewGame.totalCats;
  const feedProgress = viewGame.consecutiveFeedings ?? 0;
  const feedBarPct = (feedProgress / FEEDINGS_PER_KITTEN) * 100;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-1.5 bg-slate-800/70 backdrop-blur-md rounded-2xl px-4 py-3 border border-slate-700 text-sm min-w-[160px]">
        <div className="flex items-center justify-between">
          <span>🐱</span>
          <span className="font-bold text-yellow-300">{freeCats}</span>
          <span className="text-slate-500">/</span>
          <span className="font-bold text-cyan-300">{viewGame.totalCats}</span>
          <span className="text-slate-500">/</span>
          <span className="font-bold text-violet-300">{viewGame.maxCats}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>🍲</span>
          <span>🐟×{fishNeeded} / {STARVATION_INTERVAL} тиков</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span className="text-slate-500">⏱️</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${(tickProgress / STARVATION_INTERVAL) * 100}%` }}
            />
          </div>
          <span className="w-4 text-right">{tickProgress}</span>
        </div>
        {viewGame.totalCats < viewGame.maxCats && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>🐱+1</span>
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all"
                style={{ width: `${feedBarPct}%` }}
              />
            </div>
            <span className="w-4 text-right text-yellow-400">{feedProgress}/{FEEDINGS_PER_KITTEN}</span>
          </div>
        )}
      </div>

      <section className="flex-1 overflow-hidden bg-slate-900/20">
        <GameBoard
          game={viewGame}
          onCellClick={onCellClick}
          onCellRightClick={onCellRightClick}
          onCellRotate={onCellRotate}
          onCellHover={(cell) => (hoveredCell.current = cell)}
        />
      </section>

      <BuildingToolbar selectedSlot={viewGame.selectedSlot} onSelect={onSelect} />

      <HelpButton onOpenWiki={onOpenWiki} />
      <PlayPauseButton paused={viewGame.paused} onToggle={togglePaused} />

      {viewGame.gameOver && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80">
          <div className="text-6xl mb-4">😿</div>
          <h2 className="text-3xl font-bold text-red-400 mb-2">Котики голодны!</h2>
          <p className="text-slate-400 mb-6">Не забудь доставить рыбу на кухню</p>
          <button
            onClick={restart}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-full transition-all"
          >
            Начать заново
          </button>
        </div>
      )}
    </main>
  );
}
