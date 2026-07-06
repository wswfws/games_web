import type { FloorType, FloorDefinition, BuildingType } from "./types";

export const GRID_WIDTH = 19;
export const GRID_HEIGHT = 9;

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

export const BUILDING_DEFS: Record<BuildingType, { label: string; color: string }> = {
  drill: {
    label: "Drill",
    color: "#4a5568",
  },
  sawmill: {
    label: "Sawmill",
    color: "#8b6f47",
  },
  conveyor: {
    label: "Conveyor",
    color: "#2d3748",
  },
};

// ordered list of building types for UI and shortcuts
export const BUILDINGS: BuildingType[] = ["drill", "sawmill", "conveyor"];
