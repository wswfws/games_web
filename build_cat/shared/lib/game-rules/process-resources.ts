import type { Cell, ResourceType } from "@/shared/entities/game";
import { GRID_WIDTH, GRID_HEIGHT, BUILDING_DEFS } from "@/shared/entities/game";
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

function produceResources(workGrid: Cell[][]): void {
  for (const row of workGrid) {
    for (const cell of row) {
      const { building } = cell;
      if (!building || !building.output) continue;

      const def = BUILDING_DEFS[building.type];

      if (def.requiresFloor && building.assignedCats >= def.catWorkers && cell.floor === def.requiresFloor) {
        building.resources.push(building.output);
      }
    }
  }
}

interface TransferPlan {
  transfers: ResourceType[][][];
  movedSources: boolean[][];
  snapshot: ResourceType[][][];
}

function planTransfers(workGrid: Cell[][]): TransferPlan {
  const height = workGrid.length;
  const width = workGrid[0].length;

  const transfers: ResourceType[][][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => [] as ResourceType[]),
  );
  const movedSources: boolean[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false),
  );
  const snapshot = workGrid.map(row =>
    row.map(cell => (cell.building ? [...cell.building.resources] : [])),
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = workGrid[y][x];
      if (!cell.building) continue;
      if (!BUILDING_DEFS[cell.building.type].canExport) continue;
      const items = snapshot[y][x];
      if (items.length === 0) continue;

      const next = getNextCoords(x, y, cell.building.direction);
      if (!next) continue;
      const [nx, ny] = next;
      const dest = workGrid[ny]?.[nx];
      if (!dest?.building) continue;
      if (!BUILDING_DEFS[dest.building.type].acceptsResources) continue;

      transfers[ny][nx].push(...items);
      movedSources[y][x] = true;
    }
  }

  return { transfers, movedSources, snapshot };
}

function applyTransfers(workGrid: Cell[][], plan: TransferPlan): void {
  const { transfers, movedSources, snapshot } = plan;

  for (let y = 0; y < workGrid.length; y++) {
    for (let x = 0; x < workGrid[y].length; x++) {
      const cell = workGrid[y][x];
      if (!cell.building) continue;

      if (transfers[y][x].length > 0) {
        cell.building.resources.push(...transfers[y][x]);
      }

      if (movedSources[y][x]) {
        const sourceItems = new Set(snapshot[y][x]);
        cell.building.resources = cell.building.resources.filter(r => !sourceItems.has(r));
      }
    }
  }
}

export function processResources(grid: Cell[][]): Cell[][] {
  const workGrid = grid.map(row =>
    row.map(cell => ({
      ...cell,
      building: cell.building
        ? { ...cell.building, resources: [...cell.building.resources], assignedCats: cell.building.assignedCats ?? 0 }
        : undefined,
    })),
  );

  produceResources(workGrid);
  const plan = planTransfers(workGrid);
  applyTransfers(workGrid, plan);

  return workGrid;
}
