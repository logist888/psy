"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import Icon from "@/components/Icon";

type Item = { slug: string; title: string; description: string; category: string; questions: number; minutes: number };

/**
 * Поиск по каталогу — на клиенте и без зависимостей: 90 методик умещаются в
 * разметку страницы, и отдельный запрос за ними не нужен. Пока поле пустое,
 * страница выглядит и индексируется ровно как раньше.
 */
export default function TestSearch({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const found = useMemo(() => {
    if (normalized.length < 2) return null;
    // Ищем по названию и описанию: человек набирает «отношения» или «стресс»,
    // а не точное название методики
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(normalized) || item.description.toLowerCase().includes(normalized)
    );
  }, [items, normalized]);

  return (
    <div className="search">
      <label className="small muted" htmlFor="test-search">
        <Icon name="search" className="icon-inline" />
        Поиск по названию и описанию
      </label>
      <input
        id="test-search"
        type="search"
        value={query}
        placeholder="стресс, отношения, характер…"
        autoComplete="off"
        onChange={(e) => setQuery(e.target.value)}
        onBlur={(e) => {
          const value = e.target.value.trim();
          if (value.length >= 2) track({ name: "catalog_search", found: (found?.length ?? 0) > 0 });
        }}
      />

      {found && (
        <div className="note" style={{ marginTop: 12 }}>
          {found.length === 0 ? (
            <p style={{ margin: 0 }}>
              Ничего не нашлось. Попробуйте слово попроще — «тревога», «работа», «общение» — или посмотрите{" "}
              <Link href="/constructs">разборы тем</Link>.
            </p>
          ) : (
            <>
              <p className="small muted" style={{ marginTop: 0 }}>
                Найдено: {found.length}
              </p>
              <ul className="clean" style={{ marginBottom: 0 }}>
                {found.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/tests/${item.slug}`}>{item.title}</Link>{" "}
                    <span className="muted small">
                      · {item.questions} утв., {item.minutes} мин
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
