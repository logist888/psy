"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Test } from "@/lib/engine/schema";
import Icon, { type IconName } from "@/components/Icon";

export interface CatalogItem {
  slug: string;
  title: string;
  description: string;
  category: Test["category"];
  minutes: number;
  questions: number;
}
export interface CatalogCategory {
  key: Test["category"];
  title: string;
  count: number;
  slug: string;
}

const CATEGORY_ICON: Record<Test["category"], IconName> = {
  personality: "personality",
  wellbeing: "wellbeing",
  relationships: "relationships",
  career: "career",
  values: "values",
};
const CATEGORY_CLASS: Record<Test["category"], string> = {
  personality: "cat-personality",
  wellbeing: "cat-wellbeing",
  relationships: "cat-relationships",
  career: "cat-career",
  values: "cat-values",
};

type Cat = Test["category"] | "all";
type Duration = "any" | "short" | "medium" | "long";
type Sort = "alpha" | "short" | "long";

const DURATIONS: { id: Duration; label: string }[] = [
  { id: "any", label: "Любая" },
  { id: "short", label: "Короткие · до 12 утверждений" },
  { id: "medium", label: "Средние · 13–18" },
  { id: "long", label: "Подробные · 19 и больше" },
];
const PAGE_SIZE = 8;

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

export default function Catalog({
  items,
  categories,
}: {
  items: CatalogItem[];
  categories: CatalogCategory[];
}) {
  const params = useSearchParams();
  const initial = params.get("category");
  const known = categories.map((c) => c.key);
  const initCat: Cat = known.includes(initial as Test["category"]) ? (initial as Cat) : "all";

  const [cat, setCat] = useState<Cat>(initCat);
  const [duration, setDuration] = useState<Duration>("any");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("alpha");
  const [page, setPage] = useState(0);

  const titleOf = (c: Test["category"]) => categories.find((x) => x.key === c)?.title ?? "";

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
          <button className={`filter-item${cat === "all" ? " active" : ""}`} onClick={() => { setCat("all"); reset(); }}>
            <Icon name="grid" size={18} /> Все тесты <span className="count">{items.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              className={`filter-item ${CATEGORY_CLASS[c.key]}${cat === c.key ? " active" : ""}`}
              onClick={() => { setCat(c.key); reset(); }}
            >
              <Icon name={CATEGORY_ICON[c.key]} size={18} /> {c.title}
              <span className="count">{c.count}</span>
            </button>
          ))}
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

        <div className="filter-box">
          <span className="ibubble sm cat-personality" style={{ marginBottom: 10 }}><Icon name="shield" size={22} /></span>
          <b style={{ display: "block", marginBottom: 4 }}>Анонимно и безопасно</b>
          <span className="small muted">Ответы не хранятся на сервере. Результат живёт в ссылке, которую получаете только вы.</span>
        </div>
      </aside>

      <div className="catalog-main">
        <div className="toolbar">
          <div className="searchbox">
            <Icon name="search" size={18} />
            <input type="search" placeholder="Поиск тестов…" value={query} onChange={(e) => { setQuery(e.target.value); reset(); }} />
          </div>
          <div className="selectbox">
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Сортировка">
              <option value="alpha">По алфавиту</option>
              <option value="short">Сначала короткие</option>
              <option value="long">Сначала подробные</option>
            </select>
            <Icon name="chevron" size={16} />
          </div>
        </div>

        <div className="pills">
          <button className={`pill${cat === "all" ? " active" : ""}`} onClick={() => { setCat("all"); reset(); }}>Все</button>
          {categories.map((c) => (
            <button key={c.key} className={`pill${cat === c.key ? " active" : ""}`} onClick={() => { setCat(c.key); reset(); }}>
              <Icon name={CATEGORY_ICON[c.key]} size={16} /> {c.title}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="card empty">По этим условиям тестов не нашлось. Снимите часть фильтров.</div>
        ) : (
          <div className="test-list">
            {shown.map((it) => (
              <Link key={it.slug} href={`/tests/${it.slug}`} className={`card link test-card ${CATEGORY_CLASS[it.category]}`}>
                <span className="thumb"><Icon name={CATEGORY_ICON[it.category]} size={44} /></span>
                <div className="body">
                  <h3>{it.title}</h3>
                  <p>{it.description}</p>
                  <div className="tags"><span className="chip cat">{titleOf(it.category)}</span></div>
                </div>
                <div className="aside">
                  <div className="facts">
                    <span className="f"><Icon name="clock" className="icon-inline" size={15} /> ≈ {it.minutes} мин</span>
                    <span className="f"><Icon name="list" className="icon-inline" size={15} /> {it.questions} {plural(it.questions, "утверждение", "утверждения", "утверждений")}</span>
                  </div>
                  <span className="btn sm">Пройти тест</span>
                </div>
              </Link>
            ))}
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
            <span className="n">Показано {safePage * PAGE_SIZE + 1}–{Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} из {filtered.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
