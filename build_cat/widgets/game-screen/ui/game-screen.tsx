"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {createInitialGame, rotateBuilding, updateGameTick} from "@/features/game";
import {GameBoard} from "@/widgets/game-board/ui/game-board";
import {BuildingToolbar} from "@/widgets/building-toolbar/ui/building-toolbar";
import type {BuildingType, GameState} from "@/shared/entities/game";

export function GameScreen() {
  const initial = createInitialGame();
  const gameRef = useRef<GameState>(initial);
  const [viewGame, setViewGame] = useState<GameState>(initial);
  const hoveredCell = useRef<[number, number] | null>(null);

  const onCellClick = useCallback((x: number, y: number) => {
    const buildings: BuildingType[] = ["drill", "sawmill", "conveyor"];
    const selected = buildings[gameRef.current.selectedSlot];

    // mutate game ref and update snapshot for render
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

    gameRef.current = {...gameRef.current, grid: newGrid};
    setViewGame({...gameRef.current});
  }, []);

  const onCellRightClick = useCallback((x: number, y: number) => {
    // mutate game ref and update snapshot for render
    const newGrid = gameRef.current.grid.map(row => [...row]);
    const cell = newGrid[y][x];
    if (cell.building) {
      cell.building = undefined;
    }
    gameRef.current = {...gameRef.current, grid: newGrid};
    setViewGame({...gameRef.current});
  }, []);

  const onCellRotate = useCallback((x: number, y: number) => {
    // mutate game ref and update snapshot for render
    const newGrid = structuredClone(gameRef.current.grid);
    const cell = newGrid[y][x];
    if (cell.building) {
      const oldDir = cell.building.direction;
      const newDir = rotateBuilding(oldDir);
      cell.building.direction = newDir;
      console.log(`Rotating from ${oldDir} to ${newDir}`);
    }
    gameRef.current = {...gameRef.current, grid: newGrid};
    setViewGame({...gameRef.current});
    console.log(`Rotated building at (${x}, ${y})`);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      gameRef.current = updateGameTick(gameRef.current);
      setViewGame({...gameRef.current});
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key >= "0" && key <= "9") {
        const slot = key === "0" ? 9 : parseInt(key) - 1;
        gameRef.current = {...gameRef.current, selectedSlot: slot};
        setViewGame({...gameRef.current});
      }

      if (key === " ") {
        e.preventDefault();
        gameRef.current = {...gameRef.current, paused: !gameRef.current.paused};
        setViewGame({...gameRef.current});
      }

      if (key === "r" && hoveredCell.current) {
        e.preventDefault();
        const [x, y] = hoveredCell.current;
        onCellRotate(x, y);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCellRotate]);

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
      <BuildingToolbar
        selectedSlot={viewGame.selectedSlot}
        paused={viewGame.paused}
      />
    </main>
  );
}
