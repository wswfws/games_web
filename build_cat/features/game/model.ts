import type { Cell, GameState, Direction } from "@/shared/entities/game";
import { GRID_WIDTH, GRID_HEIGHT } from "@/shared/entities/game";
import { randomFloor } from "@/shared/lib/game-generator";
import { processResources } from "@/shared/lib/game-rules";

export function createInitialGame(): GameState {
  const grid: Cell[][] = Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => ({
      floor: randomFloor(x, y, GRID_WIDTH, GRID_HEIGHT),
    })),
  );

  return {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    grid,
    tick: 0,
    paused: true,
    selectedSlot: 0,
  };
}

export function updateGameTick(game: GameState): GameState {
  if (game.paused) return game;

  return {
    ...game,
    grid: processResources(game.grid),
    tick: game.tick + 1,
  };
}

const DIRECTION_ORDER: Direction[] = ["right", "down", "left", "up"];

export function rotateBuilding(direction: Direction): Direction {

  console.log("rotateBuilding", direction);
  const currentIndex = DIRECTION_ORDER.indexOf(direction);
  const nextIndex = (currentIndex + 1) % DIRECTION_ORDER.length;
  return DIRECTION_ORDER[nextIndex];
}
