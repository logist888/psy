import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COLLECTIONS, getCollection, CATEGORY_PAGES } from "@/lib/content";
import { SITE } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  return {
    title: collection.seoTitle,
    description: collection.description,
    alternates: { canonical: `${SITE.url}/podborki/${collection.slug}` },
    openGraph: { title: collection.seoTitle, description: collection.description, type: "website" },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection.h1,
    numberOfItems: collection.tests.length,
    itemListElement: collection.tests.map((test, i) => ({
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
          { name: collection.h1, href: `/podborki/${collection.slug}` },
        ]}
      />

      <h1>{collection.h1}</h1>
      <p className="lead">{collection.intro}</p>

      <div className="note">
        <p className="small" style={{ marginTop: 0 }}>{collection.note}</p>
        <ul className="clean" style={{ marginBottom: 0 }}>
          {collection.tests.map((test) => (
            <li key={test.slug}>
              <Link href={`/tests/${test.slug}`}>{test.title}</Link>{" "}
              <span className="muted small">
                · {test.questions.length} утв., {test.minutes} мин
              </span>
            </li>
          ))}
        </ul>
      </div>

      <section>
        <h2>Другие подборки</h2>
        <ul className="clean">
          {COLLECTIONS.filter((c) => c.slug !== collection.slug).map((c) => (
            <li key={c.slug}>
              <Link href={`/podborki/${c.slug}`}>{c.h1}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Разделы каталога</h2>
        <ul className="clean">
          {Object.values(CATEGORY_PAGES).map((page) => (
            <li key={page.slug}>
              <Link href={`/kategorii/${page.slug}`}>{page.h1}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
