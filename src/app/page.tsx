import Link from "next/link";
import { getAllTests, CATEGORIES } from "@/lib/content";
import type { Test } from "@/lib/engine/schema";
import { Icon, CATEGORY_META } from "@/components/icons";

const CATEGORY_ORDER: Test["category"][] = ["personality", "wellbeing", "relationships", "career", "values"];

const TRUST = [
  { icon: "shield", cls: "cat-personality", title: "Анонимно и безопасно", text: "Результаты тестов известны только вам." },
  { icon: "user", cls: "cat-wellbeing", title: "Данные не собираются", text: "Без регистрации: не спрашиваем имя и не звоним." },
  { icon: "link", cls: "cat-relationships", title: "Ответы не хранятся", text: "Результат кодируется в ссылку — она только у вас." },
  { icon: "reliability", cls: "cat-values", title: "Научный подход", text: "Открытые методики с научными паспортами." },
] as const;

export default function HomePage() {
  const tests = getAllTests();
  const counts = tests.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">О возможностях</span>
          <h1>
            Глубже понять себя —<span className="accent">принять лучшие решения</span>
          </h1>
          <p className="lead">
            Тесты основаны на научных моделях психологии и помогают увидеть то, что обычно остаётся
            незаметным. У каждой методики — открытый научный паспорт: что измеряет, откуда взята и чего
            не показывает.
          </p>
          <div className="hero-actions">
            <Link href="/tests" className="btn lg">Выбрать тест <Icon name="arrow" size={18} /></Link>
            <Link href="/methods" className="btn secondary lg">Как устроены методики</Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orb" />
          <span className="hero-spark" style={{ width: 8, height: 8, top: "24%", left: "30%" }} />
          <span className="hero-spark" style={{ width: 5, height: 5, top: "62%", left: "26%" }} />
          <span className="hero-spark" style={{ width: 6, height: 6, top: "34%", right: "24%" }} />
          <div className="float-card tl cat-personality">
            <div className="fc-label">Личность</div>
            <div className="donut" style={{ "--p": 68, "--c": "var(--cat)" } as React.CSSProperties} />
          </div>
          <div className="float-card br cat-values">
            <div className="fc-label">Ценности</div>
            <div className="mini-bars">
              <i className="on" style={{ width: "80%" }} />
              <i style={{ width: "55%" }} />
              <i className="on" style={{ width: "68%" }} />
            </div>
          </div>
        </div>
      </section>

      <section className="cat-strip">
        {CATEGORY_ORDER.map((cat, i) => {
          const meta = CATEGORIES[cat];
          const view = CATEGORY_META[cat];
          return (
            <Link key={cat} href={`/tests?category=${cat}`} className={`card link cat-card ${view.className}`}>
              <span className="ibubble"><Icon name={view.icon} size={28} /></span>
              <h3>{meta.title}</h3>
              <p>{meta.description}</p>
              <div className="cat-dots">
                {[0, 1, 2, 3, 4].map((d) => <i key={d} className={d === i ? "on" : ""} />)}
              </div>
            </Link>
          );
        })}
      </section>

      <div className="trust">
        {TRUST.map((t) => (
          <div className={`item ${t.cls}`} key={t.title}>
            <span className="ibubble"><Icon name={t.icon} size={20} /></span>
            <div>
              <b>{t.title}</b>
              <span>{t.text}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-head">
        <h2>Популярные тесты</h2>
        <Link href="/tests">Все {tests.length} тестов <Icon name="arrow" size={16} /></Link>
      </div>
      <div className="test-list">
        {tests.slice(0, 4).map((test) => {
          const view = CATEGORY_META[test.category];
          return (
            <Link key={test.slug} href={`/tests/${test.slug}`} className={`card link test-card ${view.className}`}>
              <span className="thumb"><Icon name={view.icon} size={46} /></span>
              <div className="body">
                <h3>{test.title}</h3>
                <p>{test.description}</p>
                <div className="tags">
                  <span className="chip cat">{CATEGORIES[test.category].title}</span>
                </div>
              </div>
              <div className="aside">
                <div className="facts">
                  <span className="f"><Icon name="clock" size={15} /> ≈ {test.minutes} мин</span>
                  <span className="f"><Icon name="list" size={15} /> {test.questions.length} утверждений</span>
                </div>
                <span className="btn sm">Пройти тест</span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="muted small" style={{ marginTop: 22, textAlign: "center" }}>
        Доступно {tests.length} методик. Ответы не сохраняются на сервере — результат живёт только в вашей ссылке.
      </p>
    </>
  );
}
