"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Test } from "@/lib/engine/schema";
import { clearHistory, formatSince, getHistory, type HistoryEntry } from "@/lib/history";

/**
 * История живёт в браузере, поэтому рендерится только на клиенте:
 * на сервере её попросту не существует.
 */
export default function MyTests({ tests }: { tests: Pick<Test, "slug" | "title" | "minutes">[] }) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setEntries(getHistory());
    setNow(Date.now());
  }, []);

  if (entries === null) return <p className="muted">Загружаем историю…</p>;

  if (entries.length === 0) {
    return (
      <>
        <p className="lead">Здесь появятся тесты, которые вы пройдёте.</p>
        <p>
          История хранится только в вашем браузере и никуда не отправляется. Если очистить данные сайта или
          открыть его в другом браузере, список будет пустым — это не сбой, а следствие того, что мы не заводим
          аккаунтов.
        </p>
        <p>
          <Link href="/" className="btn">
            Выбрать тест
          </Link>
        </p>
      </>
    );
  }

  const byTest = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const list = byTest.get(entry.slug) ?? [];
    list.push(entry);
    byTest.set(entry.slug, list);
  }

  return (
    <>
      <p className="lead">
        {entries.length} {plural(entries.length, "прохождение", "прохождения", "прохождений")} — история хранится
        только в вашем браузере.
      </p>

      {[...byTest.entries()].map(([slug, list]) => {
        const test = tests.find((t) => t.slug === slug);
        if (!test) return null;
        return (
          <section key={slug}>
            <h2>{test.title}</h2>
            <ul className="clean">
              {list.map((entry) => (
                <li key={entry.token}>
                  <Link href={`/result/${slug}?r=${encodeURIComponent(entry.token)}`}>Результат</Link>{" "}
                  <span className="muted small">· {formatSince(entry.at, now)}</span>
                </li>
              ))}
            </ul>
            {list.length === 1 && (
              <p className="small muted">
                <Link href={`/tests/${slug}/run`}>Пройти ещё раз</Link> — второй замер покажет, изменилось ли
                что-то.
              </p>
            )}
          </section>
        );
      })}

      <p style={{ marginTop: 28 }}>
        <button
          className="btn secondary"
          onClick={() => {
            clearHistory();
            setEntries([]);
          }}
        >
          Очистить историю
        </button>
      </p>
    </>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
