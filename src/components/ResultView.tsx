"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Test } from "@/lib/engine/schema";
import { decodeAnswers, score } from "@/lib/engine/score";
import { CRISIS_CONTACTS, CTA_COPY, SITE, platformLink } from "@/lib/site";
import RelatedTests from "./RelatedTests";
import { track } from "@/lib/analytics";
import { addToHistory, formatSince, getPrevious } from "@/lib/history";

/**
 * Результат считается в браузере из токена в адресе: ответы никогда не уходят
 * на сервер. Ключи методик и без того опубликованы на страницах паспортов —
 * скрывать в этом продукте нечего (в отличие от профессионального кабинета).
 */
export default function ResultView({ test, related = [] }: { test: Test; related?: Test[] }) {
  const params = useSearchParams();
  const token = params.get("r");
  const answers = token ? decodeAnswers(test, token) : null;
  const result = answers ? score(test, answers) : null;

  const [previous, setPrevious] = useState<{ scales: typeof result extends null ? never : ReturnType<typeof score>["scales"]; since: string } | null>(null);

  useEffect(() => {
    if (!result || !token) return;
    track({ name: "result_view", test: test.slug });
    if (result.crisis) track({ name: "crisis_shown", test: test.slug });

    // Динамика: находим прошлый замер этой же методики и пересчитываем его
    // из сохранённого токена — сравнение появляется без единого запроса.
    const prev = getPrevious(test.slug, token);
    if (prev) {
      const prevAnswers = decodeAnswers(test, prev.token);
      if (prevAnswers) {
        setPrevious({ scales: score(test, prevAnswers).scales, since: formatSince(prev.at, Date.now()) });
      }
    }
    addToHistory(test.slug, token, Date.now());
  }, [result, test, token]);

  if (!answers || !result) {
    return (
      <>
        <h1>Ссылка не открылась</h1>
        <p className="lead">
          Похоже, ссылка повреждена или методика обновилась с момента прохождения. Восстановить результат нельзя —
          мы не храним ответы.
        </p>
        <p>
          <Link href={`/tests/${test.slug}/run`} className="btn">
            Пройти тест заново
          </Link>
        </p>
      </>
    );
  }

  const cta = CTA_COPY[test.ctaCluster];
  const sensitive = test.ctaCluster === "burnout" || test.ctaCluster === "anxiety";
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

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

      <p className="muted small">Методика: {test.passport.origin}</p>

      {previous && (
        <div className="note">
          <p style={{ margin: 0 }}>
            Вы проходили этот тест {previous.since}. Изменения показаны рядом с каждой шкалой в процентных
            пунктах. Помните, что часть разницы — обычные колебания состояния, а не устойчивый сдвиг.
          </p>
        </div>
      )}

      <section style={{ marginTop: 24 }}>
        {result.scales.map((scale) => (
          <div className="scale" key={scale.id}>
            <div className="head">
              <span className="name">{scale.name}</span>
              <span className="band">
                {scale.band.label} · {scale.percent}%
                {(() => {
                  const before = previous?.scales.find((s) => s.id === scale.id);
                  if (!before) return null;
                  const delta = scale.percent - before.percent;
                  if (delta === 0) return <span className="delta"> · без изменений</span>;
                  return (
                    <span className="delta">
                      {" "}
                      · {delta > 0 ? "+" : "−"}
                      {Math.abs(delta)} п. п.
                    </span>
                  );
                })()}
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
          Опросник показывает, как вы описали себя сегодня, — не более. {test.passport.limitations} Поставить диагноз
          может только специалист при личной встрече.
        </p>
      </div>

      {/* Практические шаги идут ДО предложения специалиста: так CTA читается как
          следующий шаг, а не как продажа испуга (docs/research/synthetic-interviews.md). */}
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
            href={platformLink({ campaign: test.slug, content: "result_cta" })}
            rel="noopener"
            onClick={() =>
              track({ name: "cta_click", test: test.slug, cluster: test.ctaCluster, placement: "result" })
            }
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
      <CopyLink url={shareUrl} sensitive={sensitive} onCopied={() => track({ name: "result_share", test: test.slug })} />

      <RelatedTests tests={related} title="Пройдите также" />

      <p style={{ marginTop: 24 }}>
        <Link href="/" className="btn secondary">
          Все тесты
        </Link>
      </p>
    </>
  );
}

function CopyLink({ url, sensitive, onCopied }: { url: string; sensitive: boolean; onCopied?: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <p>
      <button
        className="btn secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            onCopied?.();
            setTimeout(() => setCopied(false), 2500);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied
          ? "Ссылка скопирована"
          : sensitive
            ? "Скопировать ссылку, чтобы показать близкому"
            : "Скопировать ссылку на результат"}
      </button>
    </p>
  );
}
