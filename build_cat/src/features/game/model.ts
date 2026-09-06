import type { Cell, GameState, Direction } from "@/shared/entities/game";
import { GRID_WIDTH, GRID_HEIGHT, DIRECTION_ORDER, INITIAL_TOTAL_CATS, INITIAL_MAX_CATS, STARVATION_INTERVAL, FEEDINGS_PER_KITTEN, DEFAULT_DIRECTION, KITCHEN_X, KITCHEN_Y } from "@/shared/entities/game";
import { randomFloor } from "@/shared/lib/game-generator";
import { processResources } from "@/shared/lib/game-rules";

export function createInitialGame(): GameState {
  const grid: Cell[][] = Array.from({ length: GRID_HEIGHT }, (_, y) =>
    Array.from({ length: GRID_WIDTH }, (_, x) => ({
      floor: randomFloor(x, y, GRID_WIDTH, GRID_HEIGHT),
    })),
  );

  grid[KITCHEN_Y][KITCHEN_X].floor = "grass";
  grid[KITCHEN_Y][KITCHEN_X].building = {
    type: "kitchen",
    direction: DEFAULT_DIRECTION,
    resources: [],
    output: null,
    assignedCats: 0,
  };

  return {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    grid,
    tick: 0,
    paused: true,
    selectedSlot: 0,
    totalCats: INITIAL_TOTAL_CATS,
    maxCats: INITIAL_MAX_CATS,
    consecutiveFeedings: 0,
    gameOver: false,
  };
}

function checkStarvation(grid: Cell[][], totalCats: number): boolean {
  for (const row of grid) {
    for (const cell of row) {
      if (cell.building?.type !== "kitchen") continue;

      const fishCount = cell.building.resources.filter(r => r === "fish").length;

      if (fishCount >= totalCats) {
        let needed = totalCats;
        cell.building.resources = cell.building.resources.filter(r => {
          if (needed > 0 && r === "fish") {
            needed--;
            return false;
          }
          return true;
        });
        return false;
      }

      return true;
    }
  }

  return false;
}

export function updateGameTick(game: GameState): GameState {
  if (game.paused || game.gameOver) return game;

  const newGrid = processResources(game.grid);

  if ((game.tick + 1) % STARVATION_INTERVAL === 0) {
    if (checkStarvation(newGrid, game.totalCats)) {
      return { ...game, grid: newGrid, tick: game.tick + 1, gameOver: true, paused: true };
    }

    let newFeedings = game.consecutiveFeedings + 1;
    let newTotalCats = game.totalCats;

    if (newFeedings >= FEEDINGS_PER_KITTEN && game.totalCats < game.maxCats) {
      newTotalCats++;
      newFeedings = 0;
    }

    return {
      ...game,
      grid: newGrid,
      tick: game.tick + 1,
      totalCats: newTotalCats,
      consecutiveFeedings: newFeedings,
    };
  }

  return {
    ...game,
    grid: newGrid,
    tick: game.tick + 1,
  };
}

export function rotateBuilding(direction: Direction): Direction {
  const currentIndex = DIRECTION_ORDER.indexOf(direction);
  const nextIndex = (currentIndex + 1) % DIRECTION_ORDER.length;
  return DIRECTION_ORDER[nextIndex];
}
