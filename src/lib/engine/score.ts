import type { Test } from "./schema";

export type Answers = Record<string, number>;

export interface ScaleResult {
  id: string;
  name: string;
  high: string;
  low: string;
  raw: number;
  max: number;
  /** Процент от максимума шкалы, 0–100, округлённый до целого. */
  percent: number;
  band: { label: string; text: string };
}

export interface TestResult {
  slug: string;
  version: string;
  scales: ScaleResult[];
  crisis: boolean;
}

/**
 * Детерминированный скоринг: чистая функция без времени и случайности.
 * score(test, answers) при одинаковом входе всегда даёт бит-в-бит одинаковый выход.
 * LLM в этом пути не участвует (см. docs/architecture/test-engine.md).
 */
export function score(test: Test, answers: Answers): TestResult {
  const values = test.options.map((o) => o.value);
  const optionMin = Math.min(...values);
  const optionMax = Math.max(...values);

  const scales: ScaleResult[] = test.scales.map((scale) => {
    const items = test.questions.filter((q) => q.scales.some((s) => s.scale === scale.id));
    let raw = 0;
    for (const q of items) {
      const answer = answers[q.id];
      if (answer === undefined) continue;
      const membership = q.scales.find((s) => s.scale === scale.id)!;
      raw += membership.reverse ? optionMin + optionMax - answer : answer;
    }
    const min = items.length * optionMin;
    const max = items.length * optionMax;
    const span = max - min;
    const percent = span === 0 ? 0 : Math.round(((raw - min) / span) * 100);
    const band = pickBand(scale.bands, percent);
    return { id: scale.id, name: scale.name, high: scale.high, low: scale.low, raw, max, percent, band };
  });

  const crisis = test.crisis.some((rule) => {
    const answer = answers[rule.question];
    return answer !== undefined && answer >= rule.minValue;
  });

  return { slug: test.slug, version: test.version, scales, crisis };
}

function pickBand(bands: Test["scales"][number]["bands"], percent: number) {
  const sorted = [...bands].sort((a, b) => a.from - b.from);
  let chosen = sorted[0];
  for (const band of sorted) if (percent >= band.from) chosen = band;
  return { label: chosen.label, text: chosen.text };
}

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * Stateless-кодирование ответов в URL (приём psytests, R1): результат живёт
 * в ссылке, на сервере ничего не хранится — нулевая ПДн-поверхность.
 * Формат: {version}~{answers}~{checksum}. Один символ base36 на ответ.
 */
export function encodeAnswers(test: Test, answers: Answers): string {
  const payload = test.questions
    .map((q) => {
      const value = answers[q.id];
      return value === undefined ? "-" : ALPHABET[value];
    })
    .join("");
  return `${test.version}~${payload}~${checksum(payload + test.version)}`;
}

export function decodeAnswers(test: Test, token: string): Answers | null {
  const parts = token.split("~");
  if (parts.length !== 3) return null;
  const [version, payload, sum] = parts;
  if (version !== test.version) return null;
  if (payload.length !== test.questions.length) return null;
  if (checksum(payload + version) !== sum) return null;

  const allowed = new Set(test.options.map((o) => ALPHABET[o.value]));
  const answers: Answers = {};
  for (let i = 0; i < test.questions.length; i++) {
    const char = payload[i];
    if (char === "-") continue;
    if (!allowed.has(char)) return null;
    answers[test.questions[i].id] = ALPHABET.indexOf(char);
  }
  return answers;
}

function checksum(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  return hash.toString(36).slice(0, 4).padStart(4, "0");
}
