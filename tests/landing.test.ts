import { describe, expect, it } from "vitest";
import {
  getAllTests,
  getAllConstructs,
  CATEGORY_PAGES,
  COLLECTIONS,
  getCategoryBySlug,
  getCollection,
  getTestsByCategory,
} from "../src/lib/content";
import type { Test } from "../src/lib/engine/schema";

/**
 * Посадочные страницы: разделы каталога и тематические хабы. Их легко сломать
 * правкой контента — раздел опустеет, хаб останется без тестов, два заголовка
 * совпадут, — и заметно это станет только по просевшему трафику.
 */

const tests = getAllTests();
const hubs = getAllConstructs();
const categories = Object.keys(CATEGORY_PAGES) as Test["category"][];

describe("страницы разделов", () => {
  it("в каждом разделе есть тесты", () => {
    // Пустой раздел — посадочная страница без содержания и тупик для обхода
    for (const category of categories) {
      expect(getTestsByCategory(category).length, `раздел ${category} пуст`).toBeGreaterThan(0);
    }
  });

  it("адреса разделов различаются и находятся по адресу", () => {
    const slugs = categories.map((c) => CATEGORY_PAGES[c].slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(getCategoryBySlug(slug)).toBeDefined();
  });

  it("заголовки и описания разделов уникальны и укладываются в выдачу", () => {
    const titles = categories.map((c) => CATEGORY_PAGES[c].seoTitle);
    const descriptions = categories.map((c) => CATEGORY_PAGES[c].description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const c of categories) {
      const page = CATEGORY_PAGES[c];
      expect(page.seoTitle.length, `${page.slug}: длинный seoTitle`).toBeLessThanOrEqual(70);
      expect(page.description.length, `${page.slug}: короткое описание`).toBeGreaterThan(70);
      expect(page.description.length, `${page.slug}: длинное описание`).toBeLessThanOrEqual(220);
      expect(page.sections.length, `${page.slug}: нужен собственный текст, иначе это копия каталога`).toBeGreaterThan(1);
    }
  });

  it("каждый тест попадает на страницу своего раздела", () => {
    const covered = new Set(categories.flatMap((c) => getTestsByCategory(c).map((t) => t.slug)));
    for (const t of tests) expect(covered.has(t.slug), `${t.slug} не попадает ни в один раздел`).toBe(true);
  });
});

describe("тематические хабы", () => {
  it("заголовки и описания уникальны", () => {
    const titles = hubs.map((h) => h.seoTitle);
    const descriptions = hubs.map((h) => h.description);
    expect(new Set(titles).size, "повторяющийся seoTitle хаба").toBe(titles.length);
    expect(new Set(descriptions).size, "повторяющееся описание хаба").toBe(descriptions.length);
  });

  it("хаб ведёт минимум на три теста", () => {
    // Хаб без выхода на тесты не выполняет свою работу в воронке
    for (const hub of hubs) {
      expect(hub.tests.length, `${hub.slug}: мало тестов`).toBeGreaterThanOrEqual(3);
      expect(new Set(hub.tests).size, `${hub.slug}: повторяющийся тест`).toBe(hub.tests.length);
    }
  });

  it("адреса хабов не совпадают с адресами разделов", () => {
    const categorySlugs = new Set(categories.map((c) => CATEGORY_PAGES[c].slug));
    for (const hub of hubs) expect(categorySlugs.has(hub.slug), `${hub.slug} дублирует адрес раздела`).toBe(false);
  });

  it("в текстах хабов нет пустых оборотов", () => {
    // Штампы, по которым текст читается как написанный ради объёма: они же первыми
    // выдают страницу, сделанную «для поисковика», а не для человека
    const filler =
      /в современном мире|важно понимать|играет важную роль|стоит отметить|является ключевым фактором|не секрет, что|каждый человек уникален/i;
    const offenders: string[] = [];
    for (const hub of hubs) {
      const text = [hub.intro, ...hub.sections.map((s) => s.body), ...hub.faq.map((f) => f.a)].join(" ");
      const hit = filler.exec(text);
      if (hit) offenders.push(`${hub.slug}: «${hit[0]}»`);
    }
    expect(offenders, `пустые обороты:\n${offenders.join("\n")}`).toEqual([]);
  });
});

describe("подборки", () => {
  it("подборка не бывает пустой", () => {
    // Подборка собирается по признаку, а не руками: правка контента может
    // обнулить условие отбора, и страница тихо станет пустой
    for (const c of COLLECTIONS) {
      const collection = getCollection(c.slug);
      expect(collection, `${c.slug} не находится по адресу`).toBeDefined();
      expect(collection!.tests.length, `подборка ${c.slug} пуста`).toBeGreaterThanOrEqual(3);
    }
  });

  it("адреса и заголовки подборок уникальны и не сталкиваются с разделами", () => {
    const slugs = COLLECTIONS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const titles = COLLECTIONS.map((c) => c.seoTitle);
    expect(new Set(titles).size).toBe(titles.length);
    const categorySlugs = new Set(Object.values(CATEGORY_PAGES).map((p) => p.slug));
    for (const slug of slugs) expect(categorySlugs.has(slug), `${slug} дублирует адрес раздела`).toBe(false);
  });

  it("описания подборок укладываются в сниппет", () => {
    for (const c of COLLECTIONS) {
      expect(c.seoTitle.length, `${c.slug}: длинный seoTitle`).toBeLessThanOrEqual(70);
      expect(c.description.length, `${c.slug}: короткое описание`).toBeGreaterThan(70);
      expect(c.description.length, `${c.slug}: длинное описание`).toBeLessThanOrEqual(220);
    }
  });

  it("подборка «с проверенной надёжностью» действительно фильтрует по альфе", () => {
    // Обещание в заголовке должно выполняться содержимым, иначе это обман
    const collection = getCollection("s-nauchnoy-osnovoy")!;
    for (const test of collection.tests) {
      const alpha = Number(/α ≈ ([0-9.]+)/.exec(test.passport.reliability)?.[1] ?? 0);
      expect(alpha, `${test.slug}: α ${alpha} ниже обещанных 0,80`).toBeGreaterThanOrEqual(0.8);
    }
  });
});
