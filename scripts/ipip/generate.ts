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
  /**
   * Опросник интересов спрашивает не «похоже ли это на вас», а «насколько вам
   * это нравится»: шкала ответов и инструкция у него свои.
   */
  kind?: "agreement" | "interest";
}

const OPTIONS = [
  { text: "Совсем не про меня", value: 0 },
  { text: "Скорее не про меня", value: 1 },
  { text: "Затрудняюсь", value: 2 },
  { text: "Скорее про меня", value: 3 },
  { text: "Точно про меня", value: 4 },
];

/** Шкала интересов — как в уже опубликованном тесте на профориентацию. */
const INTEREST_OPTIONS = [
  { text: "Совсем не нравится", value: 0 },
  { text: "Скорее не нравится", value: 1 },
  { text: "Скорее нравится", value: 2 },
  { text: "Очень нравится", value: 3 },
];

const INSTRUCTION = {
  agreement:
    "Оцените, насколько каждое утверждение описывает вас. Отвечайте не задумываясь — первое впечатление обычно точнее.",
  interest:
    "Оценивайте, насколько вам нравится такая деятельность, независимо от того, умеете вы это или нет и сколько за это платят.",
};

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

/**
 * Имя конструкта пишется как определение («агрессивность как черта характера»,
 * «избегание риска и опасности»), а адрес страницы должен быть коротким и
 * совпадать с поисковым запросом. Режем определение по первому «и»/«как»:
 * смысл несут title и description, адресу достаточно ядра.
 */
export function slugFromConstruct(construct: string): string {
  const head = construct.split(/\s+(?:и|как)\s+/)[0];
  return slugify(head);
}

/** В названии шкалы «как …» — тоже определение, а не имя. В результатах мешает. */
export function scaleName(construct: string): string {
  return construct.split(/\s+как\s+/)[0];
}

/**
 * Часть страниц пула — самостоятельные опросники со своей публикацией. Назвать
 * их в паспорте точнее и честнее, чем сослаться на пул вообще.
 */
const INSTRUMENTS: Record<string, string> = {
  ORVIS:
    "Шкала опросника профессиональных интересов ORVIS (Oregon Vocational Interest Scales; Pozzebon, Visser, Ashton, Lee & Goldberg, 2010) из международного пула пунктов IPIP",
  ORAIS:
    "Шкала опросника внепрофессиональных интересов ORAIS (Oregon Avocational Interest Scales) из международного пула пунктов IPIP",
};

function build(t: Translated, alpha: number | null, page?: string) {
  const slug = slugFromConstruct(t.construct);
  const interest = t.kind === "interest";
  const options = interest ? INTEREST_OPTIONS : OPTIONS;

  return {
    slug,
    version: "1.0.0",
    title: t.title,
    seoTitle: t.seoTitle,
    description: t.description,
    category: interest ? ("career" as const) : ("personality" as const),
    ctaCluster: interest ? ("career" as const) : ("self" as const),
    minutes: Math.max(2, Math.round(t.items.length / 4)),
    passport: {
      measures: t.measures,
      origin: `${
        (page && INSTRUMENTS[page]) ||
        "Шкала из международного пула пунктов IPIP (International Personality Item Pool)"
      }, измеряющая конструкт «${t.construct}». Русский перевод выполнен для этого проекта.`,
      rightsBasis: "public_domain" as const,
      rightsNote:
        "Пункты IPIP находятся в общественном достоянии с 1999 года, коммерческое использование разрешено явно. Перевод — собственная работа проекта.",
      reliability: alpha
        ? `У англоязычного оригинала внутренняя согласованность α ≈ ${alpha.toFixed(2)} (данные IPIP)${
            alpha < 0.7
              ? " — это ниже привычного порога 0,70, то есть пункты шкалы согласуются между собой слабо и результат стоит читать как повод подумать, а не как замер"
              : ""
          }. Русский перевод независимой психометрической проверки не проходил, поэтому относитесь к результату как к ориентиру, а не к измерению.`
        : "Ни коэффициент надёжности англоязычного оригинала, ни проверка русского перевода не опубликованы — относитесь к результату как к поводу подумать, а не к измерению.",
      limitations: interest
        ? "Шкала показывает интерес, а не способности и не пригодность к профессии: нравится — не то же самое, что получается. Нормы российской выборки не собраны, вы видите процент от максимума шкалы, а не сравнение с другими людьми, поэтому читайте результат как повод присмотреться к направлению, а не как рекомендацию по выбору работы."
        : "Шкала измеряет одну черту и описывает привычный способ вести себя, а не способности и не потолок возможностей. Результат зависит от состояния в момент прохождения, а нормы российской выборки не собраны: вы видите процент от максимума шкалы, а не сравнение с другими людьми.",
    },
    instruction: interest ? INSTRUCTION.interest : INSTRUCTION.agreement,
    options,
    scales: [
      {
        id: "total",
        name: scaleName(t.construct),
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
  // Имена шкал не уникальны между страницами IPIP: ANXIETY есть и в NEO, и в 16PF,
  // PLANFULNESS — и в CPI, и в MPQ. Раньше выигрывала последняя разобранная страница,
  // и в паспорт методики попадала альфа чужой шкалы. Поэтому ключ — «страница/имя»,
  // а неоднозначное имя методика не получает вовсе.
  const byQualified = new Map<string, { alpha: number | null; items: number }>();
  const byName = new Map<string, string[]>();
  for (const [page, scales] of Object.entries(source)) {
    for (const s of scales) {
      const key = `${page}/${s.name}`;
      byQualified.set(key, { alpha: s.alpha, items: s.items.length });
      byName.set(s.name, [...(byName.get(s.name) ?? []), key]);
    }
  }

  /** Шкала-источник: либо «страница/имя», либо имя, если оно во всём пуле одно. */
  function resolve(scale: string): { key: string; alpha: number | null; items: number } | string {
    if (scale.includes("/")) {
      const hit = byQualified.get(scale);
      return hit ? { key: scale, ...hit } : `шкала ${scale} не найдена в пуле IPIP`;
    }
    const keys = byName.get(scale) ?? [];
    if (keys.length === 1) return { key: keys[0], ...byQualified.get(keys[0])! };
    if (!keys.length) return `шкала ${scale} не найдена в пуле IPIP`;
    return `имя ${scale} встречается на нескольких страницах (${keys.join(", ")}) — укажите «страница/имя»`;
  }

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

      const resolved = resolve(t.scale);
      if (typeof resolved === "string") {
        console.error(`✗ ${t.scale}: ${resolved}`);
        continue;
      }
      // Число пунктов — отпечаток шкалы. Расхождение значит, что перевод сделан
      // с другой шкалы, и паспорт припишет ему чужую надёжность.
      if (resolved.items !== t.items.length) {
        console.error(
          `✗ ${t.scale}: в источнике ${resolved.items} пунктов, в переводе ${t.items.length} — перевод не от этой шкалы`
        );
        continue;
      }

      const test = build(t, resolved.alpha, resolved.key.split("/")[0]);
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
                    // Имя шкалы может содержать двоеточие («Locus of Control: Total»),
          // а незакавыченное двоеточие с пробелом YAML читает как вложенный ключ
          `  source: ${JSON.stringify(`IPIP (International Personality Item Pool), шкала ${resolved.key}`)}`,
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
