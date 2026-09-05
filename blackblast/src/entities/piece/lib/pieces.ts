import type { ShapeDef, TrayPiece } from '../model/types';

export const SHAPES: ShapeDef[] = [
  { id: 'dot', cells: [[1]], weight: 10 },
  { id: 'h2', cells: [[1, 1]], weight: 10 },
  { id: 'h3', cells: [[1, 1, 1]], weight: 10 },
  { id: 'h4', cells: [[1, 1, 1, 1]], weight: 8 },
  { id: 'h5', cells: [[1, 1, 1, 1, 1]], weight: 6 },
  { id: 'v2', cells: [[1], [1]], weight: 10 },
  { id: 'v3', cells: [[1], [1], [1]], weight: 10 },
  { id: 'v4', cells: [[1], [1], [1], [1]], weight: 8 },
  { id: 'v5', cells: [[1], [1], [1], [1], [1]], weight: 6 },
  { id: 'sq2', cells: [[1, 1], [1, 1]], weight: 10 },
  { id: 'sq3', cells: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], weight: 4 },
  { id: 'sq2-tl', cells: [[1, 1], [1, 0]], weight: 6 },
  { id: 'sq2-tr', cells: [[1, 1], [0, 1]], weight: 6 },
  { id: 'sq2-bl', cells: [[1, 0], [1, 1]], weight: 6 },
  { id: 'sq2-br', cells: [[0, 1], [1, 1]], weight: 6 },
  { id: 'l1', cells: [[1, 0], [1, 0], [1, 1]], weight: 7 },
  { id: 'l2', cells: [[0, 1], [0, 1], [1, 1]], weight: 7 },
  { id: 'l3', cells: [[1, 1], [1, 0], [1, 0]], weight: 7 },
  { id: 'l4', cells: [[1, 1], [0, 1], [0, 1]], weight: 7 },
  { id: 'l5', cells: [[1, 1, 1], [1, 0, 0]], weight: 7 },
  { id: 'l6', cells: [[1, 1, 1], [0, 0, 1]], weight: 7 },
  { id: 'l7', cells: [[1, 0, 0], [1, 1, 1]], weight: 7 },
  { id: 'l8', cells: [[0, 0, 1], [1, 1, 1]], weight: 7 },
  { id: 't1', cells: [[1, 1, 1], [0, 1, 0]], weight: 5 },
  { id: 't2', cells: [[0, 1, 0], [1, 1, 1]], weight: 5 },
  { id: 't3', cells: [[1, 0], [1, 1], [1, 0]], weight: 5 },
  { id: 't4', cells: [[0, 1], [1, 1], [0, 1]], weight: 5 },
  { id: 's1', cells: [[0, 1, 1], [1, 1, 0]], weight: 4 },
  { id: 's2', cells: [[1, 1, 0], [0, 1, 1]], weight: 4 },
  { id: 'rect23', cells: [[1, 1], [1, 1], [1, 1]], weight: 5 },
  { id: 'rect32', cells: [[1, 1, 1], [1, 1, 1]], weight: 5 },
];

export function shapeCellCount(shape: ShapeDef): number {
  let n = 0;
  for (const row of shape.cells) for (const c of row) if (c) n++;
  return n;
}

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function randomPiece(): TrayPiece {
  const total = SHAPES.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  let shape = SHAPES[0];
  for (const s of SHAPES) {
    r -= s.weight;
    if (r <= 0) {
      shape = s;
      break;
    }
  }
  return {
    uid: `${Date.now()}-${randInt(1_1e9)}-${shape.id}`,
    shape,
    color: 1 + randInt(8),
    used: false,
  };
}

export function newTray(): TrayPiece[] {
  return [randomPiece(), randomPiece(), randomPiece()];
}
