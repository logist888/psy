import Link from "next/link";
import type { Metadata } from "next";
import { getAllTests, CATEGORIES, CATEGORY_PAGES, COLLECTIONS } from "@/lib/content";
import type { Test } from "@/lib/engine/schema";
import { SITE } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import TestSearch from "@/components/TestSearch";
import Icon, { type IconName } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Все психологические тесты",
  description:
    "Полный каталог бесплатных психологических тестов с открытой методологией: личность, состояние, отношения, карьера.",
  alternates: { canonical: `${SITE.url}/tests` },
};

const CATEGORY_ICON: Record<Test["category"], IconName> = {
  personality: "personality",
  wellbeing: "wellbeing",
  relationships: "relationships",
  career: "career",
  values: "values",
};

export default function AllTestsPage() {
  const tests = getAllTests();
  const byCategory = tests.reduce<Record<string, Test[]>>((acc, test) => {
    (acc[test.category] ||= []).push(test);
    return acc;
  }, {});

  return (
    <>
      <Breadcrumbs items={[{ name: "Главная", href: "/" }, { name: "Все тесты", href: "/tests" }]} />
      <h1>Все тесты</h1>
      <p className="lead">
        {tests.length} методик. У каждой указано, что она измеряет, откуда взята и чего не показывает — это на
        странице научного паспорта.
      </p>

      <TestSearch
        items={tests.map((t) => ({
          slug: t.slug,
          title: t.title,
          description: t.description,
          category: t.category,
          questions: t.questions.length,
          minutes: t.minutes,
        }))}
      />

      <div className="note">
        <h2 className="with-icon" style={{ marginTop: 0 }}>
          <Icon name="spark" />
          Подборки
        </h2>
        <ul className="clean" style={{ marginBottom: 0 }}>
          {COLLECTIONS.map((c) => (
            <li key={c.slug}>
              <Link href={`/podborki/${c.slug}`}>{c.h1}</Link>
            </li>
          ))}
        </ul>
      </div>

      {Object.entries(byCategory).map(([category, items]) => (
        <section key={category}>
          <h2 className="with-icon">
            <Icon name={CATEGORY_ICON[category as Test["category"]]} />
            <Link href={`/kategorii/${CATEGORY_PAGES[category as Test["category"]].slug}`}>
              {CATEGORIES[category as Test["category"]].title}
            </Link>
          </h2>
          <p className="muted small">{CATEGORIES[category as Test["category"]].description}</p>
          <ul className="clean">
            {items.map((test) => (
              <li key={test.slug}>
                <Link href={`/tests/${test.slug}`}>{test.title}</Link>{" "}
                <span className="muted small">
                  · {test.questions.length} утв., {test.minutes} мин
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
