import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { getConsent, setConsent, track, getCounterId } from "../src/lib/analytics";

/**
 * Аналитика обязана быть безвредной по умолчанию: без согласия и без счётчика
 * ничего не отправляется, а в отправленное никогда не попадают ответы.
 */

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
  } as unknown as Window & typeof globalThis);
  vi.stubGlobal("localStorage", (globalThis as unknown as { window: Window }).window.localStorage);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.NEXT_PUBLIC_METRIKA_ID;
});

describe("согласие", () => {
  it("по умолчанию не выдано", () => {
    expect(getConsent()).toBeNull();
  });

  it("сохраняется и читается в обе стороны", () => {
    setConsent(true);
    expect(getConsent()).toBe(true);
    setConsent(false);
    expect(getConsent()).toBe(false);
  });
});

describe("счётчик", () => {
  it("отсутствует, пока не задан идентификатор", () => {
    expect(getCounterId()).toBeNull();
  });

  it("не принимает мусорное значение", () => {
    process.env.NEXT_PUBLIC_METRIKA_ID = "не-число";
    expect(getCounterId()).toBeNull();
    process.env.NEXT_PUBLIC_METRIKA_ID = "0";
    expect(getCounterId()).toBeNull();
  });

  it("читает корректный идентификатор", () => {
    process.env.NEXT_PUBLIC_METRIKA_ID = "12345678";
    expect(getCounterId()).toBe(12345678);
  });
});

describe("отправка событий", () => {
  it("молчит без согласия, даже если счётчик задан", () => {
    process.env.NEXT_PUBLIC_METRIKA_ID = "12345678";
    const ym = vi.fn();
    (globalThis as unknown as { window: Window }).window.ym = ym;
    track({ name: "test_start", test: "burnout" });
    expect(ym).not.toHaveBeenCalled();
  });

  it("молчит с согласием, но без счётчика", () => {
    setConsent(true);
    const ym = vi.fn();
    (globalThis as unknown as { window: Window }).window.ym = ym;
    track({ name: "test_start", test: "burnout" });
    expect(ym).not.toHaveBeenCalled();
  });

  it("отправляет цель и слаг, когда есть и согласие, и счётчик", () => {
    process.env.NEXT_PUBLIC_METRIKA_ID = "12345678";
    setConsent(true);
    const ym = vi.fn();
    (globalThis as unknown as { window: Window }).window.ym = ym;
    track({ name: "cta_click", test: "burnout", cluster: "burnout", placement: "result" });
    expect(ym).toHaveBeenCalledWith(12345678, "reachGoal", "cta_click", {
      test: "burnout",
      cluster: "burnout",
      placement: "result",
    });
  });

  it("в параметры события не попадают ответы и баллы", () => {
    process.env.NEXT_PUBLIC_METRIKA_ID = "12345678";
    setConsent(true);
    const ym = vi.fn();
    (globalThis as unknown as { window: Window }).window.ym = ym;
    track({ name: "result_view", test: "stress" });
    const params = ym.mock.calls[0][3] as Record<string, unknown>;
    for (const key of ["answers", "scores", "raw", "percent", "token"]) {
      expect(params, `в событие просочилось поле ${key}`).not.toHaveProperty(key);
    }
    expect(Object.keys(params)).toEqual(["test"]);
  });
});
