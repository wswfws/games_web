/**
 * Автоподбор коэффициентов бота — координатный спуск.
 *
 * Запуск: npx tsx scripts/tune.ts --games 12 --depth 2 --seed 100 --passes 3
 *          npx tsx scripts/tune.ts --params "holePenalty,setupWeight7" --games 20
 *
 * Метод: стартуем с AI_TUNING, по очереди пробуем каждый вес ×0.5 и ×2,
 * оставляем улучшение, повторяем проходами. Все кандидаты играют одни и те
 * же партии (фиксированные сиды), поэтому сравнение честное и без шума RNG.
 * В конце — валидация победителя на свежих сидах и готовый --set для bench.
 */
import { AI_TUNING, type AiTuning } from '@/features/ai-move';
import { evaluateTuning } from './sim';

type TunableKey = keyof AiTuning;

/** Непрерывные веса. defaultDepth и megaComboMinLines — дискретные, их сюда не включаем */
const DEFAULT_PARAMS: TunableKey[] = [
  'clearCellPoints',
  'comboPerExtraLine',
  'megaComboBonus',
  'setupWeight7',
  'setupWeight6',
  'setupWeight5',
  'filledCellPenalty',
  'streakBonus',
  'holePenalty',
  'perimeterPenalty',
  'deadEndPenalty',
];

const STEPS = [0.5, 2.0];
const MIN_VALUE = 0;
const MAX_VALUE = 1e6;

function strArg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
}

function numArg(name: string, fallback: number): number {
  const raw = strArg(name);
  if (raw === undefined) return fallback;
  const v = Number(raw);
  if (!Number.isFinite(v)) throw new Error(`не число во флаге --${name}: "${raw}"`);
  return v;
}

function parseParams(): TunableKey[] {
  const raw = strArg('--params');
  if (raw === undefined) return DEFAULT_PARAMS;
  return raw.split(',').map((s) => {
    const key = s.trim() as TunableKey;
    if (!(key in AI_TUNING)) {
      throw new Error(`неизвестный параметр "${key}". Доступны: ${Object.keys(AI_TUNING).join(', ')}`);
    }
    return key;
  });
}

function clamp(v: number): number {
  return Math.min(MAX_VALUE, Math.max(MIN_VALUE, v));
}

function diffString(base: AiTuning, best: AiTuning): string {
  return (Object.keys(base) as TunableKey[])
    .filter((k) => base[k] !== best[k])
    .map((k) => `${k}=${best[k]}`)
    .join(',');
}

function main(): void {
  const games = Math.max(1, Math.floor(numArg('games', 12)));
  const depth = Math.max(1, Math.floor(numArg('depth', 2)));
  const seed = Math.floor(numArg('seed', 100));
  const passes = Math.max(1, Math.floor(numArg('passes', 3)));
  const params = parseParams();
  console.log(`tune: params=[${params.join(', ')}], игр/замер=${games}, depth=${depth}, seed=${seed}, passes=${passes}`);

  let best: AiTuning = { ...AI_TUNING };
  let bestScore = evaluateTuning(best, depth, games, seed).avg;
  console.log(`старт: avg=${bestScore.toFixed(1)}`);

  const t0 = performance.now();
  for (let pass = 1; pass <= passes; pass++) {
    let improved = false;
    for (const key of params) {
      for (const step of STEPS) {
        const candidate: AiTuning = { ...best, [key]: clamp(best[key] * step) };
        if (candidate[key] === best[key]) continue;
        const { avg } = evaluateTuning(candidate, depth, games, seed);
        if (avg > bestScore) {
          console.log(`  [pass ${pass}] ${key}: ${best[key]} → ${candidate[key]}  avg ${bestScore.toFixed(1)} → ${avg.toFixed(1)}`);
          best = candidate;
          bestScore = avg;
          improved = true;
        }
      }
    }
    console.log(`pass ${pass}: avg=${bestScore.toFixed(1)}${improved ? '' : ' (улучшений нет, стоп)'}`);
    if (!improved) break;
  }
  console.log(`поиск: ${((performance.now() - t0) / 1000).toFixed(1)}с`);

  // валидация на свежих сидах — проверяем, что не переобучились на tune-набор
  const validSeed = seed + 1_000_000;
  const validGames = Math.max(games * 2, 24);
  const baseValid = evaluateTuning(AI_TUNING, depth, validGames, validSeed).avg;
  const bestValid = evaluateTuning(best, depth, validGames, validSeed).avg;
  console.log('---');
  console.log(`валидация (${validGames} игр, seed=${validSeed}): база=${baseValid.toFixed(1)}, новое=${bestValid.toFixed(1)}`);

  const setString = diffString(AI_TUNING, best);
  if (setString.length === 0) {
    console.log('улучшений не найдено — оставляем AI_TUNING как есть.');
    return;
  }
  console.log(`--set для проверки в bench: --set "${setString}"`);
  console.log('для tuning.ts:');
  for (const key of Object.keys(best) as TunableKey[]) {
    console.log(`  ${key}: ${best[key]},`);
  }
}

main();
