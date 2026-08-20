"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Test } from "@/lib/engine/schema";
import { decodeAnswers, score } from "@/lib/engine/score";
import { CRISIS_CONTACTS, CTA_COPY, SITE, platformLink } from "@/lib/site";
import { Icon } from "@/components/icons";

const RING_COLORS = ["#6d74f0", "#3aa5d8", "#1da36e", "#7e5cf3", "#ff5d8f"];

/**
 * Результат считается в браузере из токена в адресе: ответы никогда не уходят
 * на сервер. Ключи методик и без того опубликованы на страницах паспортов —
 * скрывать в этом продукте нечего (в отличие от профессионального кабинета).
 */
export default function ResultView({ test }: { test: Test }) {
  const params = useSearchParams();
  const token = params.get("r");
  const answers = token ? decodeAnswers(test, token) : null;

  if (!answers) {
    return (
      <>
        <h1>Ссылка не открылась</h1>
        <p className="lead">
          Похоже, ссылка повреждена или методика обновилась с момента прохождения. Восстановить результат нельзя —
          мы не храним ответы.
        </p>
        <p style={{ marginTop: 20 }}>
          <Link href={`/tests/${test.slug}/run`} className="btn">Пройти тест заново</Link>
        </p>
      </>
    );
  }

  const result = score(test, answers);
  const cta = CTA_COPY[test.ctaCluster];
  const sensitive = test.ctaCluster === "burnout" || test.ctaCluster === "anxiety";
  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  return (
    <>
      {result.crisis && (
        <div className="note crisis" style={{ marginBottom: 24 }}>
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

      <div className="result-head">
        <div>
          <span className="eyebrow">Ваш результат</span>
          <h1>{test.title}</h1>
          <p className="sub">Профиль из {result.scales.length} {plural(result.scales.length, "шкалы", "шкал", "шкал")} · пройден сегодня · ответы не сохранялись</p>
        </div>
        <div className="result-actions">
          <CopyLink url={shareUrl} sensitive={sensitive} />
          <a className="btn" href={platformLink({ campaign: test.slug, content: "result_cta" })} rel="noopener">
            {cta.button}
          </a>
        </div>
      </div>

      {/* 1g — дашборд с кольцами */}
      <div className="dash">
        {result.scales.map((scale, i) => (
          <div className="card dash-card" key={scale.id}>
            <div className="ring" style={{ "--p": scale.percent, "--c": RING_COLORS[i % RING_COLORS.length] } as CSSProperties}>
              <span className="inner">{scale.percent}%</span>
            </div>
            <div className="m-name">{scale.name}</div>
            <span className="chip band">{scale.band.label}</span>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <h3>Как читать профиль</h3>
          <p>
            Проценты — положение на шкале методики, а не оценка «хорошо/плохо». У каждой черты два полюса, и оба
            бывают сильной стороной: всё зависит от задач и контекста.
          </p>
          <div className="note warn" style={{ marginTop: 4 }}>
            <b>Это не диагноз.</b> Опросник показывает, как вы описали себя сегодня. {test.passport.limitations}
          </div>
        </div>
        <div className="cta-panel">
          <h3>{cta.title}</h3>
          <p>{cta.body}</p>
          <a className="btn" href={platformLink({ campaign: test.slug, content: "result_panel" })} rel="noopener">
            {cta.button} <Icon name="arrow" size={18} />
          </a>
        </div>
      </div>

      {/* 1f — подробные шкалы с полюсами */}
      <div className="section-head"><h2>Подробно по шкалам</h2></div>
      <div className="card scales-panel">
        <p className="muted small" style={{ marginBottom: 14 }}>Методика: {test.passport.origin}</p>
        {result.scales.map((scale) => (
          <div className="scale" key={scale.id}>
            <div className="head">
              <span className="name">{scale.name}</span>
              <span className="band">{scale.band.label} · {scale.percent}%</span>
            </div>
            <div className="track"><div className="fill" style={{ width: `${scale.percent}%` }} /></div>
            <div className="poles"><span>{scale.low}</span><span>{scale.high}</span></div>
            <p className="text">{scale.band.text}</p>
          </div>
        ))}
      </div>

      <div className="section-head"><h2>Что можно сделать самому</h2></div>
      <ul className="clean">
        {test.selfHelp.map((tip) => <li key={tip}>{tip}</li>)}
      </ul>

      <div className="card" style={{ marginTop: 26 }}>
        <h3>Сохранить результат</h3>
        <p className="muted" style={{ marginBottom: 14 }}>
          Мы не храним ответы: результат существует только в этой ссылке. Сохраните её, если хотите вернуться к
          результату или сравнить состояние через месяц-другой.
        </p>
        <CopyLink url={shareUrl} sensitive={sensitive} />
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/tests" className="btn secondary">Другие тесты</Link>
      </p>
    </>
  );
}

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function CopyLink({ url, sensitive }: { url: string; sensitive: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          setCopied(false);
        }
      }}
    >
      <Icon name="copy" size={17} />
      {copied ? "Ссылка скопирована" : sensitive ? "Скопировать, чтобы показать близкому" : "Скопировать ссылку"}
    </button>
  );
}
