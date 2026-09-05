/**
 * features/ai-move: все числовые коэффициенты бота в одном месте.
 * Чем больше значение — тем сильнее фактор влияет на выбор хода.
 */
export interface AiTuning {
  /** Глубина перебора по умолчанию (свой ход + ответы из остатка лотка) */
  defaultDepth: number;
  /** Очки за каждую сгоревшую клетку при симуляции хода */
  clearCellPoints: number;
  /** Бонус за каждую линию сверх первой при мульти-очистке */
  comboPerExtraLine: number;
  /** Сколько линий за ход считается мега-комбо */
  megaComboMinLines: number;
  /** Дополнительный бонус за 3+ линий за один ход */
  megaComboBonus: number;
  /** Вес почти собранных линий — заделы под будущие очистки */
  setupWeight7: number; // 7 из 8 заполнено — почти горит
  setupWeight6: number; // 6 из 8
  setupWeight5: number; // 5 из 8
  /** Штраф за каждую занятую клетку — держит поле свободным */
  filledCellPenalty: number;
  /** Штраф за «дыру» — пустую клетку, зажатую со всех сторон */
  holePenalty: number;
  /** Штраф ветки, где остаток лотка уже не влезает (путь к концу игры) */
  deadEndPenalty: number;
}

export const AI_TUNING: AiTuning = {
  defaultDepth: 4,
  clearCellPoints: 40, // подобрано scripts/tune.ts: 10 → 40 (×3.6 к среднему)
  comboPerExtraLine: 50,
  megaComboMinLines: 3,
  megaComboBonus: 100,
  setupWeight7: 50,
  setupWeight6: 10,
  setupWeight5: 3,
  filledCellPenalty: 1.2,
  holePenalty: 8,
  deadEndPenalty: 500,
};
