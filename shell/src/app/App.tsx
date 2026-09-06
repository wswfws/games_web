import { Routes, Route } from 'react-router-dom';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { GamePage } from '@/pages/game/GamePage';
import { Header } from '@/shared/ui/Header';
import { GAMES } from '@/shared/config/games';

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        {GAMES.map((game) => (
          <Route key={game.id} path={game.route} element={<GamePage game={game} />} />
        ))}
        <Route path="*" element={<CatalogPage />} />
      </Routes>
    </div>
  );
}