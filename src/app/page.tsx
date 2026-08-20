import Link from "next/link";
import { getAllTests, getAllConstructs, CATEGORIES, CATEGORY_PAGES } from "@/lib/content";
import type { Test } from "@/lib/engine/schema";
import Icon, { type IconName } from "@/components/Icon";

/** Глиф раздела: он и в каталоге, и на странице раздела — узнаётся один и тот же. */
const CATEGORY_ICON: Record<Test["category"], IconName> = {
  personality: "personality",
  wellbeing: "wellbeing",
  relationships: "relationships",
  career: "career",
  values: "values",
};

export default function HomePage() {
  const tests = getAllTests();
  const constructs = getAllConstructs();
  const byCategory = tests.reduce<Record<string, Test[]>>((acc, test) => {
    (acc[test.category] ||= []).push(test);
    return acc;
  }, {});

  return (
    <>
      <h1>Психологические тесты с открытой методологией</h1>
      <p className="lead">
        У каждого теста написано, что он измеряет, откуда взят и чего не показывает. Бесплатно, анонимно,
        без регистрации — мы не спрашиваем имя и не звоним.
      </p>

      {Object.entries(byCategory).map(([category, items]) => {
        const meta = CATEGORIES[category as Test["category"]];
        return (
          <section key={category}>
            <h2 className="with-icon">
              <Icon name={CATEGORY_ICON[category as Test["category"]]} />
              <Link href={`/kategorii/${CATEGORY_PAGES[category as Test["category"]].slug}`}>{meta.title}</Link>
            </h2>
            <div className="grid">
              {items.slice(0, 6).map((test) => (
                <Link key={test.slug} href={`/tests/${test.slug}`} className="card">
                  <h3>{test.title}</h3>
                  <p className="small muted meta" style={{ margin: 0 }}>
                    <span>
                      <Icon name="list" className="icon-inline" />
                      {test.questions.length} утверждений
                    </span>
                    <span>
                      <Icon name="clock" className="icon-inline" />
                      {test.minutes} мин
                    </span>
                  </p>
                </Link>
              ))}
            </div>
            {items.length > 6 && (
              <p className="small">
                <Link href={`/kategorii/${CATEGORY_PAGES[category as Test["category"]].slug}`}>
                  Ещё {items.length - 6} в этом разделе
                </Link>
              </p>
            )}
          </section>
        );
      })}

      <p>
        <Link href="/tests" className="btn secondary">
          Все {tests.length} тестов
        </Link>
      </p>

      {constructs.length > 0 && (
        <section>
          <h2 className="with-icon">
            <Icon name="topic" />
            Разборы тем
          </h2>
          <p className="muted">
            Что стоит за состоянием: как устроено, чем отличается от похожего, что помогает и когда пора к
            специалисту.
          </p>
          <div className="grid">
            {constructs.map((c) => (
              <Link key={c.slug} href={`/constructs/${c.slug}`} className="card">
                <h3>{c.title}</h3>
                <p className="small muted" style={{ margin: 0 }}>
                  {c.tests.length} теста по теме
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2>Почему тестам здесь можно доверять больше, чем среднему сайту</h2>
        <ul className="clean">
          <li>
            <strong>Видно происхождение.</strong> Для каждой методики указано, кто автор, на чём она основана и на
            каком правовом основании мы её используем.
          </li>
          <li>
            <strong>Честно про ограничения.</strong> Мы пишем, чего тест не может — это важнее списка того, что он
            «определяет».
          </li>
          <li>
            <strong>Ничего не сохраняем.</strong> Ответы не хранятся на сервере: результат живёт в ссылке, которую
            получаете только вы.
          </li>
          <li>
            <strong>Без диагнозов.</strong> Ни один онлайн-опросник не ставит диагноз — и мы этого не делаем.
          </li>
        </ul>
      </section>
    </>
  );
}
