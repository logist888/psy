import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllTests } from "@/lib/content";
import { SITE } from "@/lib/site";
import Catalog, { type CatalogItem } from "@/components/Catalog";

export const metadata: Metadata = {
  title: "Все тесты",
  description:
    "Каталог бесплатных психологических тестов с открытой методологией. Фильтры по темам и длительности, у каждой методики — научный паспорт.",
  alternates: { canonical: `${SITE.url}/tests` },
};

export default function TestsPage() {
  const items: CatalogItem[] = getAllTests().map((t) => ({
    slug: t.slug,
    title: t.title,
    description: t.description,
    category: t.category,
    minutes: t.minutes,
    questions: t.questions.length,
  }));

  return (
    <Suspense fallback={<div className="empty">Загрузка тестов…</div>}>
      <Catalog items={items} />
    </Suspense>
  );
}
