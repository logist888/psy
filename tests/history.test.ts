import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { addToHistory, clearHistory, getHistory, getPrevious, formatSince } from "../src/lib/history";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  vi.stubGlobal("window", { localStorage: storage } as unknown as Window & typeof globalThis);
  vi.stubGlobal("localStorage", storage);
});

afterEach(() => vi.unstubAllGlobals());

describe("история прохождений", () => {
  it("пуста по умолчанию", () => {
    expect(getHistory()).toEqual([]);
  });

  it("отдаёт новые записи первыми", () => {
    addToHistory("burnout", "t1", 1000);
    addToHistory("stress", "t2", 3000);
    addToHistory("big-five", "t3", 2000);
    expect(getHistory().map((e) => e.slug)).toEqual(["stress", "big-five", "burnout"]);
  });

  it("не дублирует один и тот же результат при перезагрузке страницы", () => {
    addToHistory("burnout", "same", 1000);
    addToHistory("burnout", "same", 5000);
    expect(getHistory()).toHaveLength(1);
  });

  it("сохраняет повторное прохождение как отдельную запись", () => {
    addToHistory("burnout", "первый", 1000);
    addToHistory("burnout", "второй", 2000);
    expect(getHistory()).toHaveLength(2);
  });

  it("удаляется полностью по запросу", () => {
    addToHistory("burnout", "t1", 1000);
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it("переживает испорченное хранилище, не роняя страницу", () => {
    store.set("test-history", "{не json");
    expect(getHistory()).toEqual([]);
    store.set("test-history", JSON.stringify([{ slug: "ok", token: "t", at: 1 }, { мусор: true }]));
    expect(getHistory()).toHaveLength(1);
  });

  it("не хранит ничего, кроме слага, токена и времени", () => {
    addToHistory("burnout", "t1", 1000);
    expect(Object.keys(getHistory()[0]).sort()).toEqual(["at", "slug", "token"]);
  });
});

describe("предыдущее прохождение", () => {
  it("находит прошлый результат той же методики", () => {
    addToHistory("burnout", "старый", 1000);
    addToHistory("burnout", "новый", 2000);
    expect(getPrevious("burnout", "новый")?.token).toBe("старый");
  });

  it("не путает методики между собой", () => {
    addToHistory("stress", "чужой", 1000);
    expect(getPrevious("burnout", "новый")).toBeNull();
  });

  it("возвращает null, когда методика пройдена впервые", () => {
    addToHistory("burnout", "единственный", 1000);
    expect(getPrevious("burnout", "единственный")).toBeNull();
  });
});

describe("человеческая давность", () => {
  const now = new Date("2026-08-19T12:00:00Z").getTime();
  const daysAgo = (d: number) => now - d * 86_400_000;

  it.each([
    [0, "сегодня"],
    [1, "вчера"],
    [3, "3 дн. назад"],
    [10, "1 нед. назад"],
    [60, "2 мес. назад"],
    [400, "больше года назад"],
  ])("%i дней → %s", (days, expected) => {
    expect(formatSince(daysAgo(days), now)).toBe(expected);
  });
});
