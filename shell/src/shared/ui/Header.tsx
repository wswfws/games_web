import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="app-logo">
        <span className="app-logo-icon">🎮</span>
        <span className="app-logo-title">Каталог игр</span>
      </Link>
    </header>
  );
}