import { describe, expect, it } from "vitest";
import { getAllTests } from "../src/lib/content";
import { score } from "../src/lib/engine/score";

/**
 * Кризисный контур. Опасность здесь не в том, что правило сработает лишний раз,
 * а в том, что методика с пунктом про отчаяние или ненужность уедет в публикацию
 * без него: человек ответит «точно про меня» и увидит только процент по шкале.
 * Партии методик собираются автоматически, поэтому страховка нужна на CI.
 */

const tests = getAllTests();

/**
 * Пункты, в которых человек прямо сообщает о дистрессе. Список намеренно узкий:
 * это не «высокий балл по тревожности», а буквальные формулировки, при которых
 * уместно показать контакты помощи.
 */
const DISTRESS =
  /отчаян|бесполезн|никому.*не нужен|не справля|ни на что не год|безнадёж|безнадеж|не вижу выхода|не хочется жить|дальше ничего не изменится|тону в собственных/i;

describe("кризисный контур", () => {
  it("методика с пунктом про дистресс имеет кризисное правило на этот пункт", () => {
    const gaps: string[] = [];
    for (const test of tests) {
      const covered = new Set(test.crisis.map((rule) => rule.question));
      for (const q of test.questions) {
        if (DISTRESS.test(q.text) && !covered.has(q.id)) gaps.push(`${test.slug}.${q.id}: ${q.text}`);
      }
    }
    expect(gaps, `пункт про дистресс без кризисного правила:\n${gaps.join("\n")}`).toEqual([]);
  });

  it("порог правила — верхняя точка шкалы ответов", () => {
    // Ниже верхней точки правило начнёт срабатывать на «скорее про меня»,
    // а ложная тревога обесценивает блок помощи для тех, кому он нужен
    for (const test of tests) {
      const max = Math.max(...test.options.map((o) => o.value));
      for (const rule of test.crisis) {
        expect(rule.minValue, `${test.slug}.${rule.question}: порог ${rule.minValue} ниже максимума ${max}`).toBe(max);
      }
    }
  });

  it("правило ссылается на существующий вопрос", () => {
    for (const test of tests) {
      const ids = new Set(test.questions.map((q) => q.id));
      for (const rule of test.crisis) {
        expect(ids.has(rule.question), `${test.slug}: правило ссылается на ${rule.question}, которого нет`).toBe(true);
      }
    }
  });

  it("одного максимального ответа достаточно, остальные ответы не важны", () => {
    // Флаг должен подниматься именно от пункта-триггера, а не от общего балла:
    // человек, у которого всё остальное в порядке, тоже должен увидеть помощь
    for (const test of tests.filter((t) => t.crisis.length > 0)) {
      const min = Math.min(...test.options.map((o) => o.value));
      for (const rule of test.crisis) {
        const answers = Object.fromEntries(test.questions.map((q) => [q.id, min]));
        answers[rule.question] = rule.minValue;
        expect(
          score(test, answers).crisis,
          `${test.slug}: ответ ${rule.minValue} на ${rule.question} не поднял флаг`
        ).toBe(true);
      }
    }
  });
});
