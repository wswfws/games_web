import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CatalogGame } from '@/shared/config/games';

export function GamePage({ game }: { game: CatalogGame }) {
  const navigate = useNavigate();
  const Remote = game.Remote;

  return (
    <main className="game-host">
      <button className="game-back" onClick={() => navigate('/')}>
        ← Каталог
      </button>
      <div className="game-remote">
        <Suspense
          fallback={
            <div className="game-loading">
              <span className="game-loading-spinner" />
              Загрузка {game.title}…
            </div>
          }
        >
          <Remote />
        </Suspense>
      </div>
    </main>
  );
}