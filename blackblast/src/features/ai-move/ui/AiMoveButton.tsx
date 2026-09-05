interface Props {
  disabled: boolean;
  onMove: () => void;
}

/** features/ai-move: кнопка «ход ИИ» */
export function AiMoveButton({ disabled, onMove }: Props) {
  return (
    <button
      className="icon-btn"
      onClick={onMove}
      disabled={disabled}
      title="Ход ИИ"
      aria-label="Ход ИИ"
    >
      🤖
    </button>
  );
}
