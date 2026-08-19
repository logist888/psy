import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { testSchema, type Test } from "./engine/schema";

const CONTENT_DIR = path.join(process.cwd(), "content", "tests");

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
