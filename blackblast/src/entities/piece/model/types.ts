export interface ShapeDef {
  id: string;
  cells: number[][]; // матрица 0/1
  weight: number; // вес для рандома (большие фигуры реже)
}

export interface TrayPiece {
  uid: string;
  shape: ShapeDef;
  color: number; // 1..8
  used: boolean;
}

/** Положение перетаскиваемой фигуры (живёт в entities, чтобы ui не тянул features) */
export interface DragState {
  uid: string;
  x: number;
  y: number;
  row: number | null;
  col: number | null;
  valid: boolean;
}
