import type { Cell, ResourceType } from "@/shared/entities/game";
import { GRID_WIDTH, GRID_HEIGHT } from "@/shared/entities/game";
import type { Direction } from "@/shared/entities/game";

function getNextCoords(x: number, y: number, direction: Direction): [number, number] | null {
  switch (direction) {
    case "right":
      return x + 1 < GRID_WIDTH ? [x + 1, y] : null;
    case "left":
      return x > 0 ? [x - 1, y] : null;
    case "down":
      return y + 1 < GRID_HEIGHT ? [x, y + 1] : null;
    case "up":
      return y > 0 ? [x, y - 1] : null;
  }
}

export function processResources(grid: Cell[][]): Cell[][] {
  // shallow-copy cells and building.resources so we can mutate safely
  const workGrid = grid.map(row =>
    row.map(cell => ({
      ...cell,
      building: cell.building
        ? { ...cell.building, resources: [...cell.building.resources] }
        : undefined,
    })),
  );

  // 1) Produce and transform resources (drill -> ore, sawmill converts ore->wood)
  for (let y = 0; y < workGrid.length; y++) {
    for (let x = 0; x < workGrid[y].length; x++) {
      const cell = workGrid[y][x];
      if (!cell.building) continue;

      const { building } = cell;

      if (building.type === "drill" && cell.floor === "ore") {
        building.resources.push("ore");
      }

      if (building.type === "sawmill") {
        const oreIndex = building.resources.indexOf("ore");
        if (oreIndex !== -1) {
          // convert one ore to wood per tick
          building.resources.splice(oreIndex, 1);
          building.resources.push("wood");
        }
      }
    }
  }

  // 2) Plan transfers based on snapshot to ensure each resource moves at most one cell per tick
  const height = workGrid.length;
  const width = workGrid[0]?.length || 0;

  const transfers: (ResourceType[])[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => [] as ResourceType[]),
  );
  const movedSources: boolean[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => false));

  // snapshot of resources to base transfer decisions on
  const snapshot: (ResourceType[])[][] = workGrid.map(row => row.map(cell => (cell.building ? [...cell.building.resources] : [])));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = workGrid[y][x];
      if (!cell.building) continue;
      const items = snapshot[y][x];
      if (items.length === 0) continue;

      const next = getNextCoords(x, y, cell.building.direction);
      if (!next) continue;
      const [nx, ny] = next;
      const dest = workGrid[ny]?.[nx];
      if (!dest?.building) continue;

      const canReceive = dest.building.type === "conveyor" || dest.building.type === "sawmill";
      if (!canReceive) continue;

      // plan moving all items from (x,y) to (nx,ny) this tick
      transfers[ny][nx].push(...items);
      movedSources[y][x] = true;
    }
  }

  // 3) Apply transfers: add to destinations and clear sources that moved
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = workGrid[y][x];
      if (!cell.building) continue;

      // add incoming
      if (transfers[y][x].length > 0) {
        cell.building.resources.push(...transfers[y][x]);
      }

      // clear sources that moved (we moved all snapshot items)
      if (movedSources[y][x]) {
        // remove anything that was present at snapshot time (we assume moved all of it)
        cell.building.resources = cell.building.resources.filter(r => !snapshot[y][x].includes(r));
      }
    }
  }

  return workGrid;
}
