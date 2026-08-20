/**
 * Графика страницы — тот же профиль по шкалам, который человек увидит в конце
 * прохождения. Это не украшение ради заполнения: мотив показывает, что тут
 * выдают, и повторяется на иконке сайта, в шапке разделов и в карточке для
 * мессенджеров.
 *
 * Рисунок выводится из строки (слага), а не из случайных чисел: у каждого
 * раздела и темы он свой, но при каждой сборке одинаковый.
 */

/** djb2 — та же функция, что считает контрольную сумму токена результата. */
function hash(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i += 1) h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Псевдослучайная, но воспроизводимая последовательность из одного зерна. */
function* lengths(seed: string, count: number): Generator<number> {
  let state = hash(seed) || 1;
  for (let i = 0; i < count; i += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    // 45–100% ширины. Более широкий разброс превращает профиль в рваное пятно:
    // рисунок должен читаться как шкалы, а не как случайные штрихи.
    yield 0.45 + (state % 1000) / 1000 * 0.55;
  }
}

export default function Motif({
  seed,
  bars = 5,
  width = 220,
  className,
}: {
  seed: string;
  bars?: number;
  width?: number;
  className?: string;
}) {
  const thickness = 8;
  const step = thickness + 7;
  const height = bars * thickness + (bars - 1) * (step - thickness);
  const rows = [...lengths(seed, bars)];

  return (
    <svg
      className={className ? `motif ${className}` : "motif"}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {rows.map((share, i) => (
        <rect
          key={i}
          x={0}
          y={i * step}
          width={Math.round(width * share)}
          height={thickness}
          rx={thickness / 2}
          fill="currentColor"
          // Верхние полосы плотнее нижних: рисунок читается как убывающий
          // профиль и не спорит с текстом рядом
          opacity={0.85 - i * (0.5 / Math.max(bars - 1, 1))}
        />
      ))}
    </svg>
  );
}
