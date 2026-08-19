import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTests, getTest, getRelatedTests, getConstructsForTest } from "@/lib/content";
import { SITE } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedTests from "@/components/RelatedTests";

export function generateStaticParams() {
  return getAllTests().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) return {};
  return {
    title: test.seoTitle,
    description: test.description,
    alternates: { canonical: `${SITE.url}/tests/${test.slug}` },
    openGraph: { title: test.seoTitle, description: test.description, type: "website" },
  };
}

export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) notFound();

  const related = getRelatedTests(test.slug);
  const hubs = getConstructsForTest(test.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: test.title,
    description: test.description,
    educationalLevel: "beginner",
    about: { "@type": "Thing", name: test.passport.measures },
    numberOfQuestions: test.questions.length,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: test.title, href: `/tests/${test.slug}` },
        ]}
      />
      <h1>{test.title}</h1>
      <div className="meta">
        <span>{test.questions.length} утверждений</span>
        <span>≈ {test.minutes} мин</span>
        <span>Бесплатно и анонимно</span>
      </div>
      <p className="lead">{test.description}</p>

      <p>
        <Link href={`/tests/${test.slug}/run`} className="btn">
          Начать тест
        </Link>
      </p>

      <h2>Что измеряет</h2>
      <p>{test.passport.measures}</p>

      <h2>Шкалы</h2>
      <ul className="clean">
        {test.scales.map((s) => (
          <li key={s.id}>
            <strong>{s.name}</strong> — от «{s.low}» до «{s.high}».
          </li>
        ))}
      </ul>

      <h2>Откуда методика</h2>
      <p>{test.passport.origin}</p>
      <p className="small muted">{test.passport.rightsNote}</p>

      <h2>Насколько результату можно верить</h2>
      <p>{test.passport.reliability}</p>

      <div className="note warn">
        <h3>Чего этот тест не делает</h3>
        <p style={{ margin: 0 }}>{test.passport.limitations}</p>
      </div>

      <p style={{ marginTop: 28 }}>
        <Link href={`/tests/${test.slug}/run`} className="btn">
          Начать тест
        </Link>
      </p>
      <p className="small muted">
        Подробный научный паспорт методики — на <Link href={`/methods/${test.slug}`}>отдельной странице</Link>.
      </p>

      {hubs.length > 0 && (
        <p className="small">
          Разбор темы:{" "}
          {hubs.map((hub, i) => (
            <span key={hub.slug}>
              {i > 0 && ", "}
              <Link href={`/constructs/${hub.slug}`}>{hub.title}</Link>
            </span>
          ))}
        </p>
      )}

      <RelatedTests tests={related} />
    </>
  );
}
