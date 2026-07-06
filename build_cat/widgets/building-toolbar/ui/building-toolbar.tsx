import { BUILDING_DEFS, type BuildingType } from "@/shared/entities/game";

const BUILDINGS: BuildingType[] = ["drill", "sawmill", "conveyor"];
const BUILDING_ICONS: Record<BuildingType, string> = {
  drill: "⛏️",
  sawmill: "🪛",
  conveyor: "▶️",
};

export function BuildingToolbar({
  selectedSlot,
  paused,
}: {
  selectedSlot: number;
  paused: boolean;
}) {
  const buildings = BUILDINGS.slice(0, 10);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex gap-2 bg-slate-800/70 backdrop-blur-md rounded-full p-2 border border-slate-700">
        {buildings.map((building, index) => {
          const isSelected = selectedSlot === index;
          return (
            <button
              key={building}
              aria-label={`${BUILDING_DEFS[building].label} (${(index + 1) % 10})`}
              title={`${BUILDING_DEFS[building].label} (${(index + 1) % 10})`}
              className={`w-12 h-12 flex items-center justify-center rounded-full text-xl transition-all ${
                isSelected
                  ? "bg-cyan-600 border-2 border-cyan-400 text-white"
                  : "bg-slate-700 border border-slate-600 text-slate-100 hover:bg-slate-600"
              }`}
            >
              <span>{BUILDING_ICONS[building]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
