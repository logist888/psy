import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllConstructs, getConstruct, getTest } from "@/lib/content";
import { SITE, platformLink } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";

export function generateStaticParams() {
  return getAllConstructs().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const construct = getConstruct(slug);
  if (!construct) return {};
  return {
    title: construct.seoTitle,
    description: construct.description,
    alternates: { canonical: `${SITE.url}/constructs/${construct.slug}` },
    openGraph: { title: construct.seoTitle, description: construct.description, type: "article" },
  };
}

export default async function ConstructPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const construct = getConstruct(slug);
  if (!construct) notFound();

  const tests = construct.tests.map((s) => getTest(s)).filter((t) => t !== undefined);

  // FAQPage: вопросы в выдаче — то немногое из информационного интента,
  // что ещё приносит клики, когда обзорный текст съеден AI-ответом.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: construct.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Темы", href: "/constructs" },
          { name: construct.title, href: `/constructs/${construct.slug}` },
        ]}
      />

      <h1>{construct.seoTitle}</h1>
      <p className="lead">{construct.intro}</p>

      {tests.length > 0 && (
        <div className="note">
          <h2 style={{ marginTop: 0 }}>Проверить себя</h2>
          <ul className="clean" style={{ marginBottom: 0 }}>
            {tests.map((test) => (
              <li key={test.slug}>
                <Link href={`/tests/${test.slug}`}>{test.title}</Link>{" "}
                <span className="muted small">· {test.minutes} мин, бесплатно</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {construct.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}

      <h2>Частые вопросы</h2>
      {construct.faq.map((item) => (
        <section key={item.q}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </section>
      ))}

      <div className="cta">
        <h2>Обсудить свою ситуацию со специалистом</h2>
        <p>
          Статья описывает общую картину, а ваш случай всегда конкретнее. Психолог поможет разобраться, что
          происходит именно у вас, и с чего начинать.
        </p>
        <p>
          <a className="btn" href={platformLink({ campaign: `construct_${construct.slug}`, content: "hub_cta" })} rel="noopener">
            Найти психолога
          </a>
        </p>
        <p className="small muted" style={{ margin: 0 }}>
          Специалисты на {SITE.platform.name}: видно образование, опыт и цену консультации. Запись онлайн, без звонков.
        </p>
      </div>
    </>
  );
}
