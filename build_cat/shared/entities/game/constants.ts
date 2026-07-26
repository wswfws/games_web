import type { FloorType, FloorDefinition, BuildingType, ResourceType, Direction } from "./types";

export const GRID_WIDTH = 19;
export const GRID_HEIGHT = 9;

export const TICK_INTERVAL_MS = 500;

export const DEFAULT_DIRECTION: Direction = "right";
export const DIRECTION_ORDER: Direction[] = ["right", "down", "left", "up"];

export const FLOOR_DEFS: Record<FloorType, FloorDefinition> = {
  grass: {
    label: "Grass",
    description: "Open ground for most buildings.",
    color: "#21412c",
  },
  ore: {
    label: "Ore",
    description: "Mineable ground for drills.",
    color: "#7f5d2f",
  },
  rock: {
    label: "Rock",
    description: "Solid terrain that blocks construction.",
    color: "#2f343d",
  },
};

export interface BuildingDef {
  label: string;
  color: string;
  output: ResourceType | null;
  icon: string;
  acceptsResources: boolean;
}

export const BUILDING_DEFS: Record<BuildingType, BuildingDef> = {
  drill: {
    label: "Drill",
    color: "#4a5568",
    output: "ore",
    icon: "⛏️",
    acceptsResources: false,
  },
  sawmill: {
    label: "Sawmill",
    color: "#8b6f47",
    output: "wood",
    icon: "🪛",
    acceptsResources: true,
  },
  conveyor: {
    label: "Conveyor",
    color: "#2d3748",
    output: null,
    icon: "▶️",
    acceptsResources: true,
  },
};

export const DIRECTION_ARROWS: Record<Direction, string> = {
  up: "⬆️",
  down: "⬇️",
  left: "⬅️",
  right: "➡️",
};

// ordered list of building types for UI and shortcuts
export const BUILDINGS: BuildingType[] = ["drill", "sawmill", "conveyor"];
