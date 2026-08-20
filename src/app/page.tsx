import Link from "next/link";
import { getAllTests, getAllConstructs, CATEGORIES, CATEGORY_PAGES } from "@/lib/content";
import type { Test } from "@/lib/engine/schema";
import Icon, { type IconName } from "@/components/Icon";

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
const CATEGORY_ORDER: Test["category"][] = ["personality", "wellbeing", "relationships", "career", "values"];

const TRUST = [
  { icon: "shield" as IconName, cls: "cat-personality", title: "Анонимно и безопасно", text: "Результаты тестов известны только вам." },
  { icon: "experts" as IconName, cls: "cat-wellbeing", title: "Данные не собираются", text: "Без регистрации: не спрашиваем имя и не звоним." },
  { icon: "link" as IconName, cls: "cat-relationships", title: "Ответы не хранятся", text: "Результат кодируется в ссылку — она только у вас." },
  { icon: "scales" as IconName, cls: "cat-values", title: "Научный подход", text: "Открытые методики с научными паспортами." },
];

export default function HomePage() {
  const tests = getAllTests();
  const constructs = getAllConstructs();
  const counts = tests.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <section className="home-hero">
        <div>
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

        <div className="hero-visual">
          <img
            className="hero-img"
            src="/hero-brain.png"
            width={690}
            height={440}
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </section>

      <section className="cat-strip">
        {CATEGORY_ORDER.map((cat, i) => (
          <Link
            key={cat}
            href={`/kategorii/${CATEGORY_PAGES[cat].slug}`}
            className={`card link cat-card ${CATEGORY_CLASS[cat]}`}
          >
            <span className="ibubble"><Icon name={CATEGORY_ICON[cat]} size={28} /></span>
            <h3>{CATEGORIES[cat].title}</h3>
            <p>{CATEGORIES[cat].description}</p>
            <div className="cat-dots">
              {[0, 1, 2, 3, 4].map((d) => <i key={d} className={d === i ? "on" : ""} />)}
            </div>
          </Link>
        ))}
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
        {tests.slice(0, 4).map((test) => (
          <Link key={test.slug} href={`/tests/${test.slug}`} className={`card link test-card ${CATEGORY_CLASS[test.category]}`}>
            <span className="thumb"><Icon name={CATEGORY_ICON[test.category]} size={44} /></span>
            <div className="body">
              <h3>{test.title}</h3>
              <p>{test.description}</p>
              <div className="tags"><span className="chip cat">{CATEGORIES[test.category].title}</span></div>
            </div>
            <div className="aside">
              <div className="facts">
                <span className="f"><Icon name="clock" className="icon-inline" size={15} /> ≈ {test.minutes} мин</span>
                <span className="f"><Icon name="list" className="icon-inline" size={15} /> {test.questions.length} утв.</span>
              </div>
              <span className="btn sm">Пройти тест</span>
            </div>
          </Link>
        ))}
      </div>

      {constructs.length > 0 && (
        <>
          <div className="section-head">
            <h2>Разборы тем</h2>
            <Link href="/constructs">Все темы <Icon name="arrow" size={16} /></Link>
          </div>
          <p className="muted" style={{ marginTop: -6 }}>
            Что стоит за состоянием: как устроено, чем отличается от похожего, что помогает и когда пора к
            специалисту.
          </p>
          <div className="grid" style={{ marginTop: 16 }}>
            {constructs.slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/constructs/${c.slug}`} className="card link">
                <h3>{c.title}</h3>
                <p className="small muted" style={{ margin: 0 }}>{c.tests.length} теста по теме</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <section>
        <h2>Почему тестам здесь можно доверять больше, чем среднему сайту</h2>
        <ul className="clean">
          <li><strong>Видно происхождение.</strong> Для каждой методики указано, кто автор, на чём она основана и на каком правовом основании мы её используем.</li>
          <li><strong>Честно про ограничения.</strong> Мы пишем, чего тест не может — это важнее списка того, что он «определяет».</li>
          <li><strong>Ничего не сохраняем.</strong> Ответы не хранятся на сервере: результат живёт в ссылке, которую получаете только вы.</li>
          <li><strong>Без диагнозов.</strong> Ни один онлайн-опросник не ставит диагноз — и мы этого не делаем.</li>
        </ul>
      </section>
    </>
  );
}
