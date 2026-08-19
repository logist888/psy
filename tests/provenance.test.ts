import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getAllTests } from "../src/lib/content";

/**
 * Происхождение методики: каждая опубликованная страница называет шкалу-источник
 * и её надёжность как факт. Имена шкал в пуле IPIP не уникальны (ANXIETY есть и
 * в NEO, и в 16PF; PLANFULNESS — и в CPI, и в MPQ), а вёрстка страниц-ключей
 * местами подменяет имя шкалы обрывком ссылки на исходный опросник. Один раз это
 * уже привело к тому, что в паспорт попала альфа чужой шкалы. Здесь проверяется,
 * что ссылка из реестра прав ведёт в реально существующую шкалу и что число
 * пунктов совпадает — это отпечаток, по которому видно подмену.
 */

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "content/ipip/scales-en.json"), "utf8")
) as Record<string, { name: string; alpha: number | null; items: unknown[] }[]>;
const register = fs.readFileSync(path.join(root, "content/rights-register.yaml"), "utf8");

const byQualified = new Map<string, { alpha: number | null; items: number }>();
for (const [page, scales] of Object.entries(corpus)) {
  for (const s of scales) byQualified.set(`${page}/${s.name}`, { alpha: s.alpha, items: s.items.length });
}

/** Записи реестра вида "slug:\n  source: ... шкала PAGE/NAME" */
const sources = new Map<string, string>();
let slug = "";
for (const line of register.split("\n")) {
  const head = /^([a-z0-9-]+):\s*$/.exec(line);
  if (head) slug = head[1];
  const src = /^\s+source:.*шкала\s+(.+?)\s*$/.exec(line);
  if (src && slug) sources.set(slug, src[1]);
}

const ipipTests = getAllTests().filter((t) => sources.has(t.slug) && sources.get(t.slug)!.includes("/"));

describe("происхождение методик IPIP", () => {
  it("реестр вообще ссылается на шкалы IPIP", () => {
    expect(ipipTests.length).toBeGreaterThan(0);
  });

  it("каждая ссылка ведёт в существующую шкалу пула", () => {
    for (const t of ipipTests) {
      const key = sources.get(t.slug)!;
      expect(byQualified.has(key), `${t.slug}: шкалы ${key} нет в пуле IPIP`).toBe(true);
    }
  });

  it("число вопросов совпадает с числом пунктов шкалы-источника", () => {
    for (const t of ipipTests) {
      const source = byQualified.get(sources.get(t.slug)!);
      if (!source) continue;
      expect(t.questions.length, `${t.slug}: вопросов ${t.questions.length}, а в источнике ${source.items}`).toBe(
        source.items
      );
    }
  });

  it("альфа в паспорте — альфа именно этой шкалы", () => {
    for (const t of ipipTests) {
      const source = byQualified.get(sources.get(t.slug)!);
      if (!source) continue;
      const claimed = /α ≈ ([0-9.]+)/.exec(t.passport.reliability);
      if (source.alpha === null) {
        expect(claimed, `${t.slug}: альфы у источника нет, а паспорт её называет`).toBeNull();
      } else {
        expect(claimed, `${t.slug}: паспорт не называет альфу источника`).not.toBeNull();
        expect(Number(claimed![1]), `${t.slug}: альфа не от шкалы-источника`).toBeCloseTo(source.alpha, 2);
      }
    }
  });

  it("шкала без имени в пул не попадает", () => {
    const unnamed = Object.entries(corpus).flatMap(([page, scales]) =>
      scales.filter((s) => s.name.startsWith("?")).map((s) => `${page}/${s.name}`)
    );
    // Метка «?» ставится разбором там, где имя шкалы не опознано. Такие шкалы
    // допустимы в корпусе (их пункты не сливаются с соседними), но публиковать
    // их нельзя: неизвестно, что именно измеряется.
    for (const t of ipipTests) {
      expect(unnamed, `${t.slug}: опубликована шкала без опознанного имени`).not.toContain(sources.get(t.slug));
    }
  });
});
