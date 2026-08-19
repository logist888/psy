import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getAllTests } from "../src/lib/content";
import { score, encodeAnswers, decodeAnswers, type Answers } from "../src/lib/engine/score";
import type { Test } from "../src/lib/engine/schema";

/**
 * Golden test cases: для каждой методики зафиксированы ожидаемые результаты
 * на канонических паттернах ответов. Изменение скоринга или контента без
 * обновления версии и golden-файла роняет CI (docs/architecture/test-engine.md §3).
 */

const GOLDEN_PATH = path.join(process.cwd(), "content", "golden", "expected.json");

function patterns(test: Test): Record<string, Answers> {
  const values = test.options.map((o) => o.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const build = (fn: (index: number) => number): Answers =>
    Object.fromEntries(test.questions.map((q, i) => [q.id, fn(i)]));
  return {
    allMin: build(() => min),
    allMax: build(() => max),
    alternating: build((i) => (i % 2 === 0 ? min : max)),
    ascending: build((i) => values[i % values.length]),
  };
}

const tests = getAllTests();
const golden = JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf8")) as Record<string, unknown>;

describe("golden scoring", () => {
  for (const test of tests) {
    describe(test.slug, () => {
      it("версия методики совпадает с зафиксированной в golden", () => {
        const entry = golden[test.slug] as { version: string } | undefined;
        expect(entry, `нет golden-записи для ${test.slug} — обновите content/golden/expected.json`).toBeDefined();
        expect(
          entry!.version,
          `версия ${test.slug} изменилась без обновления golden — так и задумано: обновите ожидания осознанно`
        ).toBe(test.version);
      });

      for (const [name, answers] of Object.entries(patterns(test))) {
        it(`даёт зафиксированный результат: ${name}`, () => {
          const entry = golden[test.slug] as { patterns: Record<string, unknown> };
          const actual = score(test, answers).scales.map((s) => ({
            id: s.id,
            raw: s.raw,
            max: s.max,
            percent: s.percent,
            band: s.band.label,
          }));
          expect(actual).toEqual(entry.patterns[name]);
        });
      }

      it("ссылка на результат восстанавливает те же ответы", () => {
        const answers = patterns(test).ascending;
        const token = encodeAnswers(test, answers);
        expect(decodeAnswers(test, token)).toEqual(answers);
      });

      it("шкалы покрывают все вопросы методики", () => {
        const covered = new Set(test.questions.flatMap((q) => q.scales.map((s) => s.scale)));
        for (const scale of test.scales) expect(covered.has(scale.id)).toBe(true);
      });
    });
  }
});

describe("кризисный протокол", () => {
  it("методики с кризисными правилами поднимают флаг на максимальных ответах", () => {
    for (const test of tests.filter((t) => t.crisis.length > 0)) {
      const max = Math.max(...test.options.map((o) => o.value));
      const answers = Object.fromEntries(test.questions.map((q) => [q.id, max]));
      expect(score(test, answers).crisis, `${test.slug} должен поднять кризисный флаг`).toBe(true);
    }
  });

  it("не поднимает флаг на минимальных ответах", () => {
    for (const test of tests) {
      const min = Math.min(...test.options.map((o) => o.value));
      const answers = Object.fromEntries(test.questions.map((q) => [q.id, min]));
      expect(score(test, answers).crisis, `${test.slug} не должен поднимать флаг`).toBe(false);
    }
  });
});
