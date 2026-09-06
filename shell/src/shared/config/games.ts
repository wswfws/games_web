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
];
