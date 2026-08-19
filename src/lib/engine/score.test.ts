import { describe, expect, it } from "vitest";
import { score, encodeAnswers, decodeAnswers, type Answers } from "./score";
import { testSchema, type Test } from "./schema";

const fixture: Test = testSchema.parse({
  slug: "fixture",
  version: "1.0.0",
  title: "Фикстура",
  seoTitle: "Фикстура",
  description: "Тестовая методика для проверки движка.",
  category: "wellbeing",
  ctaCluster: "burnout",
  minutes: 1,
  passport: {
    measures: "ничего",
    origin: "собственная разработка",
    rightsBasis: "own_work",
    rightsNote: "внутренняя фикстура",
    reliability: "не применимо",
    limitations: "не применимо",
  },
  instruction: "Оцените утверждения.",
  options: [
    { text: "Нет", value: 0 },
    { text: "Иногда", value: 1 },
    { text: "Часто", value: 2 },
    { text: "Всегда", value: 3 },
  ],
  scales: [
    {
      id: "a",
      name: "Шкала A",
      high: "высокий полюс",
      low: "низкий полюс",
      bands: [
        { from: 0, label: "низко", text: "низкий результат" },
        { from: 50, label: "средне", text: "средний результат" },
        { from: 80, label: "высоко", text: "высокий результат" },
      ],
    },
  ],
  questions: [
    { id: "q1", text: "Прямой пункт", scales: [{ scale: "a", reverse: false }] },
    { id: "q2", text: "Обратный пункт", scales: [{ scale: "a", reverse: true }] },
    { id: "q3", text: "Кризисный пункт", scales: [{ scale: "a", reverse: false }] },
  ],
  crisis: [{ question: "q3", minValue: 2 }],
  selfHelp: ["Совет один", "Совет два"],
});

describe("score", () => {
  it("суммирует прямые пункты и инвертирует обратные", () => {
    const result = score(fixture, { q1: 3, q2: 0, q3: 0 });
    // q1=3, q2 reverse: 0+3-0=3, q3=0 -> raw 6 из max 9
    expect(result.scales[0].raw).toBe(6);
    expect(result.scales[0].max).toBe(9);
    expect(result.scales[0].percent).toBe(67);
  });

  it("даёт 0% при минимуме и 100% при максимуме с учётом реверса", () => {
    expect(score(fixture, { q1: 0, q2: 3, q3: 0 }).scales[0].percent).toBe(0);
    expect(score(fixture, { q1: 3, q2: 0, q3: 3 }).scales[0].percent).toBe(100);
  });

  it("выбирает диапазон интерпретации по проценту", () => {
    expect(score(fixture, { q1: 0, q2: 3, q3: 0 }).scales[0].band.label).toBe("низко");
    expect(score(fixture, { q1: 3, q2: 0, q3: 0 }).scales[0].band.label).toBe("средне");
    expect(score(fixture, { q1: 3, q2: 0, q3: 3 }).scales[0].band.label).toBe("высоко");
  });

  it("детерминирован: одинаковый вход даёт идентичный выход", () => {
    const answers: Answers = { q1: 2, q2: 1, q3: 1 };
    expect(JSON.stringify(score(fixture, answers))).toBe(JSON.stringify(score(fixture, answers)));
  });

  it("не падает на пропущенных ответах", () => {
    const result = score(fixture, { q1: 3 });
    expect(result.scales[0].raw).toBe(3);
  });

  it("поднимает кризисный флаг только при достижении порога", () => {
    expect(score(fixture, { q3: 1 }).crisis).toBe(false);
    expect(score(fixture, { q3: 2 }).crisis).toBe(true);
    expect(score(fixture, { q3: 3 }).crisis).toBe(true);
  });
});

describe("кодирование результата в ссылку", () => {
  it("round-trip сохраняет ответы", () => {
    const answers: Answers = { q1: 3, q2: 1, q3: 0 };
    const token = encodeAnswers(fixture, answers);
    expect(decodeAnswers(fixture, token)).toEqual(answers);
  });

  it("отклоняет испорченный токен", () => {
    const token = encodeAnswers(fixture, { q1: 3, q2: 1, q3: 0 });
    const tampered = token.replace(/~(\w)/, "~2");
    expect(decodeAnswers(fixture, tampered)).toBeNull();
  });

  it("отклоняет токен другой версии методики", () => {
    const token = encodeAnswers(fixture, { q1: 1, q2: 1, q3: 1 });
    expect(decodeAnswers({ ...fixture, version: "2.0.0" }, token)).toBeNull();
  });

  it("отклоняет значение вне списка вариантов", () => {
    const token = encodeAnswers(fixture, { q1: 1, q2: 1, q3: 1 });
    const [version, payload] = token.split("~");
    const badPayload = "z" + payload.slice(1);
    expect(decodeAnswers(fixture, `${version}~${badPayload}~${token.split("~")[2]}`)).toBeNull();
  });

  it("сохраняет пропуски как отсутствующие ответы", () => {
    const token = encodeAnswers(fixture, { q1: 2 });
    expect(decodeAnswers(fixture, token)).toEqual({ q1: 2 });
  });
});
