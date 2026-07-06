"use client";

import { getPlayLabel } from "@/widgets/game-screen/ui/play-label";

export function PlayPauseButton({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <button
      aria-label={getPlayLabel(paused)}
      title={getPlayLabel(paused)}
      onClick={onToggle}
      className="fixed bottom-4 right-4 w-12 h-12 flex items-center justify-center rounded-full text-lg bg-slate-800/80 border border-slate-700 text-white shadow-lg hover:scale-105 transition-transform"
    >
      <span>{paused ? "▶️" : "⏸️"}</span>
    </button>
  );
}
