import { loadBest } from '@/entities/score';
import type { PageKind } from '@/shared/lib/navigation';

interface Props {
  onNavigate: (page: PageKind) => void;
}

/** widgets/main-menu: выбор режима */
export function MainMenu({ onNavigate }: Props) {
  const best = loadBest();
  return (
    <div className="menu">
      <h1 className="menu-title">Block Blast</h1>
      {best > 0 && (
        <div className="menu-best" title="Рекорд в одиночном режиме">
          🏆 {best}
        </div>
      )}
      <div className="menu-actions">
        <button className="menu-btn primary" onClick={() => onNavigate('solo')}>
          На рекорд
        </button>
        <button className="menu-btn" onClick={() => onNavigate('versus')}>
          Против бота
        </button>
      </div>
      <p className="menu-hint">
        Против бота: общее поле, ходы по очереди, фигуры сразу восполняются
        (100 на двоих), больше очков — победа.
      </p>
    </div>
  );
}