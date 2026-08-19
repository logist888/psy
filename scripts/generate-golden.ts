/** Перегенерация golden-ожиданий. Запускать ОСОЗНАННО при изменении методики + bump версии. */
import fs from "node:fs";
import path from "node:path";
import { getAllTests } from "../src/lib/content";
import { score, type Answers } from "../src/lib/engine/score";
import type { Test } from "../src/lib/engine/schema";

function patterns(test: Test): Record<string, Answers> {
  const values = test.options.map((o) => o.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const build = (fn: (i: number) => number): Answers =>
    Object.fromEntries(test.questions.map((q, i) => [q.id, fn(i)]));
  return {
    allMin: build(() => min),
    allMax: build(() => max),
    alternating: build((i) => (i % 2 === 0 ? min : max)),
    ascending: build((i) => values[i % values.length]),
  };
}

const out: Record<string, unknown> = {};
for (const test of getAllTests()) {
  out[test.slug] = {
    version: test.version,
    patterns: Object.fromEntries(
      Object.entries(patterns(test)).map(([name, answers]) => [
        name,
        score(test, answers).scales.map((s) => ({ id: s.id, raw: s.raw, max: s.max, percent: s.percent, band: s.band.label })),
      ])
    ),
  };
}
const target = path.join(process.cwd(), "content", "golden", "expected.json");
fs.writeFileSync(target, JSON.stringify(out, null, 2) + "\n");
console.log(`✓ Golden обновлён: ${Object.keys(out).length} методик`);
