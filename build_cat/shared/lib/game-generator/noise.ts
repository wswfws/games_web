import type { FloorType } from "@/shared/entities/game";

function cellNoise(x: number, y: number) {
  const value = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function randomFloor(x: number, y: number, width: number, height: number): FloorType {
  const border = x === 0 || y === 0 || x === width - 1 || y === height - 1;

  if (border) {
    return "rock";
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const distance = Math.abs(x - centerX) + Math.abs(y - centerY);
  const oreChance = distance < 5 ? 0.22 : 0.12;

  if (cellNoise(x, y) < oreChance) {
    return "ore";
  }

  return "grass";
}
