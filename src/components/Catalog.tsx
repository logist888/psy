"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Test } from "@/lib/engine/schema";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { Icon, CATEGORY_META } from "@/components/icons";

export interface CatalogItem {
  slug: string;
  title: string;
  description: string;
  category: Test["category"];
  minutes: number;
  questions: number;
}

type Cat = Test["category"] | "all";
type Duration = "any" | "short" | "medium" | "long";
type Sort = "alpha" | "short" | "long";

const DURATIONS: { id: Duration; label: string }[] = [
  { id: "any", label: "Любая" },
  { id: "short", label: "Короткие · до 12 утверждений" },
  { id: "medium", label: "Средние · 13–18" },
  { id: "long", label: "Подробные · 19 и больше" },
];

const PAGE_SIZE = 6;

function inDuration(q: number, d: Duration): boolean {
  if (d === "short") return q <= 12;
  if (d === "medium") return q >= 13 && q <= 18;
  if (d === "long") return q >= 19;
  return true;
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export default function Catalog({ items }: { items: CatalogItem[] }) {
  const params = useSearchParams();
  const initial = params.get("category");
  const initCat: Cat = CATEGORY_ORDER.includes(initial as Test["category"]) ? (initial as Cat) : "all";

  const [cat, setCat] = useState<Cat>(initCat);
  const [duration, setDuration] = useState<Duration>("any");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("alpha");
  const [page, setPage] = useState(0);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const it of items) c[it.category] = (c[it.category] ?? 0) + 1;
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = items.filter(
      (it) =>
        (cat === "all" || it.category === cat) &&
        inDuration(it.questions, duration) &&
        (q === "" || it.title.toLowerCase().includes(q) || it.description.toLowerCase().includes(q))
    );
    out.sort((a, b) => {
      if (sort === "short") return a.questions - b.questions;
      if (sort === "long") return b.questions - a.questions;
      return a.title.localeCompare(b.title, "ru");
    });
    return out;
  }, [items, cat, duration, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const shown = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const reset = () => setPage(0);

  return (
    <div className="catalog">
      <aside className="filters">
        <div className="filter-box">
          <h4>Категории</h4>
          <div className="filter-list">
            <button className={`filter-item${cat === "all" ? " active" : ""}`} onClick={() => { setCat("all"); reset(); }}>
              <Icon name="grid" size={18} /> Все тесты <span className="count">{counts.all}</span>
            </button>
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                className={`filter-item ${CATEGORY_META[c].className}${cat === c ? " active" : ""}`}
                onClick={() => { setCat(c); reset(); }}
              >
                <Icon name={CATEGORY_META[c].icon} size={18} /> {CATEGORIES[c].title}
                <span className="count">{counts[c] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-box">
          <h4>Длительность</h4>
          {DURATIONS.map((d) => (
            <label className="radio-row" key={d.id}>
              <input type="radio" name="duration" checked={duration === d.id} onChange={() => { setDuration(d.id); reset(); }} />
              {d.label}
            </label>
          ))}
        </div>

        <div className="filter-box cat-personality" style={{ background: "var(--surface-soft)" }}>
          <span className="ibubble sm" style={{ marginBottom: 10 }}><Icon name="shield" size={22} /></span>
          <b style={{ display: "block", marginBottom: 4 }}>Анонимно и безопасно</b>
          <span className="small muted">Ответы не хранятся на сервере. Результат живёт в ссылке, которую получаете только вы.</span>
        </div>
      </aside>

      <div className="catalog-main">
        <div className="cat-head">
          <h1>Тесты</h1>
          <p className="lead">
            {items.length} {plural(items.length, "методика", "методики", "методик")}. У каждой — научный
            паспорт: что измеряет, откуда взята и чего не показывает.
          </p>
        </div>

        <div className="toolbar">
          <div className="search">
            <Icon name="search" size={18} />
            <input
              type="search"
              placeholder="Поиск тестов…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); reset(); }}
            />
          </div>
          <div className="select">
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="alpha">По алфавиту</option>
              <option value="short">Сначала короткие</option>
              <option value="long">Сначала подробные</option>
            </select>
            <Icon name="chevron" size={16} />
          </div>
        </div>

        <div className="pills">
          <button className={`pill${cat === "all" ? " active" : ""}`} onClick={() => { setCat("all"); reset(); }}>Все</button>
          {CATEGORY_ORDER.map((c) => (
            <button key={c} className={`pill${cat === c ? " active" : ""}`} onClick={() => { setCat(c); reset(); }}>
              <Icon name={CATEGORY_META[c].icon} size={16} /> {CATEGORIES[c].title}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="card empty">По этим условиям тестов не нашлось. Снимите часть фильтров.</div>
        ) : (
          <div className="test-list">
            {shown.map((it) => {
              const view = CATEGORY_META[it.category];
              return (
                <Link key={it.slug} href={`/tests/${it.slug}`} className={`card link test-card ${view.className}`}>
                  <span className="thumb"><Icon name={view.icon} size={46} /></span>
                  <div className="body">
                    <h3>{it.title}</h3>
                    <p>{it.description}</p>
                    <div className="tags"><span className="chip cat">{CATEGORIES[it.category].title}</span></div>
                  </div>
                  <div className="aside">
                    <div className="facts">
                      <span className="f"><Icon name="clock" size={15} /> ≈ {it.minutes} мин</span>
                      <span className="f"><Icon name="list" size={15} /> {it.questions} {plural(it.questions, "утверждение", "утверждения", "утверждений")}</span>
                    </div>
                    <span className="btn sm">Пройти тест</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="pager">
            <button className="pg" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Назад">
              <Icon name="chevron-left" size={16} />
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={`pg${i === safePage ? " active" : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className="pg" disabled={safePage === pages - 1} onClick={() => setPage(safePage + 1)} aria-label="Дальше">
              <Icon name="chevron-right" size={16} />
            </button>
            <span className="n">
              Показано {safePage * PAGE_SIZE + 1}–{Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} из {filtered.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
