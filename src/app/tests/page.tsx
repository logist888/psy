import Link from "next/link";
import type { Metadata } from "next";
import { getAllTests, CATEGORIES } from "@/lib/content";
import type { Test } from "@/lib/engine/schema";
import { SITE } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Все психологические тесты",
  description:
    "Полный каталог бесплатных психологических тестов с открытой методологией: личность, состояние, отношения, карьера.",
  alternates: { canonical: `${SITE.url}/tests` },
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

      {Object.entries(byCategory).map(([category, items]) => (
        <section key={category}>
          <h2>{CATEGORIES[category as Test["category"]].title}</h2>
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
