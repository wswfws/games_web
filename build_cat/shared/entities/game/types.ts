export type FloorType = "grass" | "ore" | "rock";
export type ResourceType = "ore" | "wood";
export type BuildingType = "drill" | "sawmill" | "conveyor";
export type Direction = "up" | "down" | "left" | "right";

export interface FloorDefinition {
  label: string;
  description: string;
  color: string;
}

export interface Building {
  type: BuildingType;
  direction: Direction;
  resources: ResourceType[];
  output: ResourceType | null;
  productivity: number;
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
}
