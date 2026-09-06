import { Component, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { CatalogGame } from '@/shared/config/games';

interface BoundaryState {
  failed: boolean;
}

class RemoteErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="game-loading">
          <span className="game-loading-error">!</span>
          Не удалось загрузить игру. Проверь соединение и обнови страницу.
        </div>
      );
    }
    return this.props.children;
  }
}

export function GamePage({ game }: { game: CatalogGame }) {
  const navigate = useNavigate();
  const Remote = game.Remote;

  return (
    <main className="game-host">
      <button className="game-back" onClick={() => navigate('/')}>
        ← Каталог
      </button>
      <div className="game-remote">
        <RemoteErrorBoundary>
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
        </RemoteErrorBoundary>
      </div>
    </main>
  );
}