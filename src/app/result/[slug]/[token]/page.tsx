import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTest } from "@/lib/content";
import { decodeAnswers, score } from "@/lib/engine/score";
import { CRISIS_CONTACTS, CTA_COPY, SITE, platformLink } from "@/lib/site";
import ResultActions from "@/components/ResultActions";

export const metadata: Metadata = {
  // Страницы результатов не индексируются: они персональные и бесполезны в выдаче.
  robots: { index: false, follow: false },
  title: "Ваш результат",
};

export default async function ResultPage({ params }: { params: Promise<{ slug: string; token: string }> }) {
  const { slug, token } = await params;
  const test = getTest(slug);
  if (!test) notFound();

  const answers = decodeAnswers(test, decodeURIComponent(token));
  if (!answers) {
    return (
      <>
        <h1>Ссылка не открылась</h1>
        <p className="lead">
          Похоже, ссылка повреждена или методика обновилась с момента прохождения. Результат восстановить нельзя —
          мы не храним ответы на сервере.
        </p>
        <p>
          <Link href={`/tests/${test.slug}/run`} className="btn">
            Пройти тест заново
          </Link>
        </p>
      </>
    );
  }

  const result = score(test, answers);
  const cta = CTA_COPY[test.ctaCluster];
  const sensitive = test.ctaCluster === "burnout" || test.ctaCluster === "anxiety";
  const url = `${SITE.url}/result/${test.slug}/${token}`;

  return (
    <>
      <h1>{test.title}: ваш результат</h1>

      {result.crisis && (
        <div className="note crisis">
          <h3>Если сейчас тяжело — можно позвонить прямо сейчас</h3>
          <p>
            Судя по одному из ваших ответов, вам может быть по-настоящему плохо. Мы не служба помощи и не можем
            оценить ваше состояние, но вот те, кто может — бесплатно и круглосуточно:
          </p>
          <ul className="clean">
            {CRISIS_CONTACTS.map((contact) => (
              <li key={contact.value}>
                <strong>{contact.value}</strong> — {contact.name}
                {contact.note ? ` (${contact.note})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="muted small">
        Методика: {test.passport.origin}
      </p>

      <section style={{ marginTop: 24 }}>
        {result.scales.map((scale) => (
          <div className="scale" key={scale.id}>
            <div className="head">
              <span className="name">{scale.name}</span>
              <span className="band">
                {scale.band.label} · {scale.percent}%
              </span>
            </div>
            <div className="track">
              <div className="fill" style={{ width: `${scale.percent}%` }} />
            </div>
            <div className="poles">
              <span>{scale.low}</span>
              <span style={{ textAlign: "right" }}>{scale.high}</span>
            </div>
            <p className="text">{scale.band.text}</p>
          </div>
        ))}
      </section>

      <div className="note warn">
        <h3>Это не диагноз</h3>
        <p style={{ margin: 0 }}>
          Опросник показывает, как вы описали себя сегодня, — не более. {test.passport.limitations} Поставить
          диагноз может только специалист при личной встрече.
        </p>
      </div>

      {/* Практические шаги идут ДО предложения специалиста: так CTA читается как
          следующий шаг, а не как продажа испуга (инсайт синтетических интервью). */}
      <h2>Что можно сделать самому</h2>
      <ul className="clean">
        {test.selfHelp.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>

      <div className="cta">
        <h2>{cta.title}</h2>
        <p>{cta.body}</p>
        <p>
          <a
            className="btn"
            href={platformLink({ campaign: test.slug, content: "result_cta", path: "/" })}
            rel="noopener"
          >
            {cta.button}
          </a>
        </p>
        <p className="small muted" style={{ margin: 0 }}>
          Специалисты на {SITE.platform.name}: видно образование, опыт и цену консультации. Запись онлайн, без
          звонков.
        </p>
      </div>

      <h2>Сохранить результат</h2>
      <p className="small muted">
        Мы не храним ответы: результат существует только в этой ссылке. Сохраните её, если хотите вернуться к
        результату или сравнить состояние через месяц-другой.
      </p>
      <ResultActions url={url} sensitive={sensitive} />

      <p style={{ marginTop: 24 }}>
        <Link href="/" className="btn secondary">
          Другие тесты
        </Link>
      </p>
    </>
  );
}
