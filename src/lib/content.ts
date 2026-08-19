import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { testSchema, constructSchema, type Test, type Construct } from "./engine/schema";

const CONTENT_DIR = path.join(process.cwd(), "content", "tests");
const CONSTRUCTS_DIR = path.join(process.cwd(), "content", "constructs");

let cache: Test[] | null = null;

export function getAllTests(): Test[] {
  if (cache) return cache;
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".yaml"));
  const tests = files.map((file) => {
    const raw = loadYaml(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
    const parsed = testSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Методика ${file} не проходит валидацию: ${parsed.error.message}`);
    }
    if (parsed.data.slug !== file.replace(/\.yaml$/, "")) {
      throw new Error(`Методика ${file}: slug должен совпадать с именем файла`);
    }
    return parsed.data;
  });
  cache = tests.sort((a, b) => a.title.localeCompare(b.title, "ru"));
  return cache;
}

export function getTest(slug: string): Test | undefined {
  return getAllTests().find((t) => t.slug === slug);
}

export const CATEGORIES: Record<Test["category"], { title: string; description: string }> = {
  personality: { title: "Личность", description: "Черты, самооценка, характер" },
  wellbeing: { title: "Состояние", description: "Напряжение, выгорание, ресурс" },
  relationships: { title: "Отношения", description: "Привязанность и близость" },
  career: { title: "Работа и призвание", description: "Интересы и профессиональный выбор" },
  values: { title: "Ценности", description: "Что для вас важно" },
};

let constructCache: Construct[] | null = null;

export function getAllConstructs(): Construct[] {
  if (constructCache) return constructCache;
  if (!fs.existsSync(CONSTRUCTS_DIR)) return [];
  const slugs = new Set(getAllTests().map((t) => t.slug));
  const files = fs.readdirSync(CONSTRUCTS_DIR).filter((f) => f.endsWith(".yaml"));
  constructCache = files.map((file) => {
    const raw = loadYaml(fs.readFileSync(path.join(CONSTRUCTS_DIR, file), "utf8"));
    const parsed = constructSchema.safeParse(raw);
    if (!parsed.success) throw new Error(`Хаб ${file} не проходит валидацию: ${parsed.error.message}`);
    for (const slug of parsed.data.tests) {
      if (!slugs.has(slug)) throw new Error(`Хаб ${file} ссылается на несуществующий тест: ${slug}`);
    }
    return parsed.data;
  });
  return constructCache;
}

export function getConstruct(slug: string): Construct | undefined {
  return getAllConstructs().find((c) => c.slug === slug);
}

/** Хабы, в которые входит тест — для перелинковки с его страницы. */
export function getConstructsForTest(slug: string): Construct[] {
  return getAllConstructs().filter((c) => c.tests.includes(slug));
}

/**
 * Родственные тесты: сначала соседи по конструкт-хабам, затем та же категория.
 * Перелинковка внутри тематики работает и на SEO, и на глубину сессии.
 */
export function getRelatedTests(slug: string, limit = 3): Test[] {
  const all = getAllTests();
  const current = all.find((t) => t.slug === slug);
  if (!current) return [];
  const fromHubs = getConstructsForTest(slug).flatMap((c) => c.tests);
  const ranked = new Map<string, number>();
  for (const s of fromHubs) if (s !== slug) ranked.set(s, (ranked.get(s) ?? 0) + 2);
  for (const t of all) {
    if (t.slug === slug) continue;
    if (t.category === current.category) ranked.set(t.slug, (ranked.get(t.slug) ?? 0) + 1);
  }
  const picked = [...ranked.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([s]) => s);

  // Добираем до лимита любыми другими тестами: страница без исходящих ссылок —
  // тупик и для читателя, и для обхода поисковиком.
  for (const t of all) {
    if (picked.length >= limit) break;
    if (t.slug !== slug && !picked.includes(t.slug)) picked.push(t.slug);
  }

  return picked.slice(0, limit).map((s) => all.find((t) => t.slug === s)!).filter(Boolean);
}
