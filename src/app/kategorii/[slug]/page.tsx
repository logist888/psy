import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CATEGORY_PAGES,
  getCategoryBySlug,
  getTestsByCategory,
  getAllConstructs,
} from "@/lib/content";
import type { Test } from "@/lib/engine/schema";
import { SITE } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import Icon, { type IconName } from "@/components/Icon";
import Motif from "@/components/Motif";

const CATEGORY_ICON: Record<Test["category"], IconName> = {
  personality: "personality",
  wellbeing: "wellbeing",
  relationships: "relationships",
  career: "career",
  values: "values",
};

export function generateStaticParams() {
  return Object.values(CATEGORY_PAGES).map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  const page = CATEGORY_PAGES[category];
  return {
    title: page.seoTitle,
    description: page.description,
    alternates: { canonical: `${SITE.url}/kategorii/${page.slug}` },
    openGraph: { title: page.seoTitle, description: page.description, type: "website" },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const page = CATEGORY_PAGES[category];
  const tests = getTestsByCategory(category);
  // Темы, которые опираются на тесты этого раздела — вход в информационный интент
  const testSlugs = new Set(tests.map((t) => t.slug));
  const hubs = getAllConstructs().filter((c) => c.tests.some((s) => testSlugs.has(s)));

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: page.h1,
    numberOfItems: tests.length,
    itemListElement: tests.map((test, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/tests/${test.slug}`,
      name: test.title,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Все тесты", href: "/tests" },
          { name: page.h1, href: `/kategorii/${page.slug}` },
        ]}
      />

      <div className="hero">
        <div>
          <h1 className="with-icon">
            <Icon name={CATEGORY_ICON[category]} size={28} />
            {page.h1}
          </h1>
          <p className="lead">{page.intro}</p>
        </div>
        <Motif seed={page.slug} bars={5} width={200} className="hero-motif" />
      </div>

      <div className="note">
        <h2 className="with-icon" style={{ marginTop: 0 }}>
          <Icon name="list" />
          {tests.length} {plural(tests.length, "тест", "теста", "тестов")} в разделе
        </h2>
        <ul className="clean" style={{ marginBottom: 0 }}>
          {tests.map((test) => (
            <li key={test.slug}>
              <Link href={`/tests/${test.slug}`}>{test.title}</Link>{" "}
              <span className="muted small">
                · {test.questions.length} утв., {test.minutes} мин
              </span>
            </li>
          ))}
        </ul>
      </div>

      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}

      {hubs.length > 0 && (
        <section>
          <h2 className="with-icon">
            <Icon name="topic" />
            Разборы по темам
          </h2>
          <p className="muted small">
            Если нужен не тест, а понимание — эти страницы разбирают темы раздела подробно.
          </p>
          <ul className="clean">
            {hubs.map((hub) => (
              <li key={hub.slug}>
                <Link href={`/constructs/${hub.slug}`}>{hub.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Другие разделы</h2>
        <ul className="clean">
          {(Object.keys(CATEGORY_PAGES) as Test["category"][])
            .filter((key) => key !== category)
            .map((key) => (
              <li key={key}>
                <Link href={`/kategorii/${CATEGORY_PAGES[key].slug}`}>{CATEGORY_PAGES[key].h1}</Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}

/** Русское склонение после числа: 1 тест, 2 теста, 5 тестов. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = n % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}
