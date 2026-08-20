import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTests, getTest } from "@/lib/content";
import { CATEGORIES } from "@/lib/categories";
import { SITE } from "@/lib/site";
import { Icon, CATEGORY_META } from "@/components/icons";

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

  const view = CATEGORY_META[test.category];
  const category = CATEGORIES[test.category];
  const related = getAllTests()
    .filter((t) => t.slug !== test.slug)
    .sort((a, b) => (a.category === test.category ? -1 : 0) - (b.category === test.category ? -1 : 0))
    .slice(0, 3);

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

      <div className="crumbs">
        <Link href="/">Главная</Link> ·
        <Link href={`/tests?category=${test.category}`}>{category.title}</Link> ·
        <span>{test.title}</span>
      </div>

      <div className={`detail ${view.className}`}>
        <div className="main">
          <div className="badges">
            <span className="chip cat">{category.title}</span>
            <span className="chip success"><Icon name="reliability" size={14} /> Открытый научный паспорт</span>
          </div>
          <h1>{test.title}</h1>
          <p className="lead">{test.description}</p>

          <div className="panel">
            <h2>Что измеряет</h2>
            <p style={{ marginBottom: 20 }}>{test.passport.measures}</p>
            {test.scales.map((s) => (
              <div className="measure" key={s.id}>
                <span className="m-name">{s.name}</span>
                <span className="m-track"><i style={{ width: "100%" }} /></span>
                <span className="m-poles">{s.low} ↔ {s.high}</span>
              </div>
            ))}
            <p className="hint">Каждая шкала — спектр между двумя полюсами. Результат покажет ваше положение на нём.</p>
          </div>

          <div className="panel">
            <h3>Откуда методика</h3>
            <p>{test.passport.origin}</p>
            <p className="small muted" style={{ marginBottom: 14 }}>{test.passport.rightsNote}</p>
            <Link href={`/methods/${test.slug}`}>Полный научный паспорт <Icon name="arrow" size={15} /></Link>
          </div>

          <div className="panel">
            <h3>Насколько результату можно верить</h3>
            <p style={{ margin: 0 }}>{test.passport.reliability}</p>
          </div>

          <div className="note warn">
            <b>⚠ Чего этот тест не делает.</b> {test.passport.limitations}
          </div>
        </div>

        <aside>
          <div className="card launch">
            <div className="art"><Icon name={view.icon} size={84} /></div>
            <div className="facts">
              <span className="f"><Icon name="list" size={17} /> {test.questions.length} утверждений</span>
              <span className="f"><Icon name="clock" size={17} /> ≈ {test.minutes} минут</span>
              <span className="f"><Icon name="shield" size={17} /> Анонимно</span>
              <span className="f"><Icon name="star" size={17} /> Бесплатно</span>
            </div>
            <Link href={`/tests/${test.slug}/run`} className="btn block lg">Начать тест <Icon name="arrow" size={18} /></Link>
            <p className="caption">Прогресс сохраняется на этом устройстве</p>
          </div>

          {related.length > 0 && (
            <div className="card also">
              <h3>Пройдите также</h3>
              {related.map((r) => (
                <Link key={r.slug} href={`/tests/${r.slug}`}>
                  {r.title} <span>{r.questions.length} утв.</span>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
