import { describe, expect, it } from "vitest";
import { getAllTests, getAllConstructs, getRelatedTests, getConstructsForTest } from "../src/lib/content";
import { platformLink, CTA_COPY } from "../src/lib/site";

/**
 * SEO- и лидген-инварианты: то, что легко сломать правкой контента и трудно
 * заметить глазами. Ошибка здесь стоит трафика или атрибуции.
 */

const tests = getAllTests();
const constructs = getAllConstructs();

describe("SEO-инварианты методик", () => {
  it("у каждого теста уникальный slug", () => {
    const slugs = tests.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("title для выдачи уникальны и укладываются в разумную длину", () => {
    const titles = tests.map((t) => t.seoTitle);
    expect(new Set(titles).size).toBe(titles.length);
    for (const t of tests) {
      expect(t.seoTitle.length, `${t.slug}: слишком длинный seoTitle`).toBeLessThanOrEqual(70);
      expect(t.seoTitle.length, `${t.slug}: слишком короткий seoTitle`).toBeGreaterThan(20);
    }
  });

  it("описания уникальны и попадают в длину сниппета", () => {
    const descriptions = tests.map((t) => t.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const t of tests) {
      expect(t.description.length, `${t.slug}: описание короче сниппета`).toBeGreaterThan(70);
      expect(t.description.length, `${t.slug}: описание длиннее сниппета`).toBeLessThanOrEqual(220);
    }
  });

  it("у каждой методики заполнен научный паспорт", () => {
    for (const t of tests) {
      for (const [field, value] of Object.entries(t.passport)) {
        // rightsBasis — перечисление ("own_work"), к нему требование длины неприменимо
        const minLength = field === "rightsBasis" ? 5 : 10;
        expect(String(value).length, `${t.slug}.${field} пуст`).toBeGreaterThan(minLength);
      }
    }
  });

  it("везде есть практические шаги — они идут до CTA на странице результата", () => {
    for (const t of tests) expect(t.selfHelp.length, `${t.slug}: мало шагов`).toBeGreaterThanOrEqual(2);
  });
});

describe("Клинические границы и безопасность", () => {
  const forbidden = [/\bу вас (депрессия|тревожное расстройство|психопатия)\b/i, /поставить диагноз вам/i, /\bмы диагностируем\b/i];

  it("тексты методик не ставят диагнозов", () => {
    for (const t of tests) {
      const text = [t.description, t.passport.measures, ...t.scales.flatMap((s) => s.bands.map((b) => b.text))].join(" ");
      for (const pattern of forbidden) {
        expect(pattern.test(text), `${t.slug}: запрещённая формулировка ${pattern}`).toBe(false);
      }
    }
  });

  it("каждая методика честно называет свои ограничения", () => {
    for (const t of tests) {
      expect(t.passport.limitations.length, `${t.slug}: ограничения не описаны`).toBeGreaterThan(40);
    }
  });
});

describe("Лидген-разметка", () => {
  it("ссылки на платформу несут полную UTM для сквозной атрибуции", () => {
    const url = new URL(platformLink({ campaign: "burnout", content: "result_cta" }));
    expect(url.origin).toBe("https://mainexperts.online");
    expect(url.searchParams.get("utm_source")).toBe("psytests");
    expect(url.searchParams.get("utm_medium")).toBe("organic_test");
    expect(url.searchParams.get("utm_campaign")).toBe("burnout");
    expect(url.searchParams.get("utm_content")).toBe("result_cta");
  });

  it("у каждого теста есть текст CTA под его кластер", () => {
    for (const t of tests) {
      const cta = CTA_COPY[t.ctaCluster];
      expect(cta, `${t.slug}: нет текста CTA для кластера ${t.ctaCluster}`).toBeDefined();
      expect(cta.button.length).toBeGreaterThan(5);
    }
  });

  it("в карьерном кластере не зовут к психологу — там нужен карьерный консультант", () => {
    // Инсайт синтетических интервью: «психолог» ломает карьерный сценарий.
    expect(CTA_COPY.career.button.toLowerCase()).toContain("карьерн");
    expect(CTA_COPY.career.title.toLowerCase()).not.toContain("психолог");
  });
});

describe("Перелинковка", () => {
  it("каждый тест получает родственные, и себя в них нет", () => {
    for (const t of tests) {
      const related = getRelatedTests(t.slug);
      expect(related.length, `${t.slug}: нет похожих тестов`).toBeGreaterThan(0);
      expect(related.some((r) => r.slug === t.slug), `${t.slug}: ссылается сам на себя`).toBe(false);
    }
  });

  it("хабы ссылаются только на существующие тесты и обратная связь работает", () => {
    for (const c of constructs) {
      for (const slug of c.tests) {
        expect(tests.some((t) => t.slug === slug), `${c.slug}: нет теста ${slug}`).toBe(true);
        expect(getConstructsForTest(slug).some((x) => x.slug === c.slug)).toBe(true);
      }
    }
  });

  it("у хабов уникальные seoTitle и заполненный FAQ", () => {
    const titles = constructs.map((c) => c.seoTitle);
    expect(new Set(titles).size).toBe(titles.length);
    for (const c of constructs) {
      expect(c.faq.length, `${c.slug}: мало вопросов в FAQ`).toBeGreaterThanOrEqual(2);
      for (const item of c.faq) expect(item.a.length, `${c.slug}: короткий ответ`).toBeGreaterThan(40);
    }
  });
});
