import { z } from "zod";

/**
 * Декларативный DSL методики. Изменение любого поля, влияющего на результат,
 * требует bump `version` — старые ссылки на результаты должны считаться так же.
 * См. docs/architecture/test-engine.md
 */

export const optionSchema = z.object({
  text: z.string().min(1),
  value: z.number().int().min(0).max(35),
});

export const questionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  /** Шкалы, в которые входит вопрос. reverse — обратный пункт. */
  scales: z.array(z.object({ scale: z.string(), reverse: z.boolean().default(false) })).min(1),
});

export const scaleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Что означает высокий полюс — показывается в результате. */
  high: z.string().min(1),
  low: z.string().min(1),
  bands: z
    .array(
      z.object({
        /** Нижняя граница в процентах от максимума шкалы, включительно. */
        from: z.number().min(0).max(100),
        label: z.string().min(1),
        text: z.string().min(1),
      })
    )
    .min(2),
});

export const crisisRuleSchema = z.object({
  question: z.string().min(1),
  minValue: z.number().int().min(0),
});

export const testSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  title: z.string().min(1),
  /** H1/SEO-заголовок и мета. */
  seoTitle: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["personality", "wellbeing", "relationships", "career", "values"]),
  /** Кластер определяет тон CTA: career -> «карьерный консультант». */
  ctaCluster: z.enum(["burnout", "anxiety", "relationships", "self", "career"]),
  minutes: z.number().int().positive(),
  /** Научный паспорт — обязателен, см. docs/product/prd.md §2. */
  passport: z.object({
    measures: z.string().min(1),
    origin: z.string().min(1),
    rightsBasis: z.enum(["public_domain", "own_work", "license"]),
    rightsNote: z.string().min(1),
    reliability: z.string().min(1),
    limitations: z.string().min(1),
  }),
  instruction: z.string().min(1),
  options: z.array(optionSchema).min(2),
  scales: z.array(scaleSchema).min(1),
  questions: z.array(questionSchema).min(1),
  crisis: z.array(crisisRuleSchema).default([]),
  /** Практические шаги, показываются ДО CTA (инсайт синтетических интервью). */
  selfHelp: z.array(z.string().min(1)).min(2),
});

export type Test = z.infer<typeof testSchema>;
export type Scale = z.infer<typeof scaleSchema>;
export type Question = z.infer<typeof questionSchema>;

/** Конструкт-хаб: забирает информационный интент и перелинковывает тесты. */
export const constructSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  seoTitle: z.string().min(1),
  description: z.string().min(1),
  intro: z.string().min(1),
  sections: z.array(z.object({ heading: z.string().min(1), body: z.string().min(1) })).min(2),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(2),
  /** Слаги тестов; проверяются на существование при загрузке. */
  tests: z.array(z.string()).min(1),
});

export type Construct = z.infer<typeof constructSchema>;
