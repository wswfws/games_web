import type { FloorType, FloorDefinition, BuildingDef, BuildingType, Direction } from "./types";

export const GRID_WIDTH = 19;
export const GRID_HEIGHT = 9;

export const TICK_INTERVAL_MS = 500;

export const STARVATION_INTERVAL = 10;
export const INITIAL_TOTAL_CATS = 4;

export const DEFAULT_DIRECTION: Direction = "right";
export const DIRECTION_ORDER: Direction[] = ["right", "down", "left", "up"];

export const FLOOR_DEFS: Record<FloorType, FloorDefinition> = {
  grass: {
    label: "Лужок",
    description: "Зелёная лужайка для построек.",
    color: "#3d7a4a",
  },
  water_fish: {
    label: "Вода (рыба)",
    description: "Водится рыба — ставь пирс!",
    color: "#2a6f8f",
  },
  water_dead: {
    label: "Вода",
    description: "Чистая вода без рыбы.",
    color: "#1a4f6f",
  },
  rock: {
    label: "Скала",
    description: "Твёрдая порода, строить нельзя.",
    color: "#2f343d",
  },
};

export const BUILDING_DEFS: Record<BuildingType, BuildingDef> = {
  pier: {
    label: "Пирс",
    color: "#8b6f47",
    output: "fish",
    icon: "🎣",
    acceptsResources: false,
    canExport: true,
    canRemove: true,
    requiresFloor: "water_fish",
    catWorkers: 2,
  },
  kitchen: {
    label: "Кухня",
    color: "#c97d4a",
    output: null,
    icon: "🍲",
    acceptsResources: true,
    canExport: false,
    canRemove: false,
    requiresFloor: null,
    catWorkers: 0,
  },
  path: {
    label: "Тропинка",
    color: "#5a4a3a",
    output: null,
    icon: "🛤️",
    acceptsResources: true,
    canExport: true,
    canRemove: true,
    requiresFloor: null,
    catWorkers: 0,
  },
};

export const DIRECTION_ARROWS: Record<Direction, string> = {
  up: "⬆️",
  down: "⬇️",
  left: "⬅️",
  right: "➡️",
};

// ordered list of building types for UI and shortcuts
export const BUILDINGS: BuildingType[] = ["pier", "path"];

export const KITCHEN_X = 15;
export const KITCHEN_Y = 4;
