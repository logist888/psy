import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getAllTests, getAllConstructs, CATEGORY_PAGES, COLLECTIONS } from "../src/lib/content";

/**
 * Шрифт лежит в репозитории точным сабсетом под репертуар сайта — так он весит
 * 44 КБ вместо полного семейства. Плата за это: символ, которого в сабсете нет,
 * отрисуется запасным шрифтом и будет заметно выбиваться из строки. Партии
 * методик собираются автоматически, поэтому проверку делает CI, а не глаз.
 */

const subset = new Set(fs.readFileSync(path.resolve(__dirname, "../src/fonts/subset.txt"), "utf8"));

/**
 * Символы, которых в Golos Text нет и не будет: греческого набора в этом
 * начертании не существует. «α» стоит в строке про надёжность методики и
 * отрисовывается запасным шрифтом — это осознанная уступка, а не недосмотр.
 */
const FALLBACK = new Set(["α"]);

function textOf(): string {
  const tests = getAllTests().flatMap((t) => [
    t.title,
    t.seoTitle,
    t.description,
    t.instruction,
    ...Object.values(t.passport),
    ...t.options.map((o) => o.text),
    ...t.questions.map((q) => q.text),
    ...t.scales.flatMap((s) => [s.name, s.high, s.low, ...s.bands.flatMap((b) => [b.label, b.text])]),
    ...t.selfHelp,
  ]);
  const hubs = getAllConstructs().flatMap((c) => [
    c.title,
    c.seoTitle,
    c.description,
    c.intro,
    ...c.sections.flatMap((s) => [s.heading, s.body]),
    ...c.faq.flatMap((f) => [f.q, f.a]),
  ]);
  const landings = [
    ...Object.values(CATEGORY_PAGES).flatMap((p) => [p.h1, p.seoTitle, p.description, p.intro, ...p.sections.flatMap((s) => [s.heading, s.body])]),
    ...COLLECTIONS.flatMap((c) => [c.h1, c.seoTitle, c.description, c.intro, c.note]),
  ];
  return [...tests, ...hubs, ...landings].join(" ");
}

describe("покрытие шрифта", () => {
  it("сабсет непустой и содержит русский алфавит", () => {
    expect(subset.size).toBeGreaterThan(150);
    for (const ch of "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя") {
      expect(subset.has(ch), `в сабсете нет «${ch}»`).toBe(true);
    }
  });

  it("весь текст контента покрыт сабсетом", () => {
    const missing = new Set<string>();
    for (const ch of textOf()) {
      if (ch === " " || ch === "\n" || ch === "\t") continue;
      if (!subset.has(ch) && !FALLBACK.has(ch)) missing.add(ch);
    }
    expect(
      [...missing],
      `эти символы отрисуются запасным шрифтом — пересоберите сабсет или замените их:\n${[...missing]
        .map((c) => `${c} (U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")})`)
        .join("\n")}`
    ).toEqual([]);
  });
});
