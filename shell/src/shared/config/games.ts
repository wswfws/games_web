import { lazy, type ComponentType } from 'react';

export interface GameMeta {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  route: string;
  remoteModule: string;
}

export interface CatalogGame extends GameMeta {
  Remote: ComponentType;
}

const BlackblastApp = lazy(() => import('blackblast/App'));
const BuildCatApp = lazy(() => import('build_cat/App'));
const TicTacToeApp = lazy(() => import('tictactoe/App'));
const ConnectFourApp = lazy(() => import('connect_four/App'));
const MemoryApp = lazy(() => import('memory/App'));
const BattleshipApp = lazy(() => import('battleship/App'));

export const GAMES: CatalogGame[] = [
  {
    id: 'block-blast',
    title: 'Block Blast',
    tagline: 'Головоломка',
    description:
      'Расставляй фигуры на поле 8×8, сжигай полные линии и столбцы, собирай комбо и ставь рекорды. Два режима: соло и против бота.',
    icon: '🧩',
    accent: '#6c63ff',
    route: '/games/block-blast',
    remoteModule: 'blackblast/App',
    Remote: BlackblastApp,
  },
  {
    id: 'factory-grid',
    title: 'Factory Grid',
    tagline: 'Стратегия',
    description:
      'Строй фабрику на острове: пирсы, тропинки и кухни. Накорми всех котиков и развивай поселение.',
    icon: '🏭',
    accent: '#0ea5e9',
    route: '/games/factory-grid',
    remoteModule: 'build_cat/App',
    Remote: BuildCatApp,
  },
  {
    id: 'tic-tac-toe',
    title: 'Крестики-нолики',
    tagline: 'Логика',
    description:
      'Классические крестики-нолики 3×3 против бота: побеждай, блокируй соперника и держи счёт партий.',
    icon: '⭕',
    accent: '#4cc2ff',
    route: '/games/tic-tac-toe',
    remoteModule: 'tictactoe/App',
    Remote: TicTacToeApp,
  },
  {
    id: 'connect-four',
    title: '4 в ряд',
    tagline: 'Стратегия',
    description:
      'Бросай фишки в колонки и собери четыре в ряд по горизонтали, вертикали или диагонали раньше бота.',
    icon: '🔴',
    accent: '#ff6ca8',
    route: '/games/connect-four',
    remoteModule: 'connect_four/App',
    Remote: ConnectFourApp,
  },
  {
    id: 'memory',
    title: 'Найди пары',
    tagline: 'Память',
    description:
      'Открывай карточки и собирай одинаковые эмодзи парами. Чем меньше ходов — тем лучше.',
    icon: '🃏',
    accent: '#34d399',
    route: '/games/memory',
    remoteModule: 'memory/App',
    Remote: MemoryApp,
  },
  {
    id: 'battleship',
    title: 'Морской бой',
    tagline: 'Стратегия',
    description:
      'Расставь флот на поле 10×10 и угадай позиции кораблей бота. Топи корабли первым!',
    icon: '⚓',
    accent: '#f59e0b',
    route: '/games/battleship',
    remoteModule: 'battleship/App',
    Remote: BattleshipApp,
  },
];
