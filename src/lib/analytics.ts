/**
 * Событийная таксономия воронки (docs/product/prd.md §5).
 *
 * Два правила, из которых следует всё остальное:
 * 1. В аналитику не уходит содержание ответов и результатов — только факт
 *    события и слаг методики. Иначе мы бы создали ровно те данные, которых
 *    сознательно не храним.
 * 2. Без согласия и без заданного счётчика модуль полностью инертен.
 */

export type AnalyticsEvent =
  | { name: "test_view"; test: string }
  | { name: "test_start"; test: string }
  | { name: "test_progress"; test: string; percent: number }
  | { name: "test_complete"; test: string }
  | { name: "result_view"; test: string }
  | { name: "crisis_shown"; test: string }
  | { name: "result_share"; test: string }
  | { name: "second_test_start"; test: string }
  | { name: "cta_click"; test: string; cluster: string; placement: string }
  | { name: "expert_cta_click"; placement: string }
  // Текст запроса не уходит: он свободный, и человек может набрать в нём что
  // угодно. Полезное здесь — доля поисков без результата, а не сами слова.
  | { name: "catalog_search"; found: boolean }
  | { name: "consent"; granted: boolean };

const CONSENT_KEY = "analytics-consent";
const SESSION_TESTS_KEY = "tests-started";

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

export function getCounterId(): number | null {
  const raw = process.env.NEXT_PUBLIC_METRIKA_ID;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function getConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "granted") return true;
    if (stored === "denied") return false;
    return null;
  } catch {
    return null;
  }
}

export function setConsent(granted: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    /* приватный режим — согласие не запоминаем, спросим снова */
  }
}

/** Отправка события. Молча ничего не делает без согласия или без счётчика. */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (getConsent() !== true) return;
  const id = getCounterId();
  if (!id || typeof window.ym !== "function") return;

  const { name, ...params } = event;
  window.ym(id, "reachGoal", name, params);
}

/**
 * Порядковый номер теста в сессии: второй и последующий — отдельное событие.
 * Глубина сессии показывает, работает ли перелинковка, и делает это лучше,
 * чем время на сайте.
 */
export function trackTestStart(test: string): void {
  let started: string[] = [];
  try {
    started = JSON.parse(sessionStorage.getItem(SESSION_TESTS_KEY) || "[]") as string[];
  } catch {
    started = [];
  }
  const isRepeat = started.length > 0 && !started.includes(test);
  if (!started.includes(test)) {
    started.push(test);
    try {
      sessionStorage.setItem(SESSION_TESTS_KEY, JSON.stringify(started));
    } catch {
      /* без хранилища просто не считаем глубину */
    }
  }
  track({ name: "test_start", test });
  if (isRepeat) track({ name: "second_test_start", test });
}
