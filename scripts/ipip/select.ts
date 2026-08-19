/**
 * Отбор следующей партии шкал для перевода.
 *
 * Ручной отбор партии не масштабируется и уже дважды давал сбой: то шкала
 * оказывалась дублем опубликованного конструкта, то ссылка вела в шкалу с
 * тем же именем, но с другой страницы. Правила отбора здесь, а не в голове.
 *
 * Использование: npx tsx scripts/ipip/select.ts [сколько] > /tmp/tranche.json
 */
import fs from "node:fs";
import path from "node:path";

interface Scale {
  name: string;
  alpha: number | null;
  items: { text: string; key: "+" | "-" }[];
}

const root = process.cwd();
const corpus = JSON.parse(fs.readFileSync(path.join(root, "content/ipip/scales-en.json"), "utf8")) as Record<
  string,
  Scale[]
>;
const register = fs.readFileSync(path.join(root, "content/rights-register.yaml"), "utf8");

/** Уже опубликованные шкалы — и по полной ссылке, и по голому имени. */
const publishedKeys = new Set<string>();
const publishedConstructs = new Set<string>();
for (const m of register.matchAll(/source:.*шкала\s+(.+?)\s*$/gm)) {
  publishedKeys.add(m[1]);
  const bare = m[1].includes("/") ? m[1].split("/").slice(1).join("/") : m[1];
  publishedConstructs.add(constructKey(bare));
}

/**
 * Имя, которое не называет конструкт: метка неразобранной шкалы или обрывок
 * служебной строки, просочившийся в корпус («Alpha», «Scale»). Сюда же —
 * номерные факторы («FACTOR IV», «Factor II»): по такому имени нельзя ни
 * написать интерпретацию, ни собрать поисковый запрос.
 */
const JUNK = new Set(["Alpha", "Alpha =", "Scale", "Facets", "6FPQ"]);
function isUsableName(name: string): boolean {
  if (name.startsWith("?") || JUNK.has(name)) return false;
  if (/^factor\s+[ivx\d]+$/i.test(name.replace(/\s*\(\d+-item\)$/i, "").trim())) return false;
  return /[A-Za-z]{3}/.test(name) && name.length >= 3;
}

/**
 * Клинические конструкты — фаза 2: они пускаются в публикацию только вместе с
 * именованными экспертами платформы, выверенными формулировками «скрининг ≠
 * диагноз» и полным кризисным контуром (docs/strategy/lead-gen-pivot.md §6).
 * Автоматический отбор до них не допускается.
 */
const CLINICAL =
  /depress|dissociat|obsessive|compulsive|psychotic|mania|hypomanic|suicid|trauma|ptsd|panic|phobia|addict|eating|somatic|adhd|attention deficit/i;

/**
 * Шкалы лжи и стиля ответа: они измеряют не черту человека, а то, как он
 * заполняет опросник. Как отдельный тест бессмысленны и провоцируют
 * обвинительную интерпретацию.
 */
const VALIDITY = /unlikely virtues|social desirability|impression-?management|self-?deception|infrequency|lie scale/i;

/**
 * Внешность как предмет самооценки: тест «насколько вы привлекательны» на
 * сайте про психологическую помощь бьёт по образу тела, а не помогает.
 */
const SENSITIVE = /physical attractiveness|masculinity|femininity|narcissism/i;

function isPublishable(name: string): boolean {
  return !CLINICAL.test(name) && !VALIDITY.test(name) && !SENSITIVE.test(name);
}

/** «NEUROTICISM (20-item)» и «NEUROTICISM» — один конструкт разной длины. */
function constructKey(name: string): string {
  return name.replace(/\s*\(\d+-item\)$/i, "").trim().toUpperCase();
}

const MIN_ALPHA = 0.7;
/** Короткая шкала даёт слишком грубый результат, чтобы вокруг него писать разбор. */
const MIN_ITEMS = 8;
/**
 * Шкалы IPIP не длиннее 20 пунктов. Больше — почти наверняка две слитые разбором
 * шкалы: гарды такое пропустят (число пунктов сойдётся с корпусом), а человек
 * получит тест из двух разных конструктов.
 */
const MAX_ITEMS = 20;
/**
 * Страница маркеров Большой пятёрки разобрана плохо (семь шкал без имени), а её
 * факторы — те же конструкты, что домены NEO, уже покрытые тестом «Большая пятёрка».
 */
const SKIP_PAGES = new Set(["BigFive5broad"]);

type Candidate = { key: string; page: string; name: string; alpha: number; items: Scale["items"] };
const byName = new Map<string, Candidate[]>();

for (const [page, scales] of Object.entries(corpus)) {
  if (SKIP_PAGES.has(page)) continue;
  for (const s of scales) {
    if (!isUsableName(s.name) || !isPublishable(s.name)) continue;
    if (publishedKeys.has(`${page}/${s.name}`) || publishedConstructs.has(constructKey(s.name))) continue;
    // Без опубликованной альфы паспорт не сможет ничего сказать о надёжности
    if (s.alpha === null || s.alpha < MIN_ALPHA) continue;
    if (s.items.length < MIN_ITEMS || s.items.length > MAX_ITEMS) continue;
    const ck = constructKey(s.name);
    byName.set(ck, [...(byName.get(ck) ?? []), { key: `${page}/${s.name}`, page, name: s.name, alpha: s.alpha, items: s.items }]);
  }
}

// Один конструкт — одна методика: из одноимённых шкал берём самую надёжную,
// при равной альфе — более длинную (больше пунктов = устойчивее результат).
const picked: Candidate[] = [];
for (const group of byName.values()) {
  group.sort((a, b) => b.alpha - a.alpha || b.items.length - a.items.length);
  picked.push(group[0]);
}
picked.sort((a, b) => b.alpha - a.alpha);

const limit = Number(process.argv[2] || 40);
const tranche = picked.slice(0, limit);

process.stdout.write(JSON.stringify(tranche, null, 1));
console.error(
  `кандидатов после дедупликации: ${picked.length}, отобрано: ${tranche.length}\n` +
    `по страницам: ${Object.entries(
      tranche.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.page]: (acc[c.page] ?? 0) + 1 }), {})
    )
      .map(([p, n]) => `${p} ${n}`)
      .join(", ")}`
);
