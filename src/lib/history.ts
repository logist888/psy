/**
 * История пройденных тестов — только в браузере пользователя.
 *
 * Храним слаг, токен результата и время. Токен — это то же самое, что ссылка
 * на результат: он уже содержит ответы и никуда не отправляется. То есть
 * история не создаёт новых данных о человеке, а лишь избавляет от ручного
 * хранения ссылок. Сервер о ней по-прежнему ничего не знает.
 */

const KEY = "test-history";
const LIMIT = 50;

export interface HistoryEntry {
  slug: string;
  token: string;
  at: number;
}

function read(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as HistoryEntry).slug === "string" &&
        typeof (e as HistoryEntry).token === "string" &&
        typeof (e as HistoryEntry).at === "number"
    );
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, LIMIT)));
  } catch {
    /* приватный режим или переполнение — история просто не сохранится */
  }
}

/** Новее — первым. Повторное прохождение той же методики добавляется отдельной записью. */
export function getHistory(): HistoryEntry[] {
  return read().sort((a, b) => b.at - a.at);
}

export function addToHistory(slug: string, token: string, at: number): void {
  const entries = read();
  // Тот же результат по той же ссылке не дублируем при перезагрузке страницы.
  if (entries.some((e) => e.slug === slug && e.token === token)) return;
  write([{ slug, token, at }, ...entries]);
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* нечего чистить */
  }
}

/** Предыдущее прохождение той же методики — для показа динамики. */
export function getPrevious(slug: string, token: string): HistoryEntry | null {
  const sameTest = getHistory().filter((e) => e.slug === slug && e.token !== token);
  return sameTest[0] ?? null;
}

export function formatSince(at: number, now: number): string {
  const days = Math.floor((now - at) / 86_400_000);
  if (days < 1) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} нед. назад`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months} мес. назад` : "больше года назад";
}
