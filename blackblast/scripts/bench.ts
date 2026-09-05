/**
 * CLI-бенчмарк ИИ: прогоняет N полных игр без UI и считает статистику.
 *
 * Запуск: npx tsx scripts/bench.ts --games 100 --depth 2 --seed 42
 *          npx tsx scripts/bench.ts --games 100 --set "holePenalty=20,setupWeight7=60"
 *
 * Симуляция повторяет useGameSession 1-в-1 (см. scripts/sim.ts).
 * RNG сидирован (mulberry32), поэтому прогоны с одним seed воспроизводимы.
 */
import { AI_TUNING, type AiTuning } from '@/features/ai-move';
import { mulberry32, playGame } from './sim';

function arg(name: string, fallback: number): number {
  const v = argOpt(name);
  return v === undefined ? fallback : v;
}

function argOpt(name: string): number | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0 || i + 1 >= process.argv.length) return undefined;
  const v = Number(process.argv[i + 1]);
  return Number.isFinite(v) ? v : undefined;
}

/**
 * Парсит --set key=value,key=value. Ключи проверяются по AI_TUNING,
 * неизвестный ключ или не-число — ошибка с подсказкой.
 */
function parseOverrides(): Partial<AiTuning> {
  const i = process.argv.indexOf('--set');
  if (i < 0 || i + 1 >= process.argv.length) return {};
  const out: Partial<AiTuning> = {};
  for (const pair of process.argv[i + 1].split(',')) {
    const eq = pair.indexOf('=');
    if (eq < 0) throw new Error(`плохая пара в --set: "${pair}", нужно key=value`);
    const key = pair.slice(0, eq).trim();
    const value = Number(pair.slice(eq + 1));
    if (!(key in AI_TUNING)) {
      throw new Error(`неизвестный коэффициент "${key}". Доступны: ${Object.keys(AI_TUNING).join(', ')}`);
    }
    if (!Number.isFinite(value)) throw new Error(`не число в --set: "${pair}"`);
    (out as Record<string, number>)[key] = value;
  }
  return out;
}

function main(): void {
  const overrides = parseOverrides();
  const tuning: AiTuning = { ...AI_TUNING, ...overrides };
  const games = Math.max(1, Math.floor(arg('games', 100)));
  const depth = Math.max(1, Math.floor(argOpt('depth') ?? tuning.defaultDepth));
  const seed = Math.floor(arg('seed', 42));
  console.log(`bench: игр=${games}, depth=${depth}, seed=${seed}`);
  console.log(
    Object.keys(overrides).length === 0
      ? 'tuning: default (AI_TUNING)'
      : `tuning overrides: ${JSON.stringify(overrides)}`,
  );

  const scores: number[] = [];
  let totalMoves = 0;
  const t0 = performance.now();
  const step = Math.max(1, Math.floor(games / 10));
  for (let i = 0; i < games; i++) {
    Math.random = mulberry32(seed + i);
    const { score, moves } = playGame(depth, tuning);
    scores.push(score);
    totalMoves += moves;
    if ((i + 1) % step === 0 || i === games - 1) console.log(`  ${i + 1}/${games}...`);
  }
  const elapsed = performance.now() - t0;

  scores.sort((a, b) => a - b);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  console.log('---');
  console.log(`игр:              ${games}`);
  console.log(`среднее:          ${avg.toFixed(1)}`);
  console.log(`медиана:          ${scores[Math.floor(scores.length / 2)]}`);
  console.log(`мин:              ${scores[0]}`);
  console.log(`макс:             ${scores[scores.length - 1]}`);
  console.log(`ходов/игра:       ${(totalMoves / games).toFixed(1)}`);
  console.log(`время:            ${(elapsed / 1000).toFixed(1)}с (${(elapsed / games).toFixed(0)}мс/игра)`);
}

main();
