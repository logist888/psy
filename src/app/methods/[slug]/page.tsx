import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTests, getTest } from "@/lib/content";
import { SITE, platformLink } from "@/lib/site";
import ExpertCta from "@/components/ExpertCta";

export function generateStaticParams() {
  return getAllTests().map((t) => ({ slug: t.slug }));
}

const BASIS: Record<string, string> = {
  public_domain: "Общественное достояние",
  own_work: "Собственная разработка проекта",
  license: "Используется по лицензии",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) return {};
  return {
    title: `${test.title}: методика, шкалы, ограничения`,
    description: `Научный паспорт методики «${test.title}»: что измеряет, происхождение, надёжность, ограничения и правовой статус.`,
    alternates: { canonical: `${SITE.url}/methods/${test.slug}` },
  };
}

export default async function MethodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) notFound();

  return (
    <>
      <h1>{test.title}: научный паспорт</h1>
      <div className="meta">
        <span>{BASIS[test.passport.rightsBasis]}</span>
        <span>{test.questions.length} пунктов</span>
        <span>{test.scales.length} шкал(ы)</span>
      </div>

      <h2>Что измеряет</h2>
      <p>{test.passport.measures}</p>

      <h2>Происхождение</h2>
      <p>{test.passport.origin}</p>

      <h2>Психометрический статус</h2>
      <p>{test.passport.reliability}</p>

      <h2>Ограничения</h2>
      <p>{test.passport.limitations}</p>

      <h2>Правовое основание использования</h2>
      <p>{test.passport.rightsNote}</p>

      <h2>Шкалы и интерпретация</h2>
      {test.scales.map((scale) => (
        <section key={scale.id}>
          <h3>{scale.name}</h3>
          <p className="small muted">
            Низкий полюс: {scale.low}. Высокий полюс: {scale.high}.
          </p>
          <ul className="clean small">
            {scale.bands.map((band) => (
              <li key={band.label}>
                <strong>от {band.from}% — {band.label}:</strong> {band.text}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h2>Как считается результат</h2>
      <p className="small">
        Ответы переводятся в баллы по шкале вариантов, обратные пункты инвертируются, баллы суммируются по каждой
        шкале и переводятся в процент от её максимума. Расчёт детерминирован: одни и те же ответы всегда дают
        одинаковый результат. Нейросети в подсчёте не участвуют.
      </p>

      <div className="cta">
        <h2>Работаете с клиентами?</h2>
        <p>
          Эту методику можно дать клиенту ссылкой — он пройдёт бесплатно и анонимно, а вы начнёте встречу с готовым
          профилем. Консультации можно вести на {SITE.platform.name}.
        </p>
        <p>
          <ExpertCta href={platformLink({ campaign: `method_${test.slug}`, content: "expert" })} placement="method_passport">
            Подробнее для специалистов
          </ExpertCta>
        </p>
      </div>

      <p>
        <Link href={`/tests/${test.slug}`} className="btn secondary">
          Открыть тест
        </Link>
      </p>
    </>
  );
}
