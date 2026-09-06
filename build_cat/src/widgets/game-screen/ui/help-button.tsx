export function HelpButton({ onOpenWiki }: { onOpenWiki?: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpenWiki}
      title="Вики"
      aria-label="Открыть вики"
      className="fixed bottom-4 right-20 w-12 h-12 flex items-center justify-center rounded-full text-lg bg-slate-800/80 border border-slate-700 text-white shadow-lg hover:scale-105 transition-transform"
    >
      <span>❓</span>
    </button>
  );
}
