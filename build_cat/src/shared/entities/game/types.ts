export type FloorType = "grass" | "water_fish" | "water_dead" | "rock";
export type ResourceType = "fish";
export type BuildingType = "pier" | "path" | "kitchen" | "house";
export type Direction = "up" | "down" | "left" | "right";

export interface FloorDefinition {
  label: string;
  description: string;
  color: string;
}

export interface BuildingDef {
  label: string;
  color: string;
  output: ResourceType | null;
  icon: string;
  acceptsResources: boolean;
  canExport: boolean;
  canRemove: boolean;
  requiresFloor: FloorType | null;
  catWorkers: number;
}

export interface Building {
  type: BuildingType;
  direction: Direction;
  resources: ResourceType[];
  output: ResourceType | null;
  assignedCats: number;
}

export interface Cell {
  floor: FloorType;
  building?: Building;
}

export interface GameState {
  width: number;
  height: number;
  grid: Cell[][];
  tick: number;
  paused: boolean;
  selectedSlot: number;
  totalCats: number;
  maxCats: number;
  consecutiveFeedings: number;
  gameOver: boolean;
}
