import { Link } from 'react-router-dom';
import { GAMES } from '@/shared/config/games';

export function CatalogPage() {
  return (
    <main className="catalog">
      <section className="catalog-hero">
        <h1 className="catalog-title">Мини-игры</h1>
        <p className="catalog-subtitle">Две игры в одном приложении. Выбери и играй.</p>
      </section>

      <section className="catalog-grid">
        {GAMES.map((game) => (
          <Link key={game.id} to={game.route} className="catalog-card">
            <span className="catalog-card-icon" style={{ background: `${game.accent}22`, color: game.accent }}>
              {game.icon}
            </span>
            <div className="catalog-card-body">
              <span className="catalog-card-tagline">{game.tagline}</span>
              <h2 className="catalog-card-title" style={{ color: game.accent }}>
                {game.title}
              </h2>
              <p className="catalog-card-desc">{game.description}</p>
            </div>
            <button className="catalog-card-play" style={{ background: game.accent }}>
              Играть →
            </button>
          </Link>
        ))}
      </section>
    </main>
  );
}