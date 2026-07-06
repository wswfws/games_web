"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {createInitialGame, rotateBuilding, updateGameTick} from "@/features/game";
import {GameBoard} from "@/widgets/game-board/ui/game-board";
import {BuildingToolbar} from "@/widgets/building-toolbar/ui/building-toolbar";
import type {BuildingType, GameState} from "@/shared/entities/game";

const BUILDINGS: BuildingType[] = ["drill", "sawmill", "conveyor"];

export function GameScreen() {
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

  const onCellClick = useCallback((x: number, y: number) => {
    const selected = BUILDINGS[gameRef.current.selectedSlot];
    const newGrid = gameRef.current.grid.map(row => [...row]);
    const cell = newGrid[y][x];

    if (!cell.building) {
      cell.building = {
        type: selected,
        direction: "right",
        resources: [],
        output: selected === "drill" ? "ore" : selected === "sawmill" ? "wood" : null,
        productivity: 1,
      };
    }

    flush({...gameRef.current, grid: newGrid});
  }, [flush]);

  const onCellRightClick = useCallback((x: number, y: number) => {
    const newGrid = gameRef.current.grid.map(row => [...row]);
    const cell = newGrid[y][x];
    if (cell.building) cell.building = undefined;
    flush({...gameRef.current, grid: newGrid});
  }, [flush]);

  const onCellRotate = useCallback((x: number, y: number) => {
    const newGrid = structuredClone(gameRef.current.grid);
    const cell = newGrid[y][x];
    if (cell.building) cell.building.direction = rotateBuilding(cell.building.direction);
    flush({...gameRef.current, grid: newGrid});
  }, [flush]);

  useEffect(() => {
    const id = setInterval(() => flush(updateGameTick(gameRef.current)), 500);
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <section className="flex-1 overflow-hidden bg-slate-900/20">
        <GameBoard
          game={viewGame}
          onCellClick={onCellClick}
          onCellRightClick={onCellRightClick}
          onCellRotate={onCellRotate}
          onCellHover={(cell) => (hoveredCell.current = cell)}
        />
      </section>

      <BuildingToolbar selectedSlot={viewGame.selectedSlot} paused={viewGame.paused} onSelect={onSelect} />
    </main>
  );
}
