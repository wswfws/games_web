/**
 * entities/score: подсчёт очков как в Block Blast.
 * - установка: +кол-во клеток фигуры
 * - очистка: +10 за каждую очищенную клетку
 * - комбо за несколько линий сразу + стрик за подряд идущие очистки
 */
export function scoreForMove(
  placedCells: number,
  clearedCells: number,
  linesCount: number,
  streak: number,
): { gained: number; comboBonus: number } {
  let gained = placedCells;
  let comboBonus = 0;
  if (clearedCells > 0) {
    gained += clearedCells * 10;
    if (linesCount > 1) {
      comboBonus = (linesCount - 1) * 50 + (linesCount >= 3 ? 100 : 0);
      gained += comboBonus;
    }
    if (streak > 0) {
      const streakBonus = streak * 20;
      comboBonus += streakBonus;
      gained += streakBonus;
    }
  }
  return { gained, comboBonus };
}
