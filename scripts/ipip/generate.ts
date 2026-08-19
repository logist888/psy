/**
 * Сборка методик из переведённых шкал IPIP.
 *
 * Вход — JSON от переводческого этапа: конструкт, тексты интерпретаций и
 * пункты с направлением ключа. Выход — YAML в content/tests и запись в
 * реестре прав. Правовое основание одно для всех: пул IPIP в общественном
 * достоянии, перевод — работа проекта.
 */
import fs from "node:fs";
import path from "node:path";
import { dump } from "js-yaml";
import { testSchema } from "../../src/lib/engine/schema";

interface Translated {
  scale: string;
  title: string;
  construct: string;
  seoTitle: string;
  description: string;
  measures: string;
  high: string;
  low: string;
  bands: { from: number; label: string; text: string }[];
  selfHelp: string[];
  items: { text: string; key: "+" | "-" }[];
}

const OPTIONS = [
  { text: "Совсем не про меня", value: 0 },
  { text: "Скорее не про меня", value: 1 },
  { text: "Затрудняюсь", value: 2 },
  { text: "Скорее про меня", value: 3 },
  { text: "Точно про меня", value: 4 },
];

/** Транслитерация конструкта в slug: адрес должен читаться на латинице. */
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((c) => (c in MAP ? MAP[c] : /[a-z0-9]/.test(c) ? c : "-"))
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function build(t: Translated, alphaByScale: Map<string, number | null>) {
  const alpha = alphaByScale.get(t.scale) ?? null;
  const slug = slugify(t.construct);

  return {
    slug,
    version: "1.0.0",
    title: t.title,
    seoTitle: t.seoTitle,
    description: t.description,
    category: "personality" as const,
    ctaCluster: "self" as const,
    minutes: Math.max(2, Math.round(t.items.length / 4)),
    passport: {
      measures: t.measures,
      origin: `Шкала из международного пула пунктов IPIP (International Personality Item Pool), измеряющая конструкт «${t.construct}». Русский перевод выполнен для этого проекта.`,
      rightsBasis: "public_domain" as const,
      rightsNote:
        "Пункты IPIP находятся в общественном достоянии с 1999 года, коммерческое использование разрешено явно. Перевод — собственная работа проекта.",
      reliability: alpha
        ? `У англоязычного оригинала внутренняя согласованность α ≈ ${alpha.toFixed(2)} (данные IPIP). Русский перевод независимой психометрической проверки не проходил, поэтому относитесь к результату как к ориентиру, а не к измерению.`
        : "Русский перевод независимой психометрической проверки не проходил — относитесь к результату как к ориентиру.",
      limitations:
        "Шкала измеряет одну черту и описывает привычный способ вести себя, а не способности и не потолок возможностей. Результат зависит от состояния в момент прохождения, а нормы российской выборки не собраны: вы видите процент от максимума шкалы, а не сравнение с другими людьми.",
    },
    instruction:
      "Оцените, насколько каждое утверждение описывает вас. Отвечайте не задумываясь — первое впечатление обычно точнее.",
    options: OPTIONS,
    scales: [
      {
        id: "total",
        name: t.construct,
        high: t.high,
        low: t.low,
        bands: t.bands,
      },
    ],
    questions: t.items.map((item, i) => ({
      id: `q${i + 1}`,
      text: item.text,
      scales: [{ scale: "total", ...(item.key === "-" ? { reverse: true } : {}) }],
    })),
    crisis: [],
    selfHelp: t.selfHelp,
  };
}

function main() {
  const files = process.argv.slice(2);
  if (!files.length) throw new Error("укажите файлы с переводами");

  const source = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/ipip/scales-en.json"), "utf8")) as Record<
    string,
    { name: string; alpha: number | null; items: unknown[] }[]
  >;
  const alphaByScale = new Map<string, number | null>();
  for (const scales of Object.values(source)) for (const s of scales) alphaByScale.set(s.name, s.alpha);

  const registry: string[] = [];
  const seen = new Set(
    fs.readdirSync(path.join(process.cwd(), "content/tests")).map((f) => f.replace(/\.yaml$/, ""))
  );
  let written = 0;

  for (const file of files) {
    const translated = JSON.parse(fs.readFileSync(file, "utf8")) as Translated[];
    for (const t of translated) {
      // Тексты называют число вопросов — оно должно совпадать с фактическим.
      // Ловилось руками дважды, теперь ловится здесь.
      const declared = [t.seoTitle, t.description]
        .flatMap((s) => [...s.matchAll(/(\d+)\s+(?:вопрос|утвержд)/g)].map((m) => Number(m[1])));
      const mismatch = declared.find((n) => n !== t.items.length);
      if (mismatch !== undefined) {
        console.error(`✗ ${t.scale}: в тексте ${mismatch} вопросов, а пунктов ${t.items.length}`);
        continue;
      }

      const test = build(t, alphaByScale);
      const parsed = testSchema.safeParse(test);
      if (!parsed.success) {
        console.error(`✗ ${t.scale}: ${parsed.error.issues[0]?.path.join(".")} — ${parsed.error.issues[0]?.message}`);
        continue;
      }
      const target = path.join(process.cwd(), "content/tests", `${test.slug}.yaml`);
      if (seen.has(test.slug)) {
        console.error(`✗ ${t.scale}: конструкт ${test.slug} уже опубликован — пропускаю, чтобы страницы не конкурировали за один запрос`);
        continue;
      }
      seen.add(test.slug);
      fs.writeFileSync(target, dump(test, { lineWidth: 120, noRefs: true }));
      registry.push(
        [
          `${test.slug}:`,
          `  basis: public_domain`,
          `  source: IPIP (International Personality Item Pool), шкала ${t.scale}`,
          `  evidence: https://ipip.ori.org/ — пул пунктов в общественном достоянии с 1999 г., коммерческое использование разрешено явно`,
          `  translation: собственный перевод проекта`,
          `  commercial: allowed`,
          `  verified: 2026-08-19`,
        ].join("\n")
      );
      written++;
    }
  }

  fs.appendFileSync(path.join(process.cwd(), "content/rights-register.yaml"), "\n" + registry.join("\n") + "\n");
  console.log(`✓ создано методик: ${written}`);
}

main();
