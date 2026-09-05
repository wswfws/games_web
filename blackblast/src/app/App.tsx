import { useState } from 'react';
import { GamePage } from '@/pages/game-page';
import { VersusPage } from '@/pages/versus-page';
import { MainMenu } from '@/widgets/main-menu';
import type { PageKind } from '@/shared/lib/navigation';
import './styles/index.css';

/** app: точка сборки — простейший state-роутер без внешних библиотек */
export default function App() {
  const [page, setPage] = useState<PageKind>('menu');

  const navigate = (to: PageKind) => setPage(to);

  if (page === 'solo') return <GamePage onNavigate={navigate} />;
  if (page === 'versus') return <VersusPage onNavigate={navigate} />;
  return <MainMenu onNavigate={navigate} />;
}