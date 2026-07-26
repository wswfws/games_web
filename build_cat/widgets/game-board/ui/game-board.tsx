import { FLOOR_DEFS, BUILDING_DEFS, DIRECTION_ARROWS, type GameState } from "@/shared/entities/game";

export function GameBoard({
  game,
  onCellClick,
  onCellRightClick,
  onCellRotate,
  onCellHover,
}: {
  game: GameState;
  onCellClick: (x: number, y: number) => void;
  onCellRightClick: (x: number, y: number) => void;
  onCellRotate: (x: number, y: number) => void;
  onCellHover: (coords: [number, number] | null) => void;
}) {
  return (
    <div
      className="grid h-full p-2 gap-0.5 bg-black/20"
      style={{
        gridTemplateColumns: `repeat(${game.width}, 1fr)`,
      }}
    >
      {game.grid.map((row, y) =>
        row.map((cell, x) => {
          const baseColor = FLOOR_DEFS[cell.floor].color;
          const hasBuilding = !!cell.building;
          const resources = cell.building?.resources || [];
          const oreCount = resources.filter(r => r === "ore").length;
          const woodCount = resources.filter(r => r === "wood").length;

          let bgColor = baseColor;
          if (hasBuilding) {
            bgColor = BUILDING_DEFS[cell.building!.type].color;
          }

          return (
            <button
              key={`${x}-${y}`}
              type="button"
              onClick={() => onCellClick(x, y)}
              onContextMenu={(event) => {
                event.preventDefault();
                onCellRightClick(x, y);
              }}
              onDoubleClick={() => onCellRotate(x, y)}
              onMouseEnter={() => onCellHover([x, y])}
              onMouseLeave={() => onCellHover(null)}
              className="relative aspect-square border-2 border-black/40 cursor-pointer hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/50 transition-all flex flex-col items-center justify-center p-1 overflow-hidden group"
              style={{
                backgroundColor: bgColor,
              }}
              title={`${x}, ${y} ${cell.building ? BUILDING_DEFS[cell.building.type].label : FLOOR_DEFS[cell.floor].label} ${cell.building ? `(${cell.building.direction})` : ""}`}
            >
              {/* Building Icon and Direction */}
              {hasBuilding && (
                <div className="flex flex-col items-center justify-center mb-1">
                  <div className="text-lg">{BUILDING_DEFS[cell.building!.type].icon}</div>
                  <div className="text-xs">{DIRECTION_ARROWS[cell.building!.direction]}</div>
                </div>
              )}

              {/* Resource Stacks */}
              {resources.length > 0 && (
                <div className="flex flex-col items-center justify-center w-full flex-1">
                  {oreCount > 0 && (
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-md"></div>
                      <span className="text-xs font-bold text-yellow-200">{oreCount}</span>
                    </div>
                  )}
                  {woodCount > 0 && (
                    <div className="flex items-center justify-center gap-0.5">
                      <div className="w-2 h-2 bg-orange-600 rounded-full shadow-md"></div>
                      <span className="text-xs font-bold text-orange-100">{woodCount}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Resource bars */}
              {resources.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 opacity-70"></div>
              )}
            </button>
          );
        }),
      )}
    </div>
  );
}
