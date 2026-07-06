"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {createInitialGame, rotateBuilding, updateGameTick} from "@/features/game";
import {GameBoard} from "@/widgets/game-board/ui/game-board";
import {BuildingToolbar} from "@/widgets/building-toolbar/ui/building-toolbar";
import type {BuildingType, GameState} from "@/shared/entities/game";

export function GameScreen() {
  const game = useRef<GameState>(createInitialGame());
  const [, setTick] = useState(0);
  const hoveredCell = useRef<[number, number] | null>(null);

  const onCellClick = useCallback((x: number, y: number) => {
    const buildings: BuildingType[] = ["drill", "sawmill", "conveyor"];
    const selected = buildings[game.current.selectedSlot];

    // mutate game ref and trigger rerender
    {
      const newGrid = game.current.grid.map(row => [...row]);
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

      game.current = {...game.current, grid: newGrid};
      setTick(t => t + 1);
    }
  }, []);

  const onCellRightClick = useCallback((x: number, y: number) => {
    console.log("onCellRightClick")
    // mutate game ref and trigger rerender
    {
      console.log("setGame onCellRightClick")
      const newGrid = game.current.grid.map(row => [...row]);
      const cell = newGrid[y][x];
      if (cell.building) {
        cell.building = undefined;
      }
      game.current = {...game.current, grid: newGrid};
      setTick(t => t + 1);
    }
  }, []);

  const onCellRotate = useCallback((x: number, y: number) => {
    console.log("on Start CellRotate", x, y);
    // mutate game ref and trigger rerender
    {
      const newGrid = structuredClone(game.current.grid);
      const cell = newGrid[y][x];
      if (cell.building) {
        const oldDir = cell.building.direction;
        const newDir = rotateBuilding(oldDir);
        cell.building.direction = newDir;
        console.log(`Rotating from ${oldDir} to ${newDir}`);
      }
      game.current = {...game.current, grid: newGrid};
      setTick(t => t + 1);
    }
    console.log(`Rotated building at (${x}, ${y})`);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      game.current = updateGameTick(game.current);
      setTick(t => t + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key >= "0" && key <= "9") {
        const slot = key === "0" ? 9 : parseInt(key) - 1;
        game.current = {...game.current, selectedSlot: slot};
        setTick(t => t + 1);
      }

      if (key === " ") {
        e.preventDefault();
        game.current = {...game.current, paused: !game.current.paused};
        setTick(t => t + 1);
      }

      if (key === "r" && hoveredCell.current) {
        console.log("click r")
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
          game={game.current}
          onCellClick={onCellClick}
          onCellRightClick={onCellRightClick}
          onCellRotate={onCellRotate}
          onCellHover={(cell) => hoveredCell.current = cell}
        />
      </section>
      <BuildingToolbar
        selectedSlot={game.current.selectedSlot}
        paused={game.current.paused}
      />
    </main>
  );
}
