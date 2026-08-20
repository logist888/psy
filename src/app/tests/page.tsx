import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllTests, CATEGORIES, CATEGORY_PAGES, COLLECTIONS } from "@/lib/content";
import type { Test } from "@/lib/engine/schema";
import { SITE } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import Catalog, { type CatalogItem, type CatalogCategory } from "@/components/Catalog";

export const metadata: Metadata = {
  title: "Все психологические тесты",
  description:
    "Полный каталог бесплатных психологических тестов с открытой методологией: личность, состояние, отношения, карьера. Фильтры по темам и длительности.",
  alternates: { canonical: `${SITE.url}/tests` },
};

const CATEGORY_ORDER: Test["category"][] = ["personality", "wellbeing", "relationships", "career", "values"];

export default function AllTestsPage() {
  const tests = getAllTests();
  const items: CatalogItem[] = tests.map((t) => ({
    slug: t.slug,
    title: t.title,
    description: t.description,
    category: t.category,
    minutes: t.minutes,
    questions: t.questions.length,
  }));
  const categories: CatalogCategory[] = CATEGORY_ORDER.map((key) => ({
    key,
    title: CATEGORIES[key].title,
    count: tests.filter((t) => t.category === key).length,
    slug: CATEGORY_PAGES[key].slug,
  }));

  return (
    <>
      <Breadcrumbs items={[{ name: "Главная", href: "/" }, { name: "Все тесты", href: "/tests" }]} />
      <h1>Тесты</h1>
      <p className="lead">
        {tests.length} методик. У каждой указано, что она измеряет, откуда взята и чего не показывает — это на
        странице научного паспорта.
      </p>

      <div className="note" style={{ margin: "16px 0 8px" }}>
        <b>Подборки:</b>{" "}
        {COLLECTIONS.map((c, i) => (
          <span key={c.slug}>
            {i > 0 && " · "}
            <Link href={`/podborki/${c.slug}`}>{c.h1}</Link>
          </span>
        ))}
      </div>

      <Suspense fallback={<div className="empty">Загрузка тестов…</div>}>
        <Catalog items={items} categories={categories} />
      </Suspense>
    </>
  );
}
