"use client";

import { useState, useEffect } from "react";
import { createInitialGame, updateGameTick, type GameState } from "@/features/game";
import { GameBoard } from "@/widgets/game-board/ui/game-board";
import { BuildingToolbar } from "@/widgets/building-toolbar/ui/building-toolbar";
import type { BuildingType } from "@/shared/entities/game";

export function GameScreen() {
  const [game, setGame] = useState<GameState>(() => createInitialGame());

  useEffect(() => {
    const interval = setInterval(() => {
      setGame(prev => updateGameTick(prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= "0" && key <= "9") {
        const slot = key === "0" ? 9 : parseInt(key) - 1;
        setGame(prev => ({ ...prev, selectedSlot: slot }));
      }
      if (key === " ") {
        e.preventDefault();
        setGame(prev => ({ ...prev, paused: !prev.paused }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onCellClick = (x: number, y: number) => {
    const buildings: BuildingType[] = ["drill", "sawmill", "conveyor"];
    const selected = buildings[game.selectedSlot];

    setGame(prev => {
      const newGrid = prev.grid.map(row => [...row]);
      const cell = newGrid[y][x];

      if (!cell.building) {
        cell.building = {
          type: selected,
          resources: [],
          output: selected === "drill" ? "ore" : selected === "sawmill" ? "wood" : null,
          productivity: 1,
        };
      }

      return { ...prev, grid: newGrid };
    });
  };

  const onCellContextMenu = (x: number, y: number) => {
    setGame(prev => {
      const newGrid = prev.grid.map(row => [...row]);
      const cell = newGrid[y][x];
      if (cell.building) {
        cell.building = undefined;
      }
      return { ...prev, grid: newGrid };
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <section className="flex-1 overflow-hidden bg-slate-900/20">
        <GameBoard
          game={game}
          onCellClick={onCellClick}
          onCellContextMenu={onCellContextMenu}
        />
      </section>
      <BuildingToolbar
        selectedSlot={game.selectedSlot}
        paused={game.paused}
      />
    </main>
  );
}
