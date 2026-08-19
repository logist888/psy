/**
 * Гейт публикации контента: каждая методика обязана иметь запись в реестре прав
 * и проходить схему DSL. Запускается в CI — падение блокирует релиз.
 */
import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { testSchema } from "../src/lib/engine/schema";

const root = process.cwd();
const testsDir = path.join(root, "content", "tests");
const registry = loadYaml(
  fs.readFileSync(path.join(root, "content", "rights-register.yaml"), "utf8")
) as Record<string, { basis: string; commercial: string }>;

const errors: string[] = [];
const files = fs.readdirSync(testsDir).filter((f) => f.endsWith(".yaml"));

for (const file of files) {
  const slug = file.replace(/\.yaml$/, "");
  const raw = loadYaml(fs.readFileSync(path.join(testsDir, file), "utf8"));
  const parsed = testSchema.safeParse(raw);

  if (!parsed.success) {
    errors.push(`${file}: не проходит схему DSL — ${parsed.error.issues[0]?.message}`);
    continue;
  }
  if (parsed.data.slug !== slug) errors.push(`${file}: slug не совпадает с именем файла`);

  const rights = registry[slug];
  if (!rights) {
    errors.push(`${file}: НЕТ ЗАПИСИ В РЕЕСТРЕ ПРАВ — публикация запрещена`);
  } else if (rights.commercial !== "allowed") {
    errors.push(`${file}: реестр прав не разрешает коммерческое использование`);
  } else if (rights.basis !== parsed.data.passport.rightsBasis) {
    errors.push(`${file}: rightsBasis в паспорте (${parsed.data.passport.rightsBasis}) расходится с реестром (${rights.basis})`);
  }

  // Каждый вопрос должен ссылаться на существующую шкалу
  const scaleIds = new Set(parsed.data.scales.map((s) => s.id));
  for (const q of parsed.data.questions) {
    for (const s of q.scales) {
      if (!scaleIds.has(s.scale)) errors.push(`${file}: вопрос ${q.id} ссылается на несуществующую шкалу ${s.scale}`);
    }
  }
  // Кризисные правила должны ссылаться на существующие вопросы
  const questionIds = new Set(parsed.data.questions.map((q) => q.id));
  for (const rule of parsed.data.crisis) {
    if (!questionIds.has(rule.question)) errors.push(`${file}: кризисное правило ссылается на несуществующий вопрос ${rule.question}`);
  }
  // У каждой шкалы должен быть хотя бы один вопрос
  for (const scale of parsed.data.scales) {
    const count = parsed.data.questions.filter((q) => q.scales.some((s) => s.scale === scale.id)).length;
    if (count === 0) errors.push(`${file}: шкала ${scale.id} не содержит ни одного вопроса`);
  }
}

if (errors.length) {
  console.error("Проверка контента не пройдена:\n" + errors.map((e) => `  ✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Контент валиден: ${files.length} методик, у всех есть правовое основание`);
